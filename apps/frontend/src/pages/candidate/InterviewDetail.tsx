import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { PageTransition } from '../../motion/PageTransition';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { Badge } from '../../components/common/Badge';
import { ArrowLeft, Play, AlertCircle } from 'lucide-react';
import { Interview } from '../../types';

export const InterviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: interview, isLoading, error } = useQuery<Interview>({
    queryKey: ['interview', id],
    queryFn: () => apiService.getInterviewById(id!),
    enabled: !!id,
  });

  const startSessionMutation = useMutation({
    mutationFn: () => apiService.startInterviewSession(id!),
    onSuccess: (session) => {
      navigate(`/candidate/interviews/${id}/session/${session.id}`);
    },
  });

  const handleStart = () => {
    // If the backend handles idempotency/returns active session, it's safe to just call start
    startSessionMutation.mutate();
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'ready': return 'default';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <PageTransition className="font-sans min-h-screen pb-32 pt-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-muted animate-pulse">Initializing Interface...</span>
      </PageTransition>
    );
  }

  if (error || !interview) {
    return (
      <PageTransition className="font-sans min-h-screen pb-32 pt-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="p-8 border border-red-500/20 bg-red-500/5 flex items-center gap-4 text-red-500 font-mono text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load interview. It may not exist or you may not have access.</span>
        </div>
      </PageTransition>
    );
  }

  const isEligibleToStart = interview.status === 'ready' || interview.status === 'in_progress';
  const hasCompleted = interview.status === 'completed';

  return (
    <PageTransition className="font-sans min-h-screen pb-32">
      <section className="relative px-6 md:px-12 pt-32 pb-16 max-w-[1400px] mx-auto border-b border-line">
        <button 
          onClick={() => navigate('/candidate/interviews')}
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-ink-muted hover:text-ink transition-colors mb-12"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Directory</span>
        </button>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-ink-faint uppercase tracking-widest">
              ID: {interview.id.split('-')[0]}
            </span>
            <Badge variant={getStatusVariant(interview.status)}>
              {interview.status}
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight">
            <MaskedTextReveal text={`${interview.type} Assessment`} delay={0.1} />
          </h1>
          <Reveal delay={0.3} className="max-w-2xl text-xl text-ink-muted font-sans font-light">
            Scheduled for {new Date(interview.scheduled_at).toLocaleString()} • {interview.mode} mode
          </Reveal>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 grid grid-cols-1 md:grid-cols-12 gap-16">
        <main className="md:col-span-8 space-y-16">
          <Reveal delay={0.4} y={20} className="space-y-6">
            <h2 className="text-2xl font-serif text-ink border-b border-line pb-4">Session Parameters</h2>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Evaluation Type</span>
                <p className="font-sans text-ink capitalize">{interview.type}</p>
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Interface Mode</span>
                <p className="font-sans text-ink capitalize">{interview.mode}</p>
              </div>
            </div>
            <div className="pt-8 text-sm font-sans text-ink-muted leading-relaxed max-w-prose space-y-4">
              <p>
                This assessment is designed to evaluate your technical and analytical reasoning. 
                Ensure you are in a quiet environment before proceeding. The session state is maintained securely on our servers.
              </p>
              {interview.status === 'in_progress' && (
                <p className="text-accent font-medium">
                  You have an active session. Resuming will return you to your exact position.
                </p>
              )}
            </div>
          </Reveal>
        </main>
        
        <aside className="md:col-span-4 space-y-8">
          <Reveal delay={0.5} y={20} className="p-8 border border-line bg-paper-raised space-y-8">
            <h3 className="font-mono text-xs uppercase tracking-widest text-ink border-b border-line pb-4">Action Required</h3>
            
            {isEligibleToStart && (
              <div className="space-y-4">
                <button
                  onClick={handleStart}
                  disabled={startSessionMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-ink text-paper hover:bg-ink-muted transition-colors font-mono text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {startSessionMutation.isPending ? 'Initializing...' : (
                    <>
                      <span>{interview.status === 'in_progress' ? 'Resume Session' : 'Start Session'}</span>
                      <Play className="w-4 h-4" />
                    </>
                  )}
                </button>
                {startSessionMutation.isError && (
                  <p className="text-xs text-red-500 font-mono">Failed to initialize session. Please try again.</p>
                )}
              </div>
            )}

            {hasCompleted && (
              <div className="space-y-4">
                <p className="text-sm font-sans text-ink-muted">This interview has concluded. The evaluation is available.</p>
                <button
                  onClick={() => navigate(`/candidate/interviews/${interview.id}/evaluation`)}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 border border-line hover:bg-paper-pressed transition-colors font-mono text-xs uppercase tracking-widest"
                >
                  View Evaluation
                </button>
              </div>
            )}

            {!isEligibleToStart && !hasCompleted && (
              <p className="text-sm font-sans text-ink-muted italic">This assessment is currently {interview.status}. Action is not permitted.</p>
            )}
          </Reveal>
        </aside>
      </section>
    </PageTransition>
  );
};
