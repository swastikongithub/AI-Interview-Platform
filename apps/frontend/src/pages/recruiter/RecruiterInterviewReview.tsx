import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, UserCheck } from 'lucide-react';
import { apiService } from '../../services/api';
import { interviewTitle, queryKeys, useInterview, useProfileById } from '../../lib/queries';
import { describeError, formatDateTime, shortId } from '../../lib/format';
import { interviewStatusMeta } from '../../lib/status';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { DEMO_ACCOUNTS } from '../../config/demoAccounts';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { TextField } from '../../components/ui/Field';
import { PageHeader, Section } from '../../components/ui/Layout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { CandidateContext } from '../../components/interview/CandidateContext';
import { EvaluationSummary } from '../../components/interview/EvaluationSummary';
import { Transcript, useTranscript } from '../../components/interview/Transcript';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const RecruiterInterviewReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const interviewQuery = useInterview(id);
  const interview = interviewQuery.data;
  const profileQuery = useProfileById(interview?.candidate_id);
  const transcript = useTranscript(id);

  if (interviewQuery.isPending) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading interview">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-1/2 max-w-md" />
        <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (interviewQuery.isError || !interview) {
    const err = describeError(interviewQuery.error, 'The interview could not be loaded.');
    return (
      <>
        <PageHeader back={{ to: '/recruiter/dashboard', label: 'Pipeline' }} title={<h1>Interview</h1>} />
        <ErrorState error={err} title={err.kind === 'not_found' ? 'Interview not found' : undefined} onRetry={() => interviewQuery.refetch()} />
      </>
    );
  }

  const candidateName = profileQuery.data?.name;

  return (
    <div>
      <PageHeader
        back={{ to: '/recruiter/dashboard', label: 'Pipeline' }}
        kicker={`Review · #${shortId(interview.id)}`}
        title={<h1>{candidateName ?? interviewTitle(interview)}</h1>}
        meta={
          <>
            <StatusBadge meta={interviewStatusMeta[interview.status]} />
            <span className="text-body-sm text-fg-secondary">{interviewTitle(interview)}</span>
            <span className="font-mono text-meta uppercase text-fg-muted">{interview.mode}</span>
            <span className="text-body-sm text-fg-muted">Created {formatDateTime(interview.scheduled_at)}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div className="min-w-0 space-y-12">
          <Section title="Evaluation">
            <EvaluationSummary interviewId={interview.id} hasInterviewer={Boolean(interview.interviewer_id)} />
          </Section>
          <Section title="Responses">
            <Transcript data={transcript} audience="reviewer" />
          </Section>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-10 lg:self-start" aria-label="Candidate and coordination">
          <Section title="Candidate">
            <CandidateContext candidateId={interview.candidate_id} />
          </Section>
          <Coordination interviewId={interview.id} interviewerId={interview.interviewer_id} status={interview.status} />
        </aside>
      </div>
    </div>
  );
};

const Coordination: React.FC<{ interviewId: string; interviewerId: string | null; status: string }> = ({
  interviewId,
  interviewerId,
  status,
}) => {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.interview(interviewId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
  };

  const assign = useMutation({
    mutationFn: (uid: string) => apiService.assignInterviewer(interviewId, uid),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.interview(interviewId), updated);
      invalidate();
      setValue('');
      notify({ tone: 'success', title: 'Interviewer assigned', description: `#${shortId(updated.interviewer_id)} can now assess this interview.` });
    },
  });

  const cancel = useMutation({
    mutationFn: () => apiService.cancelInterview(interviewId),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.interview(interviewId), updated);
      invalidate();
      setConfirmCancel(false);
      notify({ tone: 'success', title: 'Interview cancelled' });
    },
  });

  const submitAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = value.trim();
    if (!UUID.test(uid)) {
      setFieldError('Enter the interviewer’s full user ID (a UUID like 3f2b…-…).');
      return;
    }
    setFieldError(null);
    assign.mutate(uid);
  };

  const closed = status === 'cancelled' || status === 'expired';

  return (
    <Section title="Coordination">
      <div className="space-y-6">
        <div>
          <p className="text-meta text-fg-muted">Assigned interviewer</p>
          <p className="mt-1 flex items-center gap-2 text-body text-fg">
            {interviewerId ? (
              <>
                <UserCheck className="size-4 text-positive" aria-hidden="true" />
                <span className="font-mono text-body-sm">#{shortId(interviewerId)}</span>
              </>
            ) : (
              <span className="text-fg-muted">No one yet</span>
            )}
          </p>
        </div>

        {!closed && (
          <form onSubmit={submitAssign} className="space-y-3" noValidate>
            <TextField
              label={interviewerId ? 'Reassign to user ID' : 'Assign by user ID'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (fieldError) setFieldError(null);
              }}
              placeholder="00000000-0000-0000-0000-000000000000"
              spellCheck={false}
              autoComplete="off"
              className="font-mono text-body-sm"
              error={fieldError ?? (assign.isError ? describeError(assign.error, 'Assignment failed.').message : null)}
              hint="The user must have the Interviewer role to see and assess it."
              labelAction={
                DEMO_ACCOUNTS_ENABLED ? (
                  <button
                    type="button"
                    onClick={() => setValue(DEMO_ACCOUNTS.interviewer.id)}
                    className="rounded-xs text-meta text-fg-muted underline decoration-edge-strong underline-offset-4 hover:text-fg"
                  >
                    Use demo interviewer
                  </button>
                ) : undefined
              }
            />
            <Button type="submit" variant="primary" className="w-full" loading={assign.isPending} loadingLabel="Assigning…">
              {interviewerId ? 'Reassign' : 'Assign interviewer'}
            </Button>
          </form>
        )}

        {!closed && status !== 'completed' && (
          <div className="border-t border-edge pt-5">
            <Button variant="ghost" className="-ml-3 text-negative hover:bg-negative-soft hover:text-negative" leadingIcon={<Ban />} onClick={() => setConfirmCancel(true)}>
              Cancel interview
            </Button>
          </div>
        )}
        {closed && <p className="text-body-sm text-fg-muted">This interview is closed. No further coordination is possible.</p>}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this interview?"
        description="The candidate won’t be able to start or continue it. Answers already submitted are kept."
        confirmLabel="Cancel interview"
        confirmVariant="danger"
        loading={cancel.isPending}
        error={cancel.isError ? describeError(cancel.error, 'The interview could not be cancelled.').message : null}
        onConfirm={() => cancel.mutate()}
      />
    </Section>
  );
};
