import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { getTestBearerToken } from './helpers/testToken';
import { ResumeQueueService } from '../src/services/resumeQueue.service';
import { GeminiService } from '../src/services/gemini.service';
import * as pdfParse from 'pdf-parse';

// Fix pdf-parse error in tests by mocking it
vi.mock('pdf-parse', () => ({
  default: vi.fn().mockImplementation(async (buffer: Buffer) => {
    return { text: buffer.toString() };
  }),
}));

const CANDIDATE_ID = '11111111-1111-4111-8111-111111111111';
const RECRUITER_ID = '22222222-2222-4222-8222-222222222222';

describe('Phase 1: Resume & ATS Verification Suite (All 10 Items)', () => {
  let candidateToken: string;
  let recruiterToken: string;
  let quotaExhausted = false;

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(async () => {
    candidateToken = await getTestBearerToken(
      'candidate.demo@antigravity.dev',
      'password123',
      CANDIDATE_ID
    );
    recruiterToken = await getTestBearerToken(
      'recruiter.demo@antigravity.dev',
      'password123',
      RECRUITER_ID
    );
    await ResumeQueueService.init();
    if (ResumeQueueService.queue) {
      await ResumeQueueService.queue.drain();
      await ResumeQueueService.queue.clean(0, 1000, 'completed');
      await ResumeQueueService.queue.clean(0, 1000, 'failed');
      await ResumeQueueService.queue.clean(0, 1000, 'wait');
      await ResumeQueueService.queue.clean(0, 1000, 'active');
      await ResumeQueueService.queue.clean(0, 1000, 'delayed');
    }
    GeminiService.init();

    // Deliberate skip condition tied to quota specifically
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'ping',
      });
    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota')) {
        quotaExhausted = true;
        console.warn('\n======================================================================');
        console.warn('⚠️ SKIPPED: Gemini quota exhausted. Real AI tests could not run! ⚠️');
        console.warn('This is a deliberate guard. Real test coverage is missing until quota resets.');
        console.warn('======================================================================\n');
      }
    }
  });

  const uploadAndPoll = async (pdfText: string) => {
    const uploadRes = await request(app)
      .post('/api/v1/resume/upload')
      .set('Authorization', candidateToken)
      .attach('file', Buffer.from(pdfText), 'resume.pdf');

    if (uploadRes.status !== 202) {
      console.error('UPLOAD FAILED:', uploadRes.body);
    }
    expect(uploadRes.status).toBe(202);

    let statusRes;
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      statusRes = await request(app)
        .get('/api/v1/resume/status')
        .set('Authorization', candidateToken);
      
      if (statusRes.body.resume_status === 'complete' || statusRes.body.resume_status === 'failed') {
        break;
      }
    }
    return statusRes;
  };

  it('1. Upload & Parsing (Control): Complete valid resume should pass', async (ctx) => {
    if (quotaExhausted) return ctx.skip();
    const uniqueText = `Alex Candidate resume with experience in React TypeScript Node.js PostgreSQL Stanford University Summer 2023 Tech Corp intern ${Date.now()}`;
    const statusRes = await uploadAndPoll(uniqueText);
    console.log('TEST 1 STATUS RES:', statusRes?.body);
    expect(statusRes?.status).toBe(200);
    expect(statusRes?.body.resume_status).toBe('complete');
  }, 30000);

  it('2. Missing Fields (No degree/dates): Should persist explicit nulls', async (ctx) => {
    if (quotaExhausted) return ctx.skip();
    const uniqueText = `Sarah Blank resume. Experience at Initech as Developer. Education: MIT. ${Date.now()}`;
    const statusRes = await uploadAndPoll(uniqueText);
    expect(statusRes?.status).toBe(200);
    expect(statusRes?.body.resume_status).toBe('complete');
    const json = statusRes?.body.resume_extracted_json;
    expect(json.education[0].degree).toBeNull();
    expect(json.education[0].year).toBeNull();
  }, 30000);

  it('3. Missing Fields (No description): Should persist explicit nulls', async (ctx) => {
    if (quotaExhausted) return ctx.skip();
    const uniqueText = `Bob Tester. Education: Harvard University BS CS 2020. Experience: Google Software Engineer 2021-2023. Skills: Python Java ${Date.now()}`;
    const statusRes = await uploadAndPoll(uniqueText);
    expect(statusRes?.status).toBe(200);
    expect(statusRes?.body.resume_status).toBe('complete');
    const json = statusRes?.body.resume_extracted_json;
    expect(json.experience[0].description).toBeNull();
  }, 30000);

  it('4. Malformed AI Output (Negative Control): Should loudly fail', async () => {
    const statusRes = await uploadAndPoll('SIMULATE_AI_FAILURE');
    expect(statusRes?.body.resume_status).toBe('failed');
  }, 30000);

  it('5. Idempotency (Same Resume Hash): Should return cached report', async (ctx) => {
    if (quotaExhausted) return ctx.skip();
    const uniqueText = `Idempotency Candidate ${Date.now()}`;
    const firstRes = await uploadAndPoll(uniqueText);
    expect(firstRes?.status).toBe(200);
    expect(firstRes?.body.resume_status).toBe('complete');
    
    // Upload exact same text
    const secondRes = await uploadAndPoll(uniqueText);
    expect(secondRes?.status).toBe(200);
    expect(secondRes?.body.resume_status).toBe('complete');
    expect(secondRes?.body.dedup).toBe(true);
    expect(secondRes?.body.message).toContain('unchanged');
  }, 30000);

  it('6. Empty Resume (Edge Case): Should fail gracefully', async () => {
    const statusRes = await uploadAndPoll('   '); // Empty/whitespace
    expect(statusRes?.body.resume_status).toBe('failed');
  }, 30000);

  it('7. Mocked Valid AI Response: Test without hitting API', async () => {
    vi.spyOn(GeminiService, 'extractProfileFromResume').mockResolvedValueOnce({
      name: 'Mock Name',
      education: [],
      experience: [],
      skills: []
    });
    vi.spyOn(GeminiService, 'generateATSReport').mockResolvedValueOnce({
      version: '1',
      model: 'gemini-1.5-flash-latest',
      generatedAt: new Date().toISOString(),
      score: 80,
      missing_keywords: [],
      grammar_notes: [],
      improvement_suggestions: []
    });
    const statusRes = await uploadAndPoll(`Mock Test 7 ${Date.now()}`);
    expect(statusRes?.body.resume_status).toBe('complete');
  }, 30000);

  it('8. Mocked Malformed Resume Output: Missing required field', async () => {
    vi.spyOn(GeminiService, 'extractProfileFromResume').mockRejectedValueOnce(new Error('Validation error'));
    const statusRes = await uploadAndPoll(`Mock Test 8 ${Date.now()}`);
    expect(statusRes?.body.resume_status).toBe('failed');
  }, 30000);

  it('9. ATS Report Generation Failure', async () => {
    vi.spyOn(GeminiService, 'extractProfileFromResume').mockResolvedValueOnce({
      name: 'Mock Name',
      education: [],
      experience: [],
      skills: []
    });
    vi.spyOn(GeminiService, 'generateATSReport').mockRejectedValueOnce(new Error('ATS Error'));
    const statusRes = await uploadAndPoll(`Mock Test 9 ${Date.now()}`);
    expect(statusRes?.body.resume_status).toBe('failed');
  }, 30000);

  it('10. Very Large Resume (Edge Case)', async () => {
    const largeText = 'A'.repeat(50000) + ` ${Date.now()}`;
    const statusRes = await uploadAndPoll(largeText);
    // Might fail depending on the PDF parser / AI mock, but we just verify it completes or fails without crashing
    expect(['complete', 'failed']).toContain(statusRes?.body.resume_status);
  }, 30000);
});
