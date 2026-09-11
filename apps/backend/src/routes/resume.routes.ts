import { Router, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { authenticateUser, requireRole } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { ResumeQueueService } from '../services/resumeQueue.service';
import { createAnonClient, databaseConfig } from '../config/database';

const router = Router();

// Stricter rate limiting for AI resume processing endpoints (e.g., max 10 calls per hour per IP)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Rate limit exceeded for AI resume processing. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure multer for PDF in-memory buffer upload (max size 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF resume files are allowed'));
    }
  },
});

/**
 * POST /api/v1/resume/upload
 * Candidate-only endpoint to upload a PDF resume, compute SHA-256 hash for dedup,
 * store the file, and enqueue an asynchronous BullMQ processing job.
 */
router.post(
  '/upload',
  aiRateLimiter,
  authenticateUser,
  requireRole(['candidate']),
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const file = req.file;

      if (!file || !file.buffer) {
        res.status(400).json({ error: 'No valid PDF resume file uploaded' });
        return;
      }

      // Compute SHA-256 hash for idempotency and dedup
      const hash = ResumeQueueService.computeSha256(file.buffer);

      // Check existing candidate profile
      const existingProfile = await SupabaseService.getProfileByUserId(user.id);

      // Dedup check: If hash matches and ATS report exists, do NOT enqueue a new job
      if (
        existingProfile?.resume_hash === hash &&
        existingProfile?.resume_status === 'complete' &&
        existingProfile?.ats_report
      ) {
        res.status(200).json({
          status: 'complete',
          dedup: true,
          message: 'Resume hash unchanged; returned existing ATS report without re-processing.',
          resume_hash: hash,
          ats_report: existingProfile.ats_report,
          resume_extracted_json: existingProfile.resume_extracted_json,
        });
        return;
      }

      // 1. Upload file to Supabase storage 'resumes' private bucket
      try {
        await SupabaseService.uploadResumeFile(user.id, file.buffer, file.originalname);
      } catch (err: any) {
        res.status(500).json({ error: `Storage upload failed: ${err.message}` });
        return;
      }

      // 2. Set initial processing state on profile
      await SupabaseService.upsertProfile({
        user_id: user.id,
        resume_status: 'processing',
        resume_hash: hash,
        processing_started_at: new Date().toISOString(),
      });

      // 3. Enqueue async BullMQ job
      const jobId = await ResumeQueueService.enqueueJob(user.id, file.buffer, hash);

      res.status(202).json({
        status: 'processing',
        message: 'Resume uploaded successfully and enqueued for AI processing.',
        jobId,
        resume_hash: hash,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/v1/resume/status
 * Candidate-only endpoint to check resume processing status and retrieve ATS report.
 * Supports query param `?userId=` to verify RLS/RBAC isolation.
 */
router.get(
  '/status',
  authenticateUser,
  requireRole(['candidate']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const targetUserId = (req.query.userId as string) || user.id;

      // RLS/RBAC check: Candidates can only access their own resume data
      if (targetUserId !== user.id) {
        res.status(403).json({
          error: 'Forbidden: Candidates can only access their own resume data.',
        });
        return;
      }

      // RLS-scoped query via anon client if running against real Supabase
      if (databaseConfig.isRealSupabase) {
        const token = req.headers.authorization?.split(' ')[1];
        const anonClient = createAnonClient(token);
        if (anonClient) {
          const { data, error } = await anonClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            res.status(500).json({ error: error.message });
            return;
          }

          res.status(200).json({
            user_id: user.id,
            resume_status: data?.resume_status || 'none',
            ats_report: data?.ats_report || null,
            resume_hash: data?.resume_hash || null,
            resume_extracted_json: data?.resume_extracted_json || null,
            processing_started_at: data?.processing_started_at || null,
            processing_completed_at: data?.processing_completed_at || null,
            processing_duration_ms: data?.processing_duration_ms || null,
          });
          return;
        }
      }

      // Local mock fallback
      const profile = await SupabaseService.getProfileByUserId(user.id);
      res.status(200).json({
        user_id: user.id,
        resume_status: profile?.resume_status || 'none',
        ats_report: profile?.ats_report || null,
        resume_hash: profile?.resume_hash || null,
        resume_extracted_json: profile?.resume_extracted_json || null,
        processing_started_at: profile?.processing_started_at || null,
        processing_completed_at: profile?.processing_completed_at || null,
        processing_duration_ms: profile?.processing_duration_ms || null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
