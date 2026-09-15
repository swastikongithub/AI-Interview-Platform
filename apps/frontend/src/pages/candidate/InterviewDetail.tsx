import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Play } from 'lucide-react';
import { apiService } from '../../services/api';
import {
  interviewTitle,
  pickActiveSession,
  queryKeys,
  useInterview,
  useInterviewSessions,
  useQuestions,
} from '../../lib/queries';
import { describeError, formatDateTime, shortId, titleCase } from '../../lib/format';
import { interviewStatusMeta } from '../../lib/status';
import { Button, ButtonLink } from '../../components/ui/Button';
import { KeyValue, PageHeader, Section } from '../../components/ui/Layout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, Skeleton, StateBlock } from '../../components/ui/States';

const steps = [
  {
    title: 'One question at a time',
    body: 'Each question is shown on its own. Write a complete answer before moving on — you can’t return to a submitted answer.',
  },
  {
    title: 'Saved on submit',
    body: 'Every submitted answer is stored on the server immediately. Your unsent draft is kept on this device.',
  },
  {
    title: 'Leave and resume',
    body: 'Close the tab or lose connection and you’ll return to the next unanswered question.',
  },
  {
    title: 'Finish explicitly',
    body: 'After the last answer, finish the interview. That closes the session and queues it for evaluation.',
  },
];

