import { Queue, Worker, Job as BullJob } from 'bullmq';
import Redis from 'ioredis';
import crypto from 'crypto';
import config from '../config';
import { logger } from '../utils/logger';
import { GeminiService } from './gemini.service';
import { SupabaseService } from './supabase.service';

export interface ResumeJobData {
  userId: string;
  pdfBase64: string;
  hash: string;
}

export class ResumeQueueService {
  private static queue: Queue | null = null;
  private static worker: Worker | null = null;
  private static redisConnection: Redis | null = null;


  static async init(): Promise<void> {
    if (!config.redis.isRealRedis) {
      throw new Error('FATAL: Real Redis connection is required for Resume Queue processing. Mock fallback is disabled.');
    }

    this.redisConnection = new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('resume-processing', {
      connection: this.redisConnection,
    });

    this.worker = new Worker(
      'resume-processing',
      async (job: BullJob<ResumeJobData>) => {
        await this.processJobData(job.data);
      },
      {
        connection: this.redisConnection,
        concurrency: 2,
      }
    );

    this.worker.on('failed', async (job, err) => {
      logger.error({ jobId: job?.id, err: err.message }, 'Resume worker job failed');
    });

    logger.info('Real BullMQ + Redis resume queue initialized');
  }

  static computeSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Enqueues a resume processing job.
   * Pushes to BullMQ with deterministic Job ID = hash.
   */
  static async enqueueJob(userId: string, buffer: Buffer, hash: string): Promise<string> {
    const jobData: ResumeJobData = {
      userId,
      pdfBase64: buffer.toString('base64'),
      hash,
    };

    if (!this.queue) {
        throw new Error('FATAL: BullMQ queue is not initialized.');
    }

    // Scope the deterministic job ID to the user: two different users uploading
    // byte-identical files (e.g. the same template resume) must not collide onto
    // the same BullMQ job, which would silently strand one user's profile in
    // 'processing' forever since only the winning enqueue's userId gets processed.
    const jobId = `resume-${userId}-${hash}`;
    await this.queue.add('process-resume', jobData, {
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });
    return jobId;
  }

  /**
   * Core worker processing logic.
   * 1. Extracts PDF text.
   * 2. Calls Gemini for Profile Extraction and ATS Scoring.
   * 3. Updates user's profile with 'complete' status on success.
   * 4. Updates profile with 'failed' status on error, leaving existing manual fields untouched.
   */
  static async processJobData(data: ResumeJobData): Promise<void> {
    const startTime = Date.now();
    const buffer = Buffer.from(data.pdfBase64, 'base64');

    try {
      logger.info({ userId: data.userId, hash: data.hash }, 'Processing resume job started');

      // 1. Parse PDF text
      const resumeText = await GeminiService.parsePdfBuffer(buffer);

      // 2. Extract profile and generate ATS report
      const [extracted, atsReport] = await Promise.all([
        GeminiService.extractProfileFromResume(resumeText),
        GeminiService.generateATSReport(resumeText),
      ]);

      const durationMs = Date.now() - startTime;

      // 3. Update profile row with extracted fields and complete status
      await SupabaseService.upsertProfile({
        user_id: data.userId,
        education: extracted.education || [],
        experience: extracted.experience || [],
        skills: extracted.skills || [],
        ats_score: atsReport.score,
        ats_report: atsReport,
        resume_status: 'complete',
        resume_hash: data.hash,
        resume_extracted_json: extracted,
        processing_completed_at: new Date().toISOString(),
        processing_duration_ms: durationMs,
      });

      logger.info(
        { userId: data.userId, durationMs, atsScore: atsReport.score },
        'Resume job completed successfully'
      );
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error(
        { userId: data.userId, hash: data.hash, err: err.message, durationMs },
        'Resume processing failed, setting recovery state'
      );

      // Enforce recovery state:
      // - Uploaded file remains stored
      // - Candidate can trigger reprocessing
      // - Manually entered profile fields untouched
      // - ats_report remains null
      await SupabaseService.upsertProfile({
        user_id: data.userId,
        resume_status: 'failed',
        resume_hash: data.hash,
        ats_report: null,
        processing_completed_at: new Date().toISOString(),
        processing_duration_ms: durationMs,
      });
    }
  }

  static async close(): Promise<void> {
    if (this.worker) await this.worker.close();
    if (this.queue) await this.queue.close();
    if (this.redisConnection) await this.redisConnection.quit();
  }
}
