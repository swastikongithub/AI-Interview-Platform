import { 
  Interview, 
  InterviewSession, 
  InterviewResponse, 
  Evaluation, 
  InterviewStatus,
  SessionStatus,
  EvaluationStatus,
  InterviewQuestion,
  UserRole
} from '../types';
import { supabase, isRealSupabase } from './supabase.service';

export class InterviewsService {
  
  static async createInterview(data: Partial<Interview>): Promise<Interview> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert([data])
      .select()
      .single();
      
    if (error) throw error;
    return interview as Interview;
  }

  static async getInterviewById(id: string): Promise<Interview | null> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Interview;
  }

  static async listInterviewsForCandidate(candidateId: string): Promise<Interview[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('scheduled_at', { ascending: false });
      
    if (error) throw error;
    return data as Interview[];
  }

  static async listInterviewsForInterviewer(interviewerId: string): Promise<Interview[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('interviewer_id', interviewerId)
      .order('scheduled_at', { ascending: false });
      
    if (error) throw error;
    return data as Interview[];
  }

  static async listAllInterviews(): Promise<Interview[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('scheduled_at', { ascending: false });
      
    if (error) throw error;
    return data as Interview[];
  }

  static async assignInterviewer(interviewId: string, interviewerId: string): Promise<Interview> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interviews')
      .update({ interviewer_id: interviewerId })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) throw error;

    // Assignment only promotes a draft to ready. Assigning a reviewer to an
    // in-progress or completed interview must not rewind its lifecycle.
    if ((data as Interview).status !== 'draft') return data as Interview;

    const { data: promoted, error: promoteError } = await supabase
      .from('interviews')
      .update({ status: 'ready' })
      .eq('id', interviewId)
      .eq('status', 'draft')
      .select()
      .single();

    if (promoteError) {
      // Status moved on concurrently (no draft row matched): return current state.
      if (promoteError.code === 'PGRST116') return (await this.getInterviewById(interviewId)) as Interview;
      throw promoteError;
    }
    return promoted as Interview;
  }

  static async cancelInterview(interviewId: string): Promise<Interview> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interviews')
      .update({ status: 'cancelled' })
      .eq('id', interviewId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Interview;
  }

  static async addQuestions(interviewId: string, questions: Partial<InterviewQuestion>[]): Promise<InterviewQuestion[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const questionsToInsert = questions.map(q => ({ ...q, interview_id: interviewId }));
    const { data, error } = await supabase
      .from('interview_questions')
      .insert(questionsToInsert)
      .select();
      
    if (error) throw error;
    return data as InterviewQuestion[];
  }

  static async startSession(interviewId: string, userId: string): Promise<InterviewSession> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data: sessionId, error } = await supabase.rpc('start_interview_session', {
      p_interview_id: interviewId,
      p_user_id: userId
    });

    if (error) throw error;

    const { data, error: fetchError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw fetchError;
    return data as InterviewSession;
  }

  static async listQuestionsForInterview(interviewId: string): Promise<InterviewQuestion[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('order', { ascending: true });
      
    if (error) throw error;
    return data as InterviewQuestion[];
  }

  static async getQuestionById(questionId: string): Promise<InterviewQuestion | null> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', questionId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as InterviewQuestion;
  }

  static async listSessionsForInterview(interviewId: string): Promise<InterviewSession[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data as InterviewSession[];
  }

  static async getSession(sessionId: string): Promise<InterviewSession | null> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as InterviewSession;
  }

  static async submitResponse(sessionId: string, questionId: string, responseText: string): Promise<InterviewResponse> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interview_responses')
      .insert([{
        session_id: sessionId,
        question_id: questionId,
        response_text: responseText
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data as InterviewResponse;
  }

  static async listResponsesForSession(sessionId: string): Promise<InterviewResponse[]> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', sessionId);
      
    if (error) throw error;
    return data as InterviewResponse[];
  }

  static async completeSession(sessionId: string, interviewId: string): Promise<void> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { error: sessionError } = await supabase
      .from('interview_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId);
      
    if (sessionError) throw sessionError;

    const { error: interviewError } = await supabase
      .from('interviews')
      .update({ status: 'completed' })
      .eq('id', interviewId);

    if (interviewError) throw interviewError;
  }

  static async getEvaluationByInterviewId(interviewId: string): Promise<Evaluation | null> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('interview_id', interviewId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Evaluation;
  }

  static async upsertEvaluation(evaluation: Partial<Evaluation> & { interview_id: string }): Promise<Evaluation> {
    if (!isRealSupabase || !supabase) throw new Error('Real Supabase connection is required.');
    
    // Fetch existing to get the ID if we don't have one
    if (!evaluation.id) {
      const existing = await this.getEvaluationByInterviewId(evaluation.interview_id);
      if (existing) {
        evaluation.id = existing.id;
      }
    }

    const { data, error } = await supabase
      .from('evaluations')
      .upsert([evaluation], { onConflict: 'id' })
      .select()
      .single();
      
    if (error) throw error;
    return data as Evaluation;
  }
}
