import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Check, Circle, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { useInterviews, useJobRecommendations, useResumeStatus, queryKeys, interviewTitle } from '../../lib/queries';
import { describeError, formatRelative } from '../../lib/format';
import { interviewStatusMeta, resumeStatusMeta } from '../../lib/status';
import type { Interview, ResumeStatus } from '../../types';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Section } from '../../components/ui/Layout';
import { StatusDot } from '../../components/ui/StatusBadge';
import { ErrorState, ListSkeleton, Skeleton, StateBlock } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { TextReveal } from '../../motion/TextReveal';
import { cn } from '../../utils/cn';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

interface NextStep {
  eyebrow: string;
  title: string;
  body: string;
  action: { label: string; to?: string; onClick?: () => void; loading?: boolean };
  pending?: boolean;
}

export const CandidateDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const interviewsQuery = useInterviews();
  const resumeQuery = useResumeStatus();
  const jobsQuery = useJobRecommendations();

  const createPractice = useMutation({
    mutationFn: () => apiService.createPracticeInterview('practice', 'text'),
    onSuccess: (interview) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
      navigate(`/candidate/interviews/${interview.id}`);
    },
    onError: (err) => notify({ tone: 'error', title: 'Couldn’t create the interview', description: describeError(err).message }),
  });

  const firstName = (profile?.name || user?.email?.split('@')[0] || '').split(' ')[0];
  const interviews = interviewsQuery.data ?? [];
  const inProgress = interviews.find((i) => i.status === 'in_progress');
  const ready = interviews.find((i) => i.status === 'ready');
  const resumeStatus = (resumeQuery.data?.resume_status ?? 'none') as ResumeStatus;
  const hasBasics = Boolean(profile?.name) && (profile?.skills?.length ?? 0) > 0;

  const loadingCore = interviewsQuery.isPending || resumeQuery.isPending;

  const next: NextStep | null = loadingCore
    ? null
    : inProgress
      ? {
          eyebrow: 'Continue',
          title: 'You have an interview in progress.',
          body: 'Your submitted answers are saved. Pick up at the next unanswered question.',
          action: { label: 'Resume interview', to: `/candidate/interviews/${inProgress.id}` },
        }
      : !hasBasics
        ? {
            eyebrow: 'Set up',
            title: 'Add your name and skills.',
            body: 'Your skills power job matching, and interviewers see your profile alongside your answers.',
            action: { label: 'Complete profile', to: '/candidate/profile' },
          }
        : resumeStatus === 'processing'
          ? {
              eyebrow: 'Working',
              title: 'Your résumé is being analyzed.',
              body: 'Extraction and ATS scoring run in the background. This page updates when the report is ready.',
              action: { label: 'View progress', to: '/candidate/resume' },
              pending: true,
            }
          : resumeStatus === 'none' || resumeStatus === 'failed'
            ? {
                eyebrow: resumeStatus === 'failed' ? 'Retry' : 'Next',
                title: resumeStatus === 'failed' ? 'Your last résumé analysis failed.' : 'Upload your résumé.',
                body: 'Get ATS feedback on missing keywords and structure, and pre-fill your experience.',
                action: { label: resumeStatus === 'failed' ? 'Upload again' : 'Upload résumé', to: '/candidate/resume' },
              }
            : ready
              ? {
                  eyebrow: 'Ready',
                  title: 'An interview is ready to start.',
                  body: 'Read the brief, then answer at your own pace. You can leave and resume.',
                  action: { label: 'Open brief', to: `/candidate/interviews/${ready.id}` },
                }
              : {
                  eyebrow: 'Practice',
                  title: 'Start a practice interview.',
                  body: 'A short text interview on system design and architecture. Answers save as you go.',
                  action: {
                    label: 'Start practice interview',
                    onClick: () => createPractice.mutate(),
                    loading: createPractice.isPending,
                  },
                };

  return (
    <div className="space-y-12 md:space-y-16">
      <header className="space-y-3">
        <p className="font-mono text-meta uppercase tracking-[0.08em] text-fg-muted">Home</p>
        <TextReveal className="font-display text-display-lg text-fg">
          {greeting()}
          {firstName ? `, ${firstName}` : ''}.
        </TextReveal>
      </header>

      <NextStepBand step={next} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
        <Section
          title="Interviews"
          description="Your most recent attempts."
          actions={
            interviews.length > 0 ? (
              <Link to="/candidate/interviews" className="inline-flex items-center gap-1 rounded-xs text-body-sm text-fg-secondary hover:text-fg">
                All interviews <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : undefined
          }
        >
          {interviewsQuery.isPending ? (
            <ListSkeleton rows={3} label="Loading interviews" />
          ) : interviewsQuery.isError ? (
            <ErrorState error={describeError(interviewsQuery.error)} onRetry={() => interviewsQuery.refetch()} retrying={interviewsQuery.isFetching} />
          ) : interviews.length === 0 ? (
            <StateBlock
              kind="empty"
              title="No interviews yet"
              description="Practice interviews you start will be listed here with their status."
              actions={
                <Button variant="secondary" size="sm" leadingIcon={<Plus />} loading={createPractice.isPending} onClick={() => createPractice.mutate()}>
                  Start practice interview
                </Button>
              }
            />
          ) : (
            <ul className="stagger divide-y divide-edge">
              {interviews.slice(0, 5).map((interview) => (
                <InterviewRow key={interview.id} interview={interview} />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Readiness" description="What recruiters and matching rely on.">
          <ul className="divide-y divide-edge">
            <ChecklistItem
              done={Boolean(profile?.name)}
              title="Name on profile"
              detail={profile?.name || 'Not set'}
              to="/candidate/profile"
            />
            <ChecklistItem
              done={(profile?.skills?.length ?? 0) > 0}
              title="Skills"
              detail={(profile?.skills?.length ?? 0) > 0 ? `${profile!.skills.length} listed` : 'None listed'}
              to="/candidate/profile"
            />
            <ChecklistItem
              done={(profile?.experience?.length ?? 0) > 0}
              title="Experience"
              detail={(profile?.experience?.length ?? 0) > 0 ? `${profile!.experience.length} ${profile!.experience.length === 1 ? 'role' : 'roles'}` : 'None added'}
              to="/candidate/profile"
            />
            <ChecklistItem
              done={resumeStatus === 'complete'}
              title="Résumé analysis"
              loading={resumeQuery.isPending}
              detail={
                resumeStatus === 'complete' && typeof resumeQuery.data?.ats_report?.score === 'number'
                  ? `ATS score ${resumeQuery.data.ats_report.score}/100`
                  : resumeStatusMeta[resumeStatus]?.label ?? 'Unknown'
              }
              to="/candidate/resume"
            />
            <ChecklistItem
              done={(jobsQuery.data?.recommendations?.length ?? 0) > 0 && (jobsQuery.data?.recommendations ?? []).some((j: any) => j.match_percentage > 0)}
              title="Job matches"
              loading={jobsQuery.isPending}
              detail={
                jobsQuery.isError
                  ? 'Unavailable right now'
                  : `${(jobsQuery.data?.recommendations ?? []).filter((j: any) => j.match_percentage > 0).length} of ${jobsQuery.data?.total_jobs ?? 0} roles overlap your skills`
              }
              to="/candidate/jobs"
            />
          </ul>
        </Section>
      </div>
    </div>
  );
};

const NextStepBand: React.FC<{ step: NextStep | null }> = ({ step }) => {
  if (!step) {
    return (
      <div className="theme-night rounded-lg bg-canvas p-6 sm:p-8" role="status" aria-label="Loading your next step">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-5 h-8 w-3/4 max-w-md" />
        <Skeleton className="mt-3 h-4 w-2/3 max-w-sm" />
        <Skeleton className="mt-7 h-11 w-44 rounded-sm" />
      </div>
    );
  }

  return (
    <section
      aria-label="Next step"
      className="theme-night route-enter relative overflow-hidden rounded-lg bg-canvas p-6 text-fg sm:p-8 lg:p-10"
    >
      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="max-w-xl space-y-3">
          <p className="flex items-center gap-2 font-mono text-meta uppercase tracking-[0.08em] text-signal-text">
            <span className={cn('size-1.5 rounded-full bg-signal', step.pending && 'animate-pulse motion-reduce:animate-none')} aria-hidden="true" />
            {step.eyebrow}
          </p>
          <h2 className="font-display text-display-md text-fg">{step.title}</h2>
          <p className="text-body-lg text-fg-secondary">{step.body}</p>
        </div>
        <div>
          {step.action.to ? (
            <ButtonLink to={step.action.to} variant="signal" size="lg" trailingIcon={<ArrowRight />}>
              {step.action.label}
            </ButtonLink>
          ) : (
            <Button variant="signal" size="lg" onClick={step.action.onClick} loading={step.action.loading} loadingLabel="Creating…" trailingIcon={<ArrowRight />}>
              {step.action.label}
            </Button>
          )}
        </div>
      </div>
      {step.pending && <div className="activity-bar absolute inset-x-0 bottom-0 h-0.5 bg-edge" aria-hidden="true" />}
    </section>
  );
};

const actionLabel: Record<string, string> = {
  in_progress: 'Resume',
  ready: 'Open',
  completed: 'Results',
};

const InterviewRow: React.FC<{ interview: Interview }> = ({ interview }) => {
  const meta = interviewStatusMeta[interview.status];
  const to = interview.status === 'completed' ? `/candidate/interviews/${interview.id}/evaluation` : `/candidate/interviews/${interview.id}`;
  return (
    <li>
      <Link to={to} className="group -mx-3 flex items-center gap-4 rounded-sm px-3 py-3.5 transition-colors duration-quick hover:bg-surface">
        <div className="min-w-0 flex-1">
          <p className="truncate text-title-sm text-fg">{interviewTitle(interview)}</p>
          <p className="mt-0.5 font-mono text-meta text-fg-muted">
            {interview.mode.toUpperCase()} · {formatRelative(interview.scheduled_at)}
          </p>
        </div>
        <StatusDot meta={meta} className="hidden sm:inline-flex" />
        <span className="inline-flex items-center gap-1 text-body-sm text-fg-secondary group-hover:text-fg">
          <span className="sm:hidden">
            <StatusDot meta={meta} />
          </span>
          <span className="hidden sm:inline">{actionLabel[interview.status] ?? 'View'}</span>
          <ArrowUpRight className="size-4 transition-transform duration-quick ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
};

const ChecklistItem: React.FC<{ done: boolean; title: string; detail: string; to: string; loading?: boolean }> = ({
  done,
  title,
  detail,
  to,
  loading,
}) => (
  <li>
    <Link to={to} className="group -mx-3 flex items-center gap-3 rounded-sm px-3 py-3 transition-colors duration-quick hover:bg-surface">
      <span
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-quick',
          done ? 'bg-signal text-signal-fg' : 'text-fg-muted shadow-[inset_0_0_0_1.5px_rgb(var(--c-edge-strong))]'
        )}
      >
        {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : <Circle className="size-0" aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-title-sm text-fg">
          {title}
          <span className="sr-only">{done ? ' — done' : ' — to do'}</span>
        </span>
        {loading ? <Skeleton className="mt-1.5 h-3 w-24" /> : <span className="block truncate text-body-sm text-fg-muted">{detail}</span>}
      </span>
      <ArrowRight className="size-4 text-fg-muted opacity-0 transition-opacity duration-quick group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
    </Link>
  </li>
);