export const InterviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const interviewQuery = useInterview(id);
  const interview = interviewQuery.data;
  const questionsQuery = useQuestions(id);
  const sessionsQuery = useInterviewSessions(id, interview?.status === 'in_progress' || interview?.status === 'completed');

  const start = useMutation({
    mutationFn: () => apiService.startInterviewSession(id!),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interview(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
      navigate(`/candidate/interviews/${id}/session/${session.id}`);
    },
  });

  if (interviewQuery.isPending) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading interview">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-2/3 max-w-lg" />
        <Skeleton className="h-5 w-1/2 max-w-md" />
        <div className="grid grid-cols-1 gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (interviewQuery.isError || !interview) {
    const error = describeError(interviewQuery.error, 'The interview could not be loaded.');
    return (
      <ErrorState
        size="page"
        error={error.kind === 'not_found' ? { ...error, message: 'This interview doesn’t exist, or it isn’t yours.' } : error}
        title={error.kind === 'not_found' ? 'Interview not found' : undefined}
        onRetry={() => interviewQuery.refetch()}
        retrying={interviewQuery.isFetching}
      />
    );
  }

  const meta = interviewStatusMeta[interview.status];
  const questions = questionsQuery.data ?? [];
  const categories = Array.from(new Set(questions.map((q) => q.category).filter(Boolean)));
  const activeSession = pickActiveSession(sessionsQuery.data);
  const openSession = sessionsQuery.data?.find((s) => s.status === 'in_progress');

  return (
    <div>
      <PageHeader
        back={{ to: '/candidate/interviews', label: 'Interviews' }}
        kicker={`Brief · #${shortId(interview.id)}`}
        title={<h1>{interviewTitle(interview)}</h1>}
        meta={
          <>
            <StatusBadge meta={meta} />
            <span className="font-mono text-meta uppercase text-fg-muted">{interview.mode} mode</span>
            <span className="text-body-sm text-fg-muted">Created {formatDateTime(interview.scheduled_at)}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="space-y-12">
          <Section title="What to expect" description="Read this once before you begin.">
            <ol className="stagger grid grid-cols-1 gap-px overflow-hidden rounded-md bg-edge sm:grid-cols-2">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 bg-surface p-5">
                  <span className="font-mono text-meta text-fg-muted">0{i + 1}</span>
                  <span className="space-y-1">
                    <span className="block text-title-sm text-fg">{step.title}</span>
                    <span className="block text-body-sm text-fg-secondary">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Scope">
            {questionsQuery.isPending ? (
              <Skeleton className="h-16" />
            ) : questionsQuery.isError ? (
              <ErrorState error={describeError(questionsQuery.error)} onRetry={() => questionsQuery.refetch()} />
            ) : questions.length === 0 ? (
              <StateBlock
                kind="empty"
                title="No questions attached"
                description="This interview has no questions, so it can’t be started. Create a new practice interview instead."
              />
            ) : (
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <KeyValue label="Questions">
                  <span className="font-display text-display-md">{questions.length}</span>
                </KeyValue>
                <KeyValue label="Topics" className="col-span-2">
                  <span className="flex flex-wrap gap-1.5 whitespace-normal pt-1">
                    {categories.length > 0
                      ? categories.map((c) => (
                          <span key={c} className="rounded-xs bg-surface-sunken px-2 py-0.5 text-body-sm text-fg-secondary">
                            {c}
                          </span>
                        ))
                      : 'General'}
                  </span>
                </KeyValue>
              </dl>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-10 lg:self-start" aria-label="Interview actions">
          <div className="theme-night rounded-lg bg-canvas p-6 text-fg">
            {interview.status === 'ready' && (
              <>
                <p className="font-mono text-meta uppercase tracking-[0.08em] text-signal-text">Ready when you are</p>
                <p className="mt-3 text-title-lg">Set aside about ten quiet minutes.</p>
                <p className="mt-2 text-body-sm text-fg-secondary">Starting opens the session. It can’t be restarted once finished.</p>
                <Button
                  variant="signal"
                  size="lg"
                  className="mt-6 w-full"
                  leadingIcon={<Play />}
                  loading={start.isPending}
                  loadingLabel="Opening session…"
                  disabled={questions.length === 0 || questionsQuery.isPending}
                  onClick={() => start.mutate()}
                >
                  Begin interview
                </Button>
                {start.isError && (
                  <p role="alert" className="mt-3 text-body-sm text-negative">
                    {describeError(start.error, 'The session could not be opened.').message}
                  </p>
                )}
              </>
            )}

            {interview.status === 'in_progress' && (
              <>
                <p className="font-mono text-meta uppercase tracking-[0.08em] text-signal-text">In progress</p>
                <p className="mt-3 text-title-lg">Your answers so far are saved.</p>
                <p className="mt-2 text-body-sm text-fg-secondary">You’ll continue at the first unanswered question.</p>
                {sessionsQuery.isPending ? (
                  <Skeleton className="mt-6 h-12 w-full rounded-sm" />
                ) : sessionsQuery.isError ? (
                  <ErrorState error={describeError(sessionsQuery.error)} onRetry={() => sessionsQuery.refetch()} />
                ) : openSession ? (
                  <ButtonLink
                    to={`/candidate/interviews/${interview.id}/session/${openSession.id}`}
                    variant="signal"
                    size="lg"
                    className="mt-6 w-full"
                    trailingIcon={<ArrowRight />}
                  >
                    Resume interview
                  </ButtonLink>
                ) : (
                  <p role="alert" className="mt-6 text-body-sm text-negative">
                    No open session was found for this interview. It may have been closed on another device.
                  </p>
                )}
              </>
            )}

            {interview.status === 'completed' && (
              <>
                <p className="font-mono text-meta uppercase tracking-[0.08em] text-signal-text">Finished</p>
                <p className="mt-3 text-title-lg">Your interview is complete.</p>
                <p className="mt-2 text-body-sm text-fg-secondary">
                  {activeSession?.completed_at ? `Submitted ${formatDateTime(activeSession.completed_at)}. ` : ''}
                  Results appear once an evaluation is released.
                </p>
                <ButtonLink
                  to={`/candidate/interviews/${interview.id}/evaluation`}
                  variant="signal"
                  size="lg"
                  className="mt-6 w-full"
                  trailingIcon={<ArrowRight />}
                >
                  View results
                </ButtonLink>
              </>
            )}

            {(interview.status === 'draft' || interview.status === 'cancelled' || interview.status === 'expired') && (
              <>
                <p className="font-mono text-meta uppercase tracking-[0.08em] text-fg-muted">{meta.label}</p>
                <p className="mt-3 text-title-lg">
                  {interview.status === 'draft' ? 'Not open yet.' : 'This interview is closed.'}
                </p>
                <p className="mt-2 text-body-sm text-fg-secondary">
                  {interview.status === 'draft'
                    ? 'It becomes available once it’s set up. Check back later.'
                    : `It was ${titleCase(interview.status).toLowerCase()} and can no longer be taken.`}
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
