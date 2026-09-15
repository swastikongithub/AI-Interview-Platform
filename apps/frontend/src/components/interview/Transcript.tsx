import React from 'react';
import { MessageSquareDashed } from 'lucide-react';
import { pickActiveSession, useInterviewSessions, useQuestions, useResponses } from '../../lib/queries';
import { describeError, formatDateTime } from '../../lib/format';
import { sessionStatusMeta } from '../../lib/status';
import type { InterviewQuestion, InterviewResponse, InterviewSession } from '../../types';
import { cn } from '../../utils/cn';
import { StatusBadge } from '../ui/StatusBadge';
import { ErrorState, Skeleton, StateBlock } from '../ui/States';

export interface TranscriptData {
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  session?: InterviewSession;
  isPending: boolean;
  error: unknown;
  refetch: () => void;
}

/** Loads questions, the relevant session and its responses for one interview. */
export function useTranscript(interviewId: string | undefined, preferredSessionId?: string | null): TranscriptData {
  const questionsQuery = useQuestions(interviewId);
  const sessionsQuery = useInterviewSessions(interviewId);
  const session =
    (preferredSessionId && sessionsQuery.data?.find((s) => s.id === preferredSessionId)) || pickActiveSession(sessionsQuery.data);
  const responsesQuery = useResponses(interviewId, session?.id);

  return {
    questions: questionsQuery.data ?? [],
    responses: responsesQuery.data ?? [],
    session,
    isPending: questionsQuery.isPending || sessionsQuery.isPending || (Boolean(session) && responsesQuery.isPending),
    error: questionsQuery.error ?? sessionsQuery.error ?? responsesQuery.error,
    refetch: () => {
      questionsQuery.refetch();
      sessionsQuery.refetch();
      if (session) responsesQuery.refetch();
    },
  };
}

interface TranscriptProps {
  data: TranscriptData;
  /** Highlights and anchors a specific question (evaluation workspace navigation). */
  activeQuestionId?: string | null;
  audience: 'candidate' | 'reviewer';
  className?: string;
}

/**
 * Reading-first transcript: the question in the display face, the response as
 * long-form text with generous measure. Anchored per question for navigation.
 */
export const Transcript: React.FC<TranscriptProps> = ({ data, activeQuestionId, audience, className }) => {
  if (data.isPending) {
    return (
      <div className={cn('space-y-10', className)} role="status" aria-label="Loading transcript">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (data.error) {
    return <ErrorState className={className} error={describeError(data.error)} onRetry={data.refetch} />;
  }

  if (data.questions.length === 0) {
    return (
      <StateBlock
        className={className}
        kind="empty"
        title="No questions on this interview"
        description="There is nothing to review."
      />
    );
  }

  if (!data.session) {
    return (
      <StateBlock
        className={className}
        kind="pending"
        icon={MessageSquareDashed}
        title={audience === 'candidate' ? 'You haven’t started this interview' : 'The candidate hasn’t started yet'}
        description={
          audience === 'candidate'
            ? 'Answers appear here once you begin.'
            : `There are ${data.questions.length} questions waiting. Responses appear here as soon as the candidate submits them.`
        }
      />
    );
  }

  const byQuestion = new Map(data.responses.map((r) => [r.question_id, r]));
  const answered = data.questions.filter((q) => byQuestion.has(q.id)).length;

  return (
    <div className={className}>
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <StatusBadge meta={sessionStatusMeta[data.session.status]} />
        <span className="font-mono text-meta text-fg-muted">
          {answered}/{data.questions.length} answered
        </span>
        <span className="text-body-sm text-fg-muted">
          Started {formatDateTime(data.session.started_at)}
          {data.session.completed_at ? ` · Finished ${formatDateTime(data.session.completed_at)}` : ''}
        </span>
      </div>

      <ol className="space-y-4">
        {data.questions.map((q, i) => {
          const response = byQuestion.get(q.id);
          const active = activeQuestionId === q.id;
          return (
            <li
              key={q.id}
              id={`question-${q.id}`}
              className={cn(
                'scroll-mt-24 rounded-md bg-surface p-5 shadow-hairline transition-shadow duration-quick ease-out sm:p-6',
                active && 'shadow-[0_0_0_2px_rgb(var(--c-fg))]'
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-meta text-fg-muted">Q{String(i + 1).padStart(2, '0')}</span>
                {q.category && <span className="text-meta text-fg-secondary">{q.category}</span>}
                {q.difficulty && <span className="font-mono text-micro uppercase text-fg-muted">{q.difficulty}</span>}
              </div>
              <h3 className="mt-2 text-title-lg text-fg">{q.question_text}</h3>
              <div className="mt-4 border-l-2 border-edge-strong pl-4">
                <p className="mb-1.5 text-meta text-fg-muted">{audience === 'candidate' ? 'Your answer' : 'Candidate response'}</p>
                {response ? (
                  <p className="max-w-prose whitespace-pre-wrap text-body-lg text-fg">{response.response_text}</p>
                ) : (
                  <p className="text-body text-fg-muted">
                    {data.session!.status === 'in_progress' ? 'Not answered yet.' : 'No answer was submitted.'}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
