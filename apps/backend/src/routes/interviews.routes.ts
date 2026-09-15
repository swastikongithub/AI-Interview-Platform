import { Router, Response } from 'express';
import { authenticateUser } from '../middleware/auth';
import { InterviewsService } from '../services/interviews.service';
import { AuthenticatedRequest, UserRole } from '../types';
import { z } from 'zod';

const router = Router();

// Zod schemas for validation
const createInterviewSchema = z.object({
  application_id: z.string().uuid().optional(),
  type: z.enum(['practice', 'mock', 'technical', 'hr', 'live']),
  mode: z.enum(['text', 'voice', 'video']),
});

const assignInterviewerSchema = z.object({
  interviewer_id: z.string().uuid(),
});

const submitResponseSchema = z.object({
  question_id: z.string().uuid(),
  response_text: z.string().min(1),
});

const updateEvaluationSchema = z.object({
  technical_score: z.number().min(0).max(100).optional(),
  communication_score: z.number().min(0).max(100).optional(),
  coding_score: z.number().min(0).max(100).optional(),
  confidence_score: z.number().min(0).max(100).optional(),
  overall_score: z.number().min(0).max(100).optional(),
  summary: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

// Create Interview
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = createInterviewSchema.parse(req.body);
    const userId = req.user!.id;

    // Candidates can only create practice/mock interviews without an application
    if (req.user!.role === 'candidate') {
      if (data.type !== 'practice' && data.type !== 'mock') {
        return res.status(403).json({ error: 'Candidates can only create practice or mock interviews.' });
      }
      if (data.application_id) {
        return res.status(403).json({ error: 'Cannot attach application to self-created interview.' });
      }
    }

    const interview = await InterviewsService.createInterview({
      ...data,
      candidate_id: userId,
      status: 'ready', // Practice interviews are immediately ready
      scheduled_at: new Date().toISOString()
    });

    // Add some dummy questions for practice interviews
    await InterviewsService.addQuestions(interview.id, [
      {
        question_text: "Explain the difference between optimistic and pessimistic locking in database systems.",
        category: "System Design",
        difficulty: "hard",
        order: 1
      },
      {
        question_text: "What are the tradeoffs of using a microservices architecture compared to a monolith?",
        category: "Architecture",
        difficulty: "medium",
        order: 2
      }
    ]);

    return res.status(201).json(interview);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: err.message });
  }
});

// List Interviews
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    let interviews;

    if (user.role === 'candidate') {
      interviews = await InterviewsService.listInterviewsForCandidate(user.id);
    } else if (user.role === 'interviewer') {
      interviews = await InterviewsService.listInterviewsForInterviewer(user.id);
    } else {
      // Admin / Recruiter
      interviews = await InterviewsService.listAllInterviews();
    }
    
    return res.json(interviews);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Interview by ID
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = await InterviewsService.getInterviewById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    
    // RLS mirror: Candidate cannot access another candidate's interview
    if (req.user!.role === 'candidate' && interview.candidate_id !== req.user!.id) {
      return res.status(404).json({ error: 'Interview not found' }); // Same as RLS masking
    }
    // Interviewer can only access assigned interviews
    if (req.user!.role === 'interviewer' && interview.interviewer_id !== req.user!.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    return res.json(interview);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List Questions for Interview
router.get('/:id/questions', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = await InterviewsService.getInterviewById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    // Ensure candidate owns the interview
    if (req.user!.role === 'candidate' && interview.candidate_id !== req.user!.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    // Ensure interviewer is assigned
    if (req.user!.role === 'interviewer' && interview.interviewer_id !== req.user!.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const questions = await InterviewsService.listQuestionsForInterview(req.params.id);
    return res.json(questions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Assign Interviewer
router.patch('/:id/assign', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'recruiter') {
      return res.status(403).json({ error: 'Unauthorized to assign interviewers.' });
    }
    const data = assignInterviewerSchema.parse(req.body);
    const interview = await InterviewsService.assignInterviewer(req.params.id, data.interviewer_id);
    return res.json(interview);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: err.message });
  }
});

