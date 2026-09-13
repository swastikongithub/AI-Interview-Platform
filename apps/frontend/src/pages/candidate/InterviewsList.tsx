import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { PageTransition } from '../../motion/PageTransition';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { Badge } from '../../components/common/Badge';
import { ArrowRight, Plus } from 'lucide-react';
import { Interview } from '../../types';

export const InterviewsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading } = useQuery<Interview[]>({
    queryKey: ['interviews'],
    queryFn: () => apiService.getInterviews(),
  });

  const createPracticeMutation = useMutation({
    mutationFn: () => apiService.createPracticeInterview('practice', 'text'),
    onSuccess: (newInterview) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      navigate(`/candidate/interviews/${newInterview.id}`);
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'ready': return 'default';
      default: return 'outline';
    }
  };

  return (
    <PageTransition className="font-sans min-h-screen pb-32">
      <section className="relative px-6 md:px-12 pt-32 pb-16 max-w-[1400px] mx-auto border-b border-line">
        <span className="font-mono text-[10px] tracking-widest uppercase text-accent border-b border-line pb-1 mb-8 inline-block">
          Interview Dossier
        </span>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight">
            <MaskedTextReveal text="Your Interviews" delay={0.1} />
          </h1>
          <Reveal delay={0.3}>
            <button
              onClick={() => createPracticeMutation.mutate()}
              disabled={createPracticeMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 border border-line bg-paper hover:bg-paper-raised text-ink font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {createPracticeMutation.isPending ? 'Creating...' : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Practice</span>
                </>
              )}
            </button>
          </Reveal>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16">
        <Reveal delay={0.4} y={30}>
          {isLoading ? (
            <div className="py-20 border border-line bg-paper-raised flex items-center justify-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ink-muted animate-pulse">Loading Directory...</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-32 border border-line bg-paper-raised relative overflow-hidden group flex flex-col items-center justify-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-paper via-paper-raised to-paper-pressed opacity-50" />
              <div className="relative z-10 space-y-4 px-6">
                <p className="text-2xl font-serif text-ink">No interviews discovered</p>
                <p className="text-sm font-sans text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Start an asynchronous technical practice session to evaluate your baseline.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <Link
                  key={interview.id}
                  to={`/candidate/interviews/${interview.id}`}
                  className="p-8 border border-line bg-paper hover:bg-paper-raised transition-colors space-y-8 flex flex-col justify-between min-h-[240px] group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-ink-faint uppercase tracking-widest block border-b border-line pb-2">
                        {interview.type} • {interview.mode}
                      </span>
                      <Badge variant={getStatusVariant(interview.status)}>
                        {interview.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink-muted font-sans leading-relaxed">
                      {new Date(interview.scheduled_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-line">
                    <div className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-accent group-hover:text-ink transition-colors">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Reveal>
      </section>
    </PageTransition>
  );
};
