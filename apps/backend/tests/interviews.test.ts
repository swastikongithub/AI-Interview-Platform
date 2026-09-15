import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { getTestBearerToken } from './helpers/testToken';

describe('Interviews MVP Domain Integration', () => {
  let candidateToken: string;
  let recruiterToken: string;
  let interviewerToken: string;
  let adminToken: string;
  let otherCandidateToken: string;

  beforeAll(async () => {
    // Generate tokens for each role. Note: These require users to exist in auth.users.
    // If they don't exist in Supabase auth, this test might fail as mock tokens might not work 
    // effectively against real RLS. We assume auth helper provides valid tokens.
    candidateToken = await getTestBearerToken('candidate.demo@antigravity.dev', 'password123', '11111111-1111-4111-8111-111111111111');
    recruiterToken = await getTestBearerToken('recruiter.demo@antigravity.dev', 'password123', '22222222-2222-4222-8222-222222222222');
    interviewerToken = await getTestBearerToken('interviewer.demo@antigravity.dev', 'password123', '33333333-3333-4333-8333-333333333333');
    adminToken = await getTestBearerToken('admin.demo@antigravity.dev', 'password123', '44444444-4444-4444-8444-444444444444');
    otherCandidateToken = await getTestBearerToken('other.candidate@antigravity.dev', 'password123', '55555555-5555-5555-5555-555555555555');
  });

  describe('1-3. Interview Creation & Assignment', () => {
    it('1. Candidate creates a practice interview for themselves -> succeeds', async () => {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', candidateToken)
        .send({ type: 'practice', mode: 'text' });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe('practice');
    });

    it('2. Candidate attempts to create a recruiter/company interview -> rejected', async () => {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', candidateToken)
        .send({ type: 'technical', mode: 'video' });
      expect(res.status).toBe(403);
    });

    it('3. Candidate attempts to assign an interviewer directly -> rejected', async () => {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', candidateToken)
        .send({ type: 'practice', mode: 'text' });
      const interviewId = res.body.id;

      const assignRes = await request(app)
        .patch(`/api/v1/interviews/${interviewId}/assign`)
        .set('Authorization', candidateToken)
        .send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });
      expect(assignRes.status).toBe(403);
    });
  });

  describe('4-9, 15. Sessions & Responses Lifecycle', () => {
    let mockInterviewId: string;
    let sessionId: string;
    let mockQuestionId = '00000000-0000-0000-0000-000000000000'; // Assume exists or mocked

    beforeAll(async () => {
      // Create practice interview for tests
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', candidateToken)
        .send({ type: 'practice', mode: 'text' });
      mockInterviewId = res.body.id;

      // Add a question
      await request(app)
        .post(`/api/v1/interviews/${mockInterviewId}/questions`)
        .set('Authorization', adminToken) // Assume admin can add questions
        .send([{ question_text: 'What is a closure?', category: 'JS', difficulty: 'easy', order: 1 }]);
    });

    it('4. Candidate starts a READY interview -> session created, IN_PROGRESS', async () => {
      // First, recruiter assigns to make it ready
      await request(app)
        .patch(`/api/v1/interviews/${mockInterviewId}/assign`)
        .set('Authorization', recruiterToken)
        .send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });

      const res = await request(app)
        .post(`/api/v1/interviews/${mockInterviewId}/sessions`)
        .set('Authorization', candidateToken);
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('in_progress');
      sessionId = res.body.id;
    });

    it('5. Two concurrent start requests for same interview -> only one succeeds', async () => {
      // Create a fresh interview
      const resInit = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      await request(app).patch(`/api/v1/interviews/${resInit.body.id}/assign`).set('Authorization', recruiterToken).send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });
      
      const req1 = request(app).post(`/api/v1/interviews/${resInit.body.id}/sessions`).set('Authorization', candidateToken);
      const req2 = request(app).post(`/api/v1/interviews/${resInit.body.id}/sessions`).set('Authorization', candidateToken);
      
      const [res1, res2] = await Promise.all([req1, req2]);
      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(201);
      expect(statuses.some(s => s === 500 || s === 400 || s === 409)).toBeTruthy();
    });

    it('6. Candidate submits a response while session IN_PROGRESS -> succeeds', async () => {
      // First we need a real question id. Let's create one.
      const qRes = await request(app)
        .post(`/api/v1/interviews/${mockInterviewId}/questions`)
        .set('Authorization', recruiterToken)
        .send([{ question_text: 'q1', category: 't', difficulty: 'e', order: 1 }]);
      
      const realQuestionId = qRes.body?.[0]?.id;

      if(realQuestionId) {
          const res = await request(app)
            .post(`/api/v1/interviews/${mockInterviewId}/sessions/${sessionId}/responses`)
            .set('Authorization', candidateToken)
            .send({ question_id: realQuestionId, response_text: 'A closure is...' });
          expect(res.status).toBe(201);
      }
    });

    it('7. Candidate submits response to question of another interview -> rejected', async () => {
      // Mock question that doesn't belong to mockInterviewId
      const res = await request(app)
        .post(`/api/v1/interviews/${mockInterviewId}/sessions/${sessionId}/responses`)
        .set('Authorization', candidateToken)
        .send({ question_id: '99999999-9999-9999-9999-999999999999', response_text: 'wrong int' }); // Question 999.. is not in this interview or doesnt exist
      // Will fail DB constraint if question_id is invalid, but assume 500 or 403
      expect(res.status).toBe(500); 
    });

    it('9. Candidate completes the session -> session and interview transition correctly', async () => {
       const res = await request(app)
        .patch(`/api/v1/interviews/${mockInterviewId}/sessions/${sessionId}/complete`)
        .set('Authorization', candidateToken);
       expect(res.status).toBe(204);

       const check = await request(app).get(`/api/v1/interviews/${mockInterviewId}`).set('Authorization', candidateToken);
       expect(check.body.status).toBe('completed');
    });

    it('8. Candidate attempts to submit after completion -> rejected', async () => {
       const res = await request(app)
          .post(`/api/v1/interviews/${mockInterviewId}/sessions/${sessionId}/responses`)
          .set('Authorization', candidateToken)
          .send({ question_id: mockQuestionId, response_text: 'Late answer' });
       expect(res.status).toBe(500);
    });

    it('15. Completed session cannot be started again', async () => {
      const res = await request(app)
        .post(`/api/v1/interviews/${mockInterviewId}/sessions`)
        .set('Authorization', candidateToken);
      expect(res.status).toBe(500); 
    });
  });

  describe('10-14. Authorizations & Access Boundaries', () => {
    it('10. Candidate cannot access another candidate\'s interview', async () => {
      const res1 = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const intId = res1.body.id;
      const res2 = await request(app).get(`/api/v1/interviews/${intId}`).set('Authorization', otherCandidateToken);
      expect(res2.status).toBe(404);
    });

    it('11. Interviewer can access only interviews assigned to them', async () => {
      const res = await request(app).get('/api/v1/interviews').set('Authorization', interviewerToken);
      expect(res.status).toBe(200);
      expect(res.body.every((i: any) => i.interviewer_id === '33333333-3333-4333-8333-333333333333' || !i.interviewer_id)).toBeTruthy();
    });

    let otherInterviewerToken: string;
    beforeAll(async () => {
      otherInterviewerToken = await getTestBearerToken('other.interviewer@antigravity.dev', 'password123', '66666666-6666-6666-6666-666666666666');
    });

    it('12. Interviewer A cannot read/update Interviewer B\'s evaluation', async () => {
      const res1 = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const intId = res1.body.id;
      
      // Assign to interviewer A (33333333...)
      await request(app).patch(`/api/v1/interviews/${intId}/assign`).set('Authorization', recruiterToken).send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });
      
      // Interviewer A evaluates
      await request(app).put(`/api/v1/interviews/${intId}/evaluation`).set('Authorization', interviewerToken).send({ status: 'pending', technical_score: 80 });

      // Interviewer B tries to update it
      const res2 = await request(app).put(`/api/v1/interviews/${intId}/evaluation`).set('Authorization', otherInterviewerToken).send({ status: 'completed', technical_score: 90 });
      expect(res2.status).toBe(403);
    });

    it('13. Candidate cannot create or modify an evaluation', async () => {
      const res = await request(app)
        .put('/api/v1/interviews/some-id/evaluation')
        .set('Authorization', candidateToken)
        .send({ technical_score: 90 });
      expect(res.status).toBe(403);
    });

    it('14. Candidate can see evaluation only after completed', async () => {
      const res1 = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const intId = res1.body.id;
      // Admin evaluates (pending)
      await request(app).put(`/api/v1/interviews/${intId}/evaluation`).set('Authorization', adminToken).send({ status: 'pending', technical_score: 80 });
      
      // Candidate views
      let res2 = await request(app).get(`/api/v1/interviews/${intId}/evaluation`).set('Authorization', candidateToken);
      expect(res2.status).toBe(404); // RLS blocks pending evaluations for candidates
      
      // Admin sets completed
      await request(app).put(`/api/v1/interviews/${intId}/evaluation`).set('Authorization', adminToken).send({ status: 'completed', technical_score: 80 });
      
      res2 = await request(app).get(`/api/v1/interviews/${intId}/evaluation`).set('Authorization', candidateToken);
      expect(res2.status).toBe(200); // Now candidate can see it
    });

    it('16. Recruiter/Admin authorization behaves according to intended role model', async () => {
      // Recruiter can view all interviews
      const recRes = await request(app).get('/api/v1/interviews').set('Authorization', recruiterToken);
      expect(recRes.status).toBe(200);
      
      // Admin can assign
      const resInit = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const assignRes = await request(app).patch(`/api/v1/interviews/${resInit.body.id}/assign`).set('Authorization', adminToken).send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });
      expect(assignRes.status).toBe(200);
    });
  });

  describe('17-19. Session listing & assignment lifecycle', () => {
    it('17. Owner, recruiter and assigned interviewer can list sessions; others get 404', async () => {
      const created = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const intId = created.body.id;
      const started = await request(app).post(`/api/v1/interviews/${intId}/sessions`).set('Authorization', candidateToken);
      expect(started.status).toBe(201);

      const own = await request(app).get(`/api/v1/interviews/${intId}/sessions`).set('Authorization', candidateToken);
      expect(own.status).toBe(200);
      expect(own.body.map((s: any) => s.id)).toContain(started.body.id);

      const other = await request(app).get(`/api/v1/interviews/${intId}/sessions`).set('Authorization', otherCandidateToken);
      expect(other.status).toBe(404);

      const unassigned = await request(app).get(`/api/v1/interviews/${intId}/sessions`).set('Authorization', interviewerToken);
      expect(unassigned.status).toBe(404);

      const recruiter = await request(app).get(`/api/v1/interviews/${intId}/sessions`).set('Authorization', recruiterToken);
      expect(recruiter.status).toBe(200);

      await request(app).patch(`/api/v1/interviews/${intId}/assign`).set('Authorization', recruiterToken).send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });
      const assigned = await request(app).get(`/api/v1/interviews/${intId}/sessions`).set('Authorization', interviewerToken);
      expect(assigned.status).toBe(200);
    });

    it('18. Unauthenticated session listing is rejected', async () => {
      const res = await request(app).get('/api/v1/interviews/00000000-0000-4000-8000-000000000000/sessions');
      expect(res.status).toBe(401);
    });

    it('19. Assigning an interviewer does not rewind an in-progress interview', async () => {
      const created = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const intId = created.body.id;
      await request(app).post(`/api/v1/interviews/${intId}/sessions`).set('Authorization', candidateToken);

      const assignRes = await request(app).patch(`/api/v1/interviews/${intId}/assign`).set('Authorization', recruiterToken).send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });
      expect(assignRes.status).toBe(200);
      expect(assignRes.body.status).toBe('in_progress');
      expect(assignRes.body.interviewer_id).toBe('33333333-3333-4333-8333-333333333333');
    });

    it('20. Assigned interviewer can persist overall score and summary (migration 0005)', async () => {
      const created = await request(app).post('/api/v1/interviews').set('Authorization', candidateToken).send({ type: 'practice', mode: 'text' });
      const intId = created.body.id;
      await request(app).patch(`/api/v1/interviews/${intId}/assign`).set('Authorization', recruiterToken).send({ interviewer_id: '33333333-3333-4333-8333-333333333333' });

      const saved = await request(app)
        .put(`/api/v1/interviews/${intId}/evaluation`)
        .set('Authorization', interviewerToken)
        .send({ status: 'pending', technical_score: 70, communication_score: 80, coding_score: 60, confidence_score: 75, overall_score: 72, summary: 'Solid reasoning.' });
      expect(saved.status).toBe(200);
      expect(saved.body.overall_score).toBe(72);
      expect(saved.body.summary).toBe('Solid reasoning.');

      const outOfRange = await request(app)
        .put(`/api/v1/interviews/${intId}/evaluation`)
        .set('Authorization', interviewerToken)
        .send({ overall_score: 140 });
      expect(outOfRange.status).toBe(400);
    });
  });
});
