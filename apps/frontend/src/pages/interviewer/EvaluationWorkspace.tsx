import React, { useEffect, useId, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import { apiService } from '../../services/api';
import { interviewTitle, queryKeys, useEvaluation, useInterview, useProfileById } from '../../lib/queries';
import { describeError, formatDateTime, shortId } from '../../lib/format';
import { evaluationStatusMeta, interviewStatusMeta } from '../../lib/status';
import type { Evaluation, EvaluationUpdate } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { TextAreaField } from '../../components/ui/Field';
import { PageHeader, Section } from '../../components/ui/Layout';
import { Segmented } from '../../components/ui/Segmented';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { CandidateContext } from '../../components/interview/CandidateContext';
import { Transcript, useTranscript } from '../../components/interview/Transcript';
import { cn } from '../../utils/cn';

type ScoreKey = 'technical_score' | 'communication_score' | 'coding_score' | 'confidence_score' | 'overall_score';

const criteria: { key: ScoreKey; label: string; rubric: string }[] = [
  { key: 'technical_score', label: 'Technical depth', rubric: 'Accuracy and depth of the concepts used.' },
  { key: 'communication_score', label: 'Communication', rubric: 'Structure, clarity and precision of the explanation.' },
  { key: 'coding_score', label: 'Problem solving & code', rubric: 'Approach, trade-off reasoning and practical implementation.' },
  { key: 'confidence_score', label: 'Confidence', rubric: 'Conviction and ownership of the answers given.' },
];

interface FormState {
  scores: Record<ScoreKey, string>;
  summary: string;
}

const emptyForm: FormState = {
  scores: { technical_score: '', communication_score: '', coding_score: '', confidence_score: '', overall_score: '' },
  summary: '',
};

function fromEvaluation(e: Evaluation | null | undefined): FormState {
  if (!e) return emptyForm;
  const s = (v: number | null) => (typeof v === 'number' ? String(v) : '');
  return {
    scores: {
      technical_score: s(e.technical_score),
      communication_score: s(e.communication_score),
      coding_score: s(e.coding_score),
      confidence_score: s(e.confidence_score),
      overall_score: s(e.overall_score),
    },
    summary: e.summary ?? '',
  };
}

function parseScore(v: string): number | null | 'invalid' {
  if (v.trim() === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 100) return 'invalid';
  return n;
}

export const EvaluationWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const interviewQuery = useInterview(id);
  const interview = interviewQuery.data;
  const evaluationQuery = useEvaluation(id);
  const transcript = useTranscript(id, evaluationQuery.data?.session_id);
  const profileQuery = useProfileById(interview?.candidate_id);

  const [view, setView] = useState<'responses' | 'assessment'>('responses');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [seededFrom, setSeededFrom] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ScoreKey | 'summary', string>>>({});
  const [confirmRelease, setConfirmRelease] = useState(false);

  // Seed the form once per loaded evaluation version — never while the user is typing.
  const evaluation = evaluationQuery.data;
  const signature = evaluationQuery.isSuccess ? JSON.stringify(fromEvaluation(evaluation)) : null;
  useEffect(() => {
    if (signature !== null && signature !== seededFrom) {
      setForm(fromEvaluation(evaluation));
      setSeededFrom(signature);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const dirty = seededFrom !== null && JSON.stringify(form) !== seededFrom;

  const clearError = (key: ScoreKey | 'summary') =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const save = useMutation({
    mutationFn: (payload: EvaluationUpdate) => apiService.updateEvaluation(id!, payload),
    onSuccess: (saved, payload) => {
      queryClient.setQueryData(queryKeys.evaluation(id!), saved);
      setConfirmRelease(false);
      notify(
        payload.status === 'completed'
          ? { tone: 'success', title: 'Evaluation released', description: 'The candidate can now see their results.' }
          : { tone: 'success', title: 'Draft saved', description: 'Not visible to the candidate.' }
      );
    },
    onError: (err) => {
      notify({ tone: 'error', title: 'Evaluation not saved', description: describeError(err).message });
    },
  });

  const buildPayload = (status: 'pending' | 'completed'): EvaluationUpdate | null => {
    const next: typeof errors = {};
    const payload: EvaluationUpdate = { status };
    (['technical_score', 'communication_score', 'coding_score', 'confidence_score', 'overall_score'] as ScoreKey[]).forEach((k) => {
      const parsed = parseScore(form.scores[k]);
      if (parsed === 'invalid') next[k] = 'Use a whole number from 0 to 100.';
      else if (parsed === null && status === 'completed') next[k] = 'Required to release.';
      else if (parsed !== null) payload[k] = parsed;
    });
    if (status === 'completed' && !form.summary.trim()) next.summary = 'Write a summary before releasing.';
    payload.summary = form.summary.trim();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setView('assessment');
      return null;
    }
    return payload;
  };

  if (interviewQuery.isPending) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading workspace">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-1/2 max-w-md" />
        <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (interviewQuery.isError || !interview) {
    const err = describeError(interviewQuery.error, 'The interview could not be loaded.');
    return (
      <>
        <PageHeader back={{ to: '/interviewer/dashboard', label: 'Assignments' }} title={<h1>Assessment</h1>} />
        <ErrorState
          error={err.kind === 'not_found' ? { ...err, message: 'This interview isn’t assigned to you, or it no longer exists.' } : err}
          title={err.kind === 'not_found' ? 'Not in your assignments' : undefined}
          onRetry={() => interviewQuery.refetch()}
        />
      </>
    );
  }

  const released = evaluation?.status === 'completed';

  return (
    <div>
      <PageHeader
        back={{ to: '/interviewer/dashboard', label: 'Assignments' }}
        kicker={`Assessment · #${shortId(interview.id)}`}
        title={<h1>{profileQuery.data?.name ?? `Candidate #${shortId(interview.candidate_id)}`}</h1>}
        meta={
          <>
            <StatusBadge meta={interviewStatusMeta[interview.status]} />
            {evaluation ? <StatusBadge meta={evaluationStatusMeta[evaluation.status]} /> : <StatusBadge tone="neutral">Not assessed</StatusBadge>}
            <span className="text-body-sm text-fg-muted">
              {interviewTitle(interview)} · {formatDateTime(interview.scheduled_at)}
            </span>
          </>
        }
      />

      <div className="mb-6 lg:hidden">
        <Segmented
          label="Workspace view"
          value={view}
          onChange={setView}
          options={[
            { value: 'responses', label: 'Responses' },
            { value: 'assessment', label: 'Assessment' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
        {/* Reading pane — kept mounted on mobile so scroll and state persist. */}
        <div className={cn('min-w-0 space-y-10', view !== 'responses' && 'hidden lg:block')}>
          <Section title="Candidate">
            <CandidateContext candidateId={interview.candidate_id} compact />
          </Section>

          {transcript.questions.length > 1 && transcript.session && (
            <nav aria-label="Jump to question" className="flex flex-wrap gap-1.5">
              {transcript.questions.map((q, i) => {
                const answered = transcript.responses.some((r) => r.question_id === q.id);
                return (
                  <a
                    key={q.id}
                    href={`#question-${q.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-surface px-2.5 font-mono text-meta text-fg-secondary shadow-hairline hover:text-fg"
                  >
                    Q{String(i + 1).padStart(2, '0')}
                    <span className={cn('size-1.5 rounded-full', answered ? 'bg-positive' : 'bg-edge-strong')} aria-hidden="true" />
                    <span className="sr-only">{answered ? 'answered' : 'not answered'}</span>
                  </a>
                );
              })}
            </nav>
          )}

          <Section title="Responses">
            <Transcript data={transcript} audience="reviewer" />
          </Section>
        </div>

        {/* Assessment panel */}
        <aside
          aria-label="Assessment"
          className={cn('lg:sticky lg:top-8 lg:max-h-[calc(100dvh-4rem)] lg:self-start lg:overflow-y-auto', view !== 'assessment' && 'hidden lg:block')}
        >
          <div className="rounded-lg bg-surface shadow-hairline">
            <div className="border-b border-edge px-5 py-4">
              <h2 className="text-title-md text-fg">Your assessment</h2>
              <p className="mt-0.5 text-body-sm text-fg-muted">
                {released ? 'Released — the candidate can see this.' : 'Drafts stay hidden from the candidate until released.'}
              </p>
            </div>

            {evaluationQuery.isPending ? (
              <div className="space-y-4 p-5" role="status" aria-label="Loading evaluation">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : evaluationQuery.isError ? (
              <div className="p-5">
                <ErrorState error={describeError(evaluationQuery.error)} onRetry={() => evaluationQuery.refetch()} />
              </div>
            ) : (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  const payload = buildPayload(released ? 'completed' : 'pending');
                  if (payload) save.mutate(payload);
                }}
              >
                <div className="space-y-5 p-5">
                  {interview.status !== 'completed' && (
                    <p className="flex gap-2 rounded-sm bg-caution-soft px-3 py-2.5 text-body-sm text-caution">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      The candidate hasn’t finished. Scores recorded now may miss answers.
                    </p>
                  )}

                  {criteria.map((c) => (
                    <ScoreInput
                      key={c.key}
                      label={c.label}
                      rubric={c.rubric}
                      value={form.scores[c.key]}
                      error={errors[c.key]}
                      onChange={(v) => {
                        setForm((f) => ({ ...f, scores: { ...f.scores, [c.key]: v } }));
                        clearError(c.key);
                      }}
                    />
                  ))}

                  <div className="border-t border-edge pt-5">
                    <ScoreInput
                      label="Overall"
                      rubric="Your holistic judgement — not an average of the above."
                      value={form.scores.overall_score}
                      error={errors.overall_score}
                      emphasis
                      onChange={(v) => {
                        setForm((f) => ({ ...f, scores: { ...f.scores, overall_score: v } }));
                        clearError('overall_score');
                      }}
                    />
                  </div>

                  <TextAreaField
                    label="Summary"
                    hint="Shown to the candidate when released. Be specific and constructive."
                    rows={6}
                    value={form.summary}
                    error={errors.summary}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, summary: e.target.value }));
                      clearError('summary');
                    }}
                  />
                </div>

                <div className="sticky bottom-0 flex flex-col gap-2 border-t border-edge bg-surface p-4 sm:flex-row">
                  {released ? (
                    <>
                      <Button type="submit" variant="primary" className="flex-1" loading={save.isPending && save.variables?.status === 'completed'} disabled={!dirty || save.isPending}>
                        Update released
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={save.isPending}
                        loading={save.isPending && save.variables?.status === 'pending'}
                        onClick={() => {
                          const payload = buildPayload('pending');
                          if (payload) save.mutate(payload);
                        }}
                      >
                        Unrelease
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        variant="secondary"
                        className="flex-1"
                        loading={save.isPending && save.variables?.status === 'pending'}
                        loadingLabel="Saving…"
                        disabled={save.isPending || (!dirty && Boolean(evaluation))}
                      >
                        Save draft
                      </Button>
                      <Button
                        variant="signal"
                        className="flex-1"
                        leadingIcon={<Send />}
                        disabled={save.isPending}
                        onClick={() => {
                          if (buildPayload('completed')) setConfirmRelease(true);
                        }}
                      >
                        Release
                      </Button>
                    </>
                  )}
                </div>
                {released && !dirty && (
                  <p className="flex items-center gap-1.5 px-5 pb-4 text-body-sm text-positive">
                    <CheckCircle2 className="size-4" aria-hidden="true" /> Up to date
                  </p>
                )}
              </form>
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmRelease}
        onClose={() => setConfirmRelease(false)}
        title="Release this evaluation?"
        description="The candidate will immediately see the scores and summary. You can still update or unrelease it later."
        confirmLabel="Release to candidate"
        confirmVariant="signal"
        loading={save.isPending}
        error={save.isError ? describeError(save.error).message : null}
        onConfirm={() => {
          const payload = buildPayload('completed');
          if (payload) save.mutate(payload);
        }}
      />
    </div>
  );
};

const ScoreInput: React.FC<{
  label: string;
  rubric: string;
  value: string;
  error?: string;
  emphasis?: boolean;
  onChange: (v: string) => void;
}> = ({ label, rubric, value, error, emphasis, onChange }) => {
  const id = useId();
  const numeric = value.trim() === '' ? 0 : Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={`${id}-num`} className={cn('text-fg', emphasis ? 'text-title-sm' : 'text-label')}>
            {label}
          </label>
          <p id={`${id}-rubric`} className="text-body-sm text-fg-muted">
            {rubric}
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <input
            id={`${id}-num`}
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            step={1}
            value={value}
            placeholder="—"
            aria-describedby={error ? `${id}-err` : `${id}-rubric`}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'h-9 w-16 rounded-sm bg-canvas text-center font-mono tabular-nums text-fg shadow-hairline focus:shadow-[0_0_0_2px_rgb(var(--c-focus))] focus:outline-none focus-visible:outline-none aria-[invalid=true]:shadow-[0_0_0_1.5px_rgb(var(--c-negative))]',
              emphasis ? 'text-title-md' : 'text-body'
            )}
          />
          <span className="font-mono text-micro text-fg-muted">/100</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={numeric}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} slider`}
        tabIndex={-1}
        className={cn('mt-2 w-full accent-[rgb(var(--c-fg))]', value.trim() === '' && 'opacity-40')}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 flex items-center gap-1.5 text-body-sm text-negative">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};