// Cancel Interview
router.patch('/:id/cancel', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = await InterviewsService.cancelInterview(req.params.id);
    return res.json(interview);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Start Session
router.post('/:id/sessions', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // If there is already a completed or in_progress session, it should fail
    // (Atomic check in start_interview_session will enforce this via unique index and states)
    const session = await InterviewsService.startSession(req.params.id, req.user!.id);
    return res.status(201).json(session);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List Sessions for Interview (newest first)
// Lets a candidate resume an in-progress attempt and lets reviewers locate the
// responses for an interview. Access mirrors GET /:id exactly.
router.get('/:id/sessions', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = await InterviewsService.getInterviewById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    if (req.user!.role === 'candidate' && interview.candidate_id !== req.user!.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    if (req.user!.role === 'interviewer' && interview.interviewer_id !== req.user!.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const sessions = await InterviewsService.listSessionsForInterview(req.params.id);
    return res.json(sessions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Session
router.get('/:id/sessions/:sessionId', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = await InterviewsService.getSession(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json(session);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Submit Response
router.post('/:id/sessions/:sessionId/responses', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = submitResponseSchema.parse(req.body);
    
    // Validate session belongs to this interview and is in progress
    const session = await InterviewsService.getSession(req.params.sessionId);
    if (!session || session.interview_id !== req.params.id) {
      return res.status(404).json({ error: 'Session not found for this interview' });
    }
    if (session.status !== 'in_progress') {
      return res.status(500).json({ error: 'Session is not in progress' });
    }

    // Validate question belongs to this interview
    const question = await InterviewsService.getQuestionById(data.question_id);
    if (!question || question.interview_id !== req.params.id) {
      return res.status(500).json({ error: 'Question does not belong to this interview' });
    }

    const response = await InterviewsService.submitResponse(req.params.sessionId, data.question_id, data.response_text);
    return res.status(201).json(response);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: err.message });
  }
});

// List Responses
router.get('/:id/sessions/:sessionId/responses', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = await InterviewsService.getSession(req.params.sessionId);
    if (!session || session.interview_id !== req.params.id) {
      return res.status(404).json({ error: 'Session not found for this interview' });
    }
    // Note: Candidates can fetch their own responses if they own the interview, 
    // but the session and interview ownership should technically be validated here
    const responses = await InterviewsService.listResponsesForSession(req.params.sessionId);
    return res.json(responses);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Complete Session
router.patch('/:id/sessions/:sessionId/complete', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await InterviewsService.completeSession(req.params.sessionId, req.params.id);
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Evaluation
router.get('/:id/evaluation', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const evaluation = await InterviewsService.getEvaluationByInterviewId(req.params.id);
    if (!evaluation) return res.status(404).json({ error: 'Evaluation not found' });

    // Candidate can only view completed evaluations
    if (req.user!.role === 'candidate') {
      if (evaluation.candidate_id !== req.user!.id || evaluation.status !== 'completed') {
        return res.status(404).json({ error: 'Evaluation not found' });
      }
    }
    // Interviewer can only view assigned evaluations
    if (req.user!.role === 'interviewer') {
       const interview = await InterviewsService.getInterviewById(req.params.id);
       if (interview?.interviewer_id !== req.user!.id) {
         return res.status(404).json({ error: 'Evaluation not found' });
       }
    }

    return res.json(evaluation);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update Evaluation
router.put('/:id/evaluation', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'interviewer') {
      return res.status(403).json({ error: 'Unauthorized to update evaluation.' });
    }

    const interview = await InterviewsService.getInterviewById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Interviewer A cannot read/update Interviewer B's evaluation
    if (req.user!.role === 'interviewer' && interview.interviewer_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to update this evaluation.' });
    }

    const data = updateEvaluationSchema.parse(req.body);
    const evaluation = await InterviewsService.upsertEvaluation({
      ...data,
      interview_id: req.params.id,
      candidate_id: interview.candidate_id,
      evaluated_by: req.user!.id,
    });
    return res.json(evaluation);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: err.message });
  }
});

export default router;
