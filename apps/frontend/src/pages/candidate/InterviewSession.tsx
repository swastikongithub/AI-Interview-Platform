import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { PageTransition } from '../../motion/PageTransition';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Interview, InterviewSession as IInterviewSession, InterviewQuestion, InterviewResponse } from '../../types';

export const InterviewSession: React.FC = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState('');

  const { data: interview } = useQuery<Interview>({
    queryKey: ['interview', id],
    queryFn: () => apiService.getInterviewById(id!),
    enabled: !!id,
  });

  const { data: session } = useQuery<IInterviewSession>({
    queryKey: ['session', sessionId],
    queryFn: () => apiService.getSession(id!, sessionId!),
    enabled: !!id && !!sessionId,
  });

  const { data: questions = [], isLoading: loadingQuestions } = useQuery<InterviewQuestion[]>({
    queryKey: ['questions', id],
    queryFn: () => apiService.getInterviewQuestions(id!),
    enabled: !!id,
  });

  const { data: responses = [], isLoading: loadingResponses } = useQuery<InterviewResponse[]>({
    queryKey: ['responses', sessionId],
    queryFn: () => apiService.getSessionResponses(id!, sessionId!),
    enabled: !!id && !!sessionId,
  });

  const submitResponseMutation = useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) => 
      apiService.submitResponse(id!, sessionId!, questionId, text),
    onSuccess: () => {
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['responses', sessionId] });
    }
  });

  const completeSessionMutation = useMutation({
    mutationFn: () => apiService.completeSession(id!, sessionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', id] });
      navigate(`/candidate/interviews/${id}/evaluation`);
    }
  });

  const isInitializing = loadingQuestions || loadingResponses || !session || !interview;

  if (isInitializing) {
    return (
      <PageTransition className="font-sans min-h-screen pb-32 pt-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-muted animate-pulse">Synchronizing State...</span>
      </PageTransition>
    );
  }

  // Calculate current progress
  const answeredQuestionIds = new Set(responses.map(r => r.question_id));
  const pendingQuestions = questions.filter(q => !answeredQuestionIds.has(q.id));
  
  const currentQuestion = pendingQuestions.length > 0 ? pendingQuestions[0] : null;
  const isAllAnswered = pendingQuestions.length === 0 && questions.length > 0;
  
  const progress = questions.length > 0 ? (responses.length / questions.length) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !answer.trim() || submitResponseMutation.isPending) return;
    submitResponseMutation.mutate({ questionId: currentQuestion.id, text: answer });
  };

  const handleComplete = () => {
    if (completeSessionMutation.isPending) return;
    completeSessionMutation.mutate();
  };

  return (
    <PageTransition className="font-sans min-h-screen flex flex-col">
      {/* Progress Header */}
      <header className="px-6 md:px-12 py-6 border-b border-line flex justify-between items-center sticky top-0 bg-paper/90 backdrop-blur-md z-50">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Session Active • {interview.mode}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            {responses.length} / {questions.length} Completed
          </span>
          <div className="w-32 h-1 bg-paper-pressed overflow-hidden">
            <div 
              className="h-full bg-ink transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 md:px-12 pt-24 pb-32">
        {questions.length === 0 ? (
          <div className="p-8 border border-red-500/20 bg-red-500/5 flex items-center gap-4 text-red-500 font-mono text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>No questions found for this interview. Please contact support.</span>
          </div>
        ) : currentQuestion ? (
          <Reveal key={currentQuestion.id} y={20} className="space-y-16">
            <div className="space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-accent border-b border-line pb-2 inline-block">
                Question {questions.findIndex(q => q.id === currentQuestion.id) + 1}
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-ink leading-tight">
                <MaskedTextReveal text={currentQuestion.question_text} delay={0.1} />
              </h2>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-paper-raised text-ink-muted text-[10px] font-mono uppercase tracking-widest">
                  {currentQuestion.category}
                </span>
                <span className="px-3 py-1 bg-paper-raised text-ink-muted text-[10px] font-mono uppercase tracking-widest">
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Draft your response here..."
                  disabled={submitResponseMutation.isPending}
                  className="w-full h-64 p-6 bg-paper-raised border border-line text-ink font-sans text-lg focus:outline-none focus:border-ink transition-colors resize-none disabled:opacity-50 placeholder-ink-faint"
                />
                {submitResponseMutation.isPending && (
                  <div className="absolute inset-0 bg-paper/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Analyzing...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!answer.trim() || submitResponseMutation.isPending}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper hover:bg-ink-muted transition-colors font-mono text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  <span>Submit Response</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </Reveal>
        ) : isAllAnswered ? (
          <Reveal y={20} className="space-y-12 text-center py-20">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-ink">Assessment Complete</h2>
              <p className="text-lg text-ink-muted font-sans max-w-lg mx-auto">
                You have provided responses to all questions. You may now finalize the session to trigger the evaluation process.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={completeSessionMutation.isPending}
              className="inline-flex items-center gap-3 px-8 py-4 border border-line bg-paper hover:bg-paper-raised transition-colors text-ink font-mono text-xs uppercase tracking-widest disabled:opacity-50 mx-auto"
            >
              {completeSessionMutation.isPending ? 'Finalizing...' : 'Complete Interview'}
            </button>
          </Reveal>
        ) : null}
      </main>
    </PageTransition>
  );
};
