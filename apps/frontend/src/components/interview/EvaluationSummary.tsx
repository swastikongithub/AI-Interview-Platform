import React from 'react';
import { useEvaluation } from '../../lib/queries';
import { describeError, shortId } from '../../lib/format';
import { evaluationStatusMeta } from '../../lib/status';
import { Meter } from '../ui/Meter';
import { StatusBadge } from '../ui/StatusBadge';
import { ErrorState, Skeleton, StateBlock } from '../ui/States';

/** Read-only evaluation for recruiters and admins. */
export const EvaluationSummary: React.FC<{ interviewId: string; hasInterviewer: boolean }> = ({ interviewId, hasInterviewer }) => {
  const query = useEvaluation(interviewId);

  if (query.isPending) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading evaluation">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20" />
      </div>
    );
  }
  if (query.isError) return <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} />;

  const e = query.data;
  if (!e) {
    return (
      <StateBlock
        kind="pending"
        title="No evaluation yet"
        description={
          hasInterviewer
            ? 'The assigned interviewer hasn’t saved an assessment for this interview.'
            : 'Assign an interviewer so this interview can be assessed.'
        }
      />
    );
  }

  const criteria = [
    { label: 'Technical depth', value: e.technical_score },
    { label: 'Communication', value: e.communication_score },
    { label: 'Problem solving & code', value: e.coding_score },
    { label: 'Confidence', value: e.confidence_score },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge meta={evaluationStatusMeta[e.status]} />
        {e.status !== 'completed' && <span className="text-body-sm text-fg-muted">Draft — not visible to the candidate</span>}
        {e.evaluated_by && <span className="font-mono text-meta text-fg-muted">By #{shortId(e.evaluated_by)}</span>}
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[9rem_minmax(0,1fr)]">
        <div>
          <p className="text-meta text-fg-muted">Overall</p>
          {typeof e.overall_score === 'number' ? (
            <p className="font-display text-display-lg tabular-nums text-fg">
              {e.overall_score}
              <span className="ml-1 font-mono text-body-sm text-fg-muted">/100</span>
            </p>
          ) : (
            <p className="mt-1 text-body text-fg-muted">Not given</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {criteria.map((c, i) => (
            <Meter key={c.label} label={c.label} value={c.value} index={i} size="sm" />
          ))}
        </div>
      </div>
      {e.summary ? (
        <p className="max-w-prose whitespace-pre-wrap text-body text-fg">{e.summary}</p>
      ) : (
        <p className="text-body-sm text-fg-muted">No written summary.</p>
      )}
    </div>
  );
};
