import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ArrowRight, Check, Hourglass } from 'lucide-react';
import { interviewTitle, useEvaluation, useInterview } from '../../lib/queries';
import { describeError, formatDateTime, shortId } from '../../lib/format';
import { evaluationStatusMeta, interviewStatusMeta } from '../../lib/status';
import { ButtonLink } from '../../components/ui/Button';
import { PageHeader, Section } from '../../components/ui/Layout';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, Skeleton, StateBlock } from '../../components/ui/States';
import { Transcript, useTranscript } from '../../components/interview/Transcript';
import { TextReveal } from '../../motion/TextReveal';

/** Evaluation JSON fields are free-form; render only what is genuinely a list of text. */
export function toTextList(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') return value.trim() ? [value] : [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          const text = o.text ?? o.title ?? o.description ?? o.summary;
          return typeof text === 'string' ? text : null;
        }
        return null;
      })
      .filter((s): s is string => Boolean(s && s.trim()));
  }
  return [];
}

export const InterviewEvaluation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const justCompleted = Boolean((location.state as { justCompleted?: boolean } | null)?.justCompleted);
  const interviewQuery = useInterview(id);
  const evaluationQuery = useEvaluation(id, interviewQuery.data?.status === 'completed');
  const interview = interviewQuery.data;
  const evaluation = evaluationQuery.data;
  const transcript = useTranscript(id, evaluation?.session_id);

  const back = { to: '/candidate/interviews', label: 'Interviews' };

  if (interviewQuery.isPending || (interview?.status === 'completed' && evaluationQuery.isPending)) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading results">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-1/2 max-w-md" />
        <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Skeleton className="h-56" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (interviewQuery.isError || !interview) {
    const err = describeError(interviewQuery.error, 'Results could not be loaded.');
    return (
      <>
        <PageHeader back={back} title={<h1>Results</h1>} />
        <ErrorState
          error={err.kind === 'not_found' ? { ...err, message: 'This interview doesn’t exist, or it isn’t yours.' } : err}
          title={err.kind === 'not_found' ? 'Interview not found' : undefined}
          onRetry={() => interviewQuery.refetch()}
        />
      </>
    );
  }

  const header = (
    <PageHeader
      back={back}
      kicker={`Results · #${shortId(interview.id)}`}
      title={<h1>{interviewTitle(interview)}</h1>}
      meta={
        <>
          <StatusBadge meta={interviewStatusMeta[interview.status]} />
          {evaluation && <StatusBadge meta={evaluationStatusMeta[evaluation.status]} />}
        </>
      }
    />
  );

  if (interview.status !== 'completed') {
    return (
      <>
        {header}
        <StateBlock
          kind="pending"
          title="Finish the interview to get results"
          description="Results are only produced for interviews you’ve finished and submitted."
          actions={
            <ButtonLink to={`/candidate/interviews/${interview.id}`} trailingIcon={<ArrowRight />}>
              Go to interview
            </ButtonLink>
          }
        />
      </>
    );
  }

  if (evaluationQuery.isError) {
    return (
      <>
        {header}
        <ErrorState error={describeError(evaluationQuery.error)} onRetry={() => evaluationQuery.refetch()} retrying={evaluationQuery.isFetching} />
      </>
    );
  }

  // Released evaluations only reach candidates; anything else reads as "not yet".
  if (!evaluation || evaluation.status !== 'completed') {
    return (
      <>
        {header}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14">
          <div className="theme-night self-start rounded-lg bg-canvas p-6 text-fg sm:p-8">
            <span
              className={`grid size-11 place-items-center rounded-md ${justCompleted ? 'bg-signal text-signal-fg' : 'bg-surface text-caution'}`}
              aria-hidden="true"
            >
              {justCompleted ? <Check className="size-5" strokeWidth={2.5} /> : <Hourglass className="size-5" />}
            </span>
            <TextReveal as="h2" className="mt-5 font-display text-display-md text-fg">
              {justCompleted ? 'Submitted. Nicely done.' : 'Your evaluation isn’t released yet.'}
            </TextReveal>
            <p className="mt-3 text-body-lg text-fg-secondary">
              {justCompleted
                ? 'Your answers are with the evaluation queue. Results appear on this page once an interviewer releases them.'
                : 'Results appear on this page once an interviewer reviews your answers and releases the evaluation. There’s nothing you need to do.'}
            </p>
            <div className="activity-bar mt-8 h-0.5 rounded-full bg-edge" aria-hidden="true" />
            <p className="mt-3 font-mono text-micro uppercase text-fg-muted">Status: awaiting review</p>
          </div>

          <Section title="What you submitted" description="Your answers exactly as they were saved.">
            <Transcript data={transcript} audience="candidate" />
          </Section>
        </div>
      </>
    );
  }

  const strengths = toTextList(evaluation.strengths);
  const weaknesses = toTextList(evaluation.weaknesses);
  const roadmap = toTextList(evaluation.roadmap);
  const criteria = [
    { label: 'Technical depth', value: evaluation.technical_score },
    { label: 'Communication', value: evaluation.communication_score },
    { label: 'Problem solving & code', value: evaluation.coding_score },
    { label: 'Confidence', value: evaluation.confidence_score },
  ];

  return (
    <>
      {header}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-16">
        <aside className="space-y-8 lg:sticky lg:top-10 lg:self-start" aria-label="Scores">
          <div className="theme-night rounded-lg bg-canvas p-6 text-fg">
            <p className="font-mono text-meta uppercase tracking-[0.08em] text-fg-muted">Overall</p>
            {typeof evaluation.overall_score === 'number' ? (
              <p className="mt-2 font-display text-[4.5rem] font-semibold leading-none tracking-[-0.04em] text-fg">
                {evaluation.overall_score}
                <span className="ml-1 font-mono text-body text-fg-muted">/100</span>
              </p>
            ) : (
              <p className="mt-3 text-title-md text-fg-secondary">No overall score given</p>
            )}
          </div>
          <div className="space-y-5">
            {criteria.map((c, i) => (
              <Meter key={c.label} label={c.label} value={c.value} index={i} />
            ))}
          </div>
        </aside>

        <div className="space-y-12">
          <Section title="Summary">
            {evaluation.summary ? (
              <p className="max-w-prose whitespace-pre-wrap text-body-lg text-fg">{evaluation.summary}</p>
            ) : (
              <p className="text-body text-fg-muted">The interviewer didn’t write a summary.</p>
            )}
          </Section>

          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {strengths.length > 0 && <FeedbackList title="Strengths" items={strengths} />}
              {weaknesses.length > 0 && <FeedbackList title="To work on" items={weaknesses} />}
            </div>
          )}

          {roadmap.length > 0 && (
            <Section title="Suggested next steps">
              <ol className="space-y-3">
                {roadmap.map((item, i) => (
                  <li key={i} className="flex gap-4 text-body text-fg">
                    <span className="font-mono text-meta text-fg-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <Section title="Your answers" description={transcript.session?.completed_at ? `Submitted ${formatDateTime(transcript.session.completed_at)}` : undefined}>
            <Transcript data={transcript} audience="candidate" />
          </Section>
        </div>
      </div>
    </>
  );
};

const FeedbackList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <Section title={title} headingLevel="h2">
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-body text-fg">
          <span className="mt-2.5 h-px w-3 shrink-0 bg-fg-muted" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </Section>
);
