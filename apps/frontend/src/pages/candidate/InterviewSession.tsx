import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, ChevronDown, CornerDownLeft, LogOut } from 'lucide-react';
import { apiService } from '../../services/api';
import { interviewTitle, queryKeys, useInterview, useQuestions, useResponses, useSession } from '../../lib/queries';
import { describeError } from '../../lib/format';
import type { InterviewQuestion, InterviewResponse } from '../../types';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { ErrorState, Skeleton, StateBlock } from '../../components/ui/States';
import { BrandMark } from '../../components/shell/BrandMark';
import { TextReveal } from '../../motion/TextReveal';
import { ease, transitions } from '../../motion/tokens';
import { cn } from '../../utils/cn';

const draftKey = (sessionId: string, questionId: string) => `interview-draft:${sessionId}:${questionId}`;

function readDraft(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeDraft(key: string, value: string) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — the draft simply isn't persisted */
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Immersive interview session. Progress lives on the server: on every load
 * the next question is derived from which questions already have responses,
 * so refresh, tab close or a different device all resume at the right place.
 */
export const InterviewSession: React.FC = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const interviewQuery = useInterview(id);
  const sessionQuery = useSession(id, sessionId);
  const questionsQuery = useQuestions(id);
  const responsesQuery = useResponses(id, sessionId);

  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (lastSaved === null) return;
    const t = window.setTimeout(() => setLastSaved(null), 2600);
    return () => window.clearTimeout(t);
  }, [lastSaved]);

  const submit = useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
      apiService.submitResponse(id!, sessionId!, questionId, text),
    onSuccess: (saved, vars) => {
      // The server's response is authoritative; append it rather than refetching.
      queryClient.setQueryData<InterviewResponse[]>(queryKeys.responses(sessionId!), (prev = []) => [...prev, saved]);
      writeDraft(draftKey(sessionId!, vars.questionId), '');
      const idx = (questionsQuery.data ?? []).findIndex((q) => q.id === vars.questionId);
      setLastSaved(idx + 1);
    },
  });

  const complete = useMutation({
    mutationFn: () => apiService.completeSession(id!, sessionId!),
    onSuccess: async () => {
      writeDraftCleanup(sessionId!);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.interview(id!) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.interviews }),
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions(id!) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId!) }),
      ]);
      navigate(`/candidate/interviews/${id}/evaluation`, { replace: true, state: { justCompleted: true } });
    },
  });

  const loading = interviewQuery.isPending || sessionQuery.isPending || questionsQuery.isPending || responsesQuery.isPending;
  const firstError = interviewQuery.error ?? sessionQuery.error ?? questionsQuery.error ?? responsesQuery.error;

  const interview = interviewQuery.data;
  const session = sessionQuery.data;
  const questions = questionsQuery.data ?? [];
  const responses = responsesQuery.data ?? [];

  const answeredIds = new Set(responses.map((r) => r.question_id));
  const answeredCount = questions.filter((q) => answeredIds.has(q.id)).length;
  const current = questions.find((q) => !answeredIds.has(q.id)) ?? null;
  const currentIndex = current ? questions.findIndex((q) => q.id === current.id) : questions.length;
  const progress = questions.length > 0 ? answeredCount / questions.length : 0;

  let body: React.ReactNode;
  if (loading) {
    body = <SessionSkeleton />;
  } else if (firstError) {
    const err = describeError(firstError, 'The session could not be loaded.');
    body = (
      <ErrorState
        size="page"
        error={err.kind === 'not_found' ? { ...err, message: 'This session doesn’t exist or isn’t yours.' } : err}
        title={err.kind === 'not_found' ? 'Session not found' : undefined}
        onRetry={() => {
          interviewQuery.refetch();
          sessionQuery.refetch();
          questionsQuery.refetch();
          responsesQuery.refetch();
        }}
      />
    );
  } else if (!interview || !session || session.interview_id !== id) {
    body = (
      <StateBlock
        kind="not_found"
        size="page"
        title="Session not found"
        description="This session doesn’t belong to this interview."
        actions={<ButtonLink to="/candidate/interviews" variant="secondary">Back to interviews</ButtonLink>}
      />
    );
  } else if (session.status !== 'in_progress') {
    body = (
      <StateBlock
        kind={session.status === 'completed' ? 'empty' : 'not_found'}
        icon={session.status === 'completed' ? Check : undefined}
        size="page"
        title={session.status === 'completed' ? 'This interview is finished' : 'This session was closed'}
        description={
          session.status === 'completed'
            ? 'Your answers were submitted. Results appear once an evaluation is released.'
            : 'It can no longer accept answers.'
        }
        actions={
          session.status === 'completed' ? (
            <ButtonLink to={`/candidate/interviews/${id}/evaluation`} variant="signal" trailingIcon={<ArrowRight />}>
              View results
            </ButtonLink>
          ) : (
            <ButtonLink to={`/candidate/interviews/${id}`} variant="secondary">
              Back to brief
            </ButtonLink>
          )
        }
      />
    );
  } else if (questions.length === 0) {
    body = (
      <StateBlock
        kind="empty"
        size="page"
        title="No questions in this interview"
        description="There’s nothing to answer. Return to your interviews and start a new practice interview."
        actions={<ButtonLink to="/candidate/interviews" variant="secondary">Back to interviews</ButtonLink>}
      />
    );
  } else {
    body = (
      <AnimatePresence mode="wait" initial={false}>
        {current ? (
          <QuestionStage
            key={current.id}
            question={current}
            index={currentIndex}
            total={questions.length}
            sessionId={sessionId!}
            submitting={submit.isPending}
            submitError={submit.isError && submit.variables?.questionId === current.id ? describeError(submit.error).message : null}
            onSubmit={(text) => submit.mutate({ questionId: current.id, text })}
          />
        ) : (
          <FinishStage
            key="finish"
            questions={questions}
            responses={responses}
            finishing={complete.isPending}
            finishError={
              complete.isError && !confirmOpen ? describeError(complete.error, 'The interview could not be finished.').message : null
            }
            onFinish={() => setConfirmOpen(true)}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="theme-night flex min-h-dvh flex-col bg-canvas text-fg">
      <header className="sticky top-0 z-header border-b border-edge bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-8">
          <BrandMark className="size-7" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-title-sm text-fg">{interview ? interviewTitle(interview) : 'Interview'}</p>
            <p className="font-mono text-micro uppercase text-fg-muted">
              <span aria-live="polite">
                {lastSaved !== null ? (
                  <span className="text-signal-text">Answer {pad(lastSaved)} saved</span>
                ) : questions.length > 0 ? (
                  `${pad(answeredCount)} of ${pad(questions.length)} answered`
                ) : (
                  'Session'
                )}
              </span>
            </p>
          </div>
          <Link
            to={`/candidate/interviews/${id}`}
            className="pressable inline-flex h-9 items-center gap-2 rounded-sm px-3 text-body-sm text-fg-secondary hover:bg-surface hover:text-fg"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span>
              Save <span className="hidden sm:inline">&amp; exit</span>
            </span>
          </Link>
        </div>
        <ProgressBar value={progress} label={`${answeredCount} of ${questions.length} questions answered`} />
      </header>

      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16 pt-10 sm:px-8 sm:pt-16">
        {body}
      </main>

      <ConfirmDialog
        night
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Finish the interview?"
        description="Your answers will be submitted for evaluation. You won’t be able to change them or restart this interview."
        confirmLabel="Finish and submit"
        confirmVariant="signal"
        loading={complete.isPending}
        error={complete.isError ? describeError(complete.error, 'The interview could not be finished.').message : null}
        onConfirm={() => complete.mutate()}
      />
    </div>
  );
};

function writeDraftCleanup(sessionId: string) {
  try {
    const prefix = `interview-draft:${sessionId}:`;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

const ProgressBar: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div
    className="h-0.5 w-full bg-edge"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value * 100)}
  >
    <motion.div
      className="h-full origin-left bg-signal"
      initial={false}
      animate={{ transform: `scaleX(${value})` }}
      transition={{ duration: 0.45, ease: ease.inOut }}
    />
  </div>
);

const SessionSkeleton: React.FC = () => (
  <div role="status" aria-label="Restoring your session" className="space-y-6">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-4/5" />
    <Skeleton className="mt-6 h-64 w-full rounded-md" />
    <p className="font-mono text-meta uppercase text-fg-muted">Restoring your progress from the server…</p>
  </div>
);

interface QuestionStageProps {
  question: InterviewQuestion;
  index: number;
  total: number;
  sessionId: string;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (text: string) => void;
}

/**
 * One question. Keyed by question id by the parent, so it mounts once per
 * question and never while typing. Exit lifts away; the next question's
 * heading is revealed from a mask — a deliberate, rare transition.
 */
const QuestionStage: React.FC<QuestionStageProps> = ({ question, index, total, sessionId, submitting, submitError, onSubmit }) => {
  const reduce = useReducedMotion();
  const headingId = useId();

  return (
    <motion.section
      aria-labelledby={headingId}
      className="flex flex-1 flex-col"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-12px)' }}
      transition={transitions.popover}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-mono text-meta text-signal-text">
          Question {pad(index + 1)}
          <span className="text-fg-muted"> / {pad(total)}</span>
        </p>
        {question.category && (
          <span className="rounded-xs bg-surface px-2 py-0.5 text-meta text-fg-secondary">{question.category}</span>
        )}
        {question.difficulty && (
          <span className="rounded-xs bg-surface px-2 py-0.5 font-mono text-micro uppercase text-fg-muted">
            {question.difficulty}
          </span>
        )}
      </div>

      <TextReveal as="h1" id={headingId} className="mt-5 font-display text-display-md text-fg sm:text-display-lg" delay={0.05}>
        {question.question_text}
      </TextReveal>

      <motion.div
        className="mt-10 flex flex-1 flex-col"
        initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px)' }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.3, ease: ease.out, delay: reduce ? 0 : 0.2 }}
      >
        <AnswerComposer
          questionId={question.id}
          sessionId={sessionId}
          labelledBy={headingId}
          submitting={submitting}
          submitError={submitError}
          isLast={index === total - 1}
          onSubmit={onSubmit}
        />
      </motion.div>
    </motion.section>
  );
};

interface AnswerComposerProps {
  questionId: string;
  sessionId: string;
  labelledBy: string;
  submitting: boolean;
  submitError: string | null;
  isLast: boolean;
  onSubmit: (text: string) => void;
}

/** Owns the answer text locally so keystrokes re-render only this component. */
const AnswerComposer: React.FC<AnswerComposerProps> = ({
  questionId,
  sessionId,
  labelledBy,
  submitting,
  submitError,
  isLast,
  onSubmit,
}) => {
  const key = draftKey(sessionId, questionId);
  const [text, setText] = useState(() => readDraft(key));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hintId = useId();
  const errorId = useId();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const canSubmit = text.trim().length > 0 && !submitting;

  useEffect(() => {
    // Focus the answer box when a new question arrives (after the reveal starts).
    const t = window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 250);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    writeDraft(key, text);
  }, [key, text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (canSubmit) onSubmit(text.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <label htmlFor={`answer-${questionId}`} className="sr-only">
        Your answer
      </label>
      <div
        className={cn(
          'relative flex flex-1 flex-col rounded-md bg-surface shadow-hairline transition-shadow duration-quick ease-out focus-within:shadow-[0_0_0_2px_rgb(var(--c-focus))]',
          submitError && 'shadow-[0_0_0_1.5px_rgb(var(--c-negative))]'
        )}
      >
        <textarea
          ref={textareaRef}
          id={`answer-${questionId}`}
          aria-labelledby={labelledBy}
          aria-describedby={submitError ? errorId : hintId}
          aria-invalid={submitError ? true : undefined}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          readOnly={submitting}
          placeholder="Structure your answer: the context, your approach, and the trade-offs you’d weigh."
          className="min-h-[14rem] flex-1 resize-none rounded-md bg-transparent px-5 py-4 text-body-lg text-fg placeholder:text-fg-muted focus:outline-none focus-visible:outline-none sm:min-h-[18rem]"
        />
        <div className="flex items-center justify-between gap-3 border-t border-edge px-5 py-2.5">
          <p id={hintId} className="font-mono text-micro uppercase text-fg-muted">
            {words} {words === 1 ? 'word' : 'words'}
            <span className="hidden sm:inline"> · Draft kept on this device</span>
          </p>
          <p className="hidden items-center gap-1.5 font-mono text-micro uppercase text-fg-muted sm:flex" aria-hidden="true">
            <kbd className="rounded-xs bg-surface-hover px-1.5 py-0.5">Ctrl</kbd>
            <kbd className="inline-flex items-center rounded-xs bg-surface-hover px-1.5 py-0.5">
              <CornerDownLeft className="size-3" />
            </kbd>
            to submit
          </p>
        </div>
      </div>

      {submitError && (
        <p id={errorId} role="alert" className="mt-3 text-body-sm text-negative">
          {submitError} Your answer is still here — try submitting again.
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-fg-muted">Submitted answers can’t be edited.</p>
        <Button
          type="submit"
          variant="signal"
          size="lg"
          disabled={!canSubmit}
          loading={submitting}
          loadingLabel="Saving answer…"
          trailingIcon={<ArrowRight />}
        >
          {isLast ? 'Submit final answer' : 'Submit and continue'}
        </Button>
      </div>
    </form>
  );
};

interface FinishStageProps {
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  finishing: boolean;
  finishError: string | null;
  onFinish: () => void;
}

const FinishStage: React.FC<FinishStageProps> = ({ questions, responses, finishing, finishError, onFinish }) => {
  const reduce = useReducedMotion();
  const byQuestion = new Map(responses.map((r) => [r.question_id, r]));

  return (
    <motion.section
      aria-labelledby="finish-heading"
      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
      transition={transitions.deliberate}
    >
      <span className="grid size-12 place-items-center rounded-md bg-signal text-signal-fg" aria-hidden="true">
        <Check className="size-6" strokeWidth={2.5} />
      </span>
      <TextReveal as="h1" id="finish-heading" className="mt-6 font-display text-display-lg text-fg" delay={0.1}>
        Every question is answered.
      </TextReveal>
      <p className="mt-4 max-w-prose text-body-lg text-fg-secondary">
        Review what you submitted, then finish to close the session and send it for evaluation.
      </p>

      <ol className="mt-10 divide-y divide-edge rounded-md bg-surface shadow-hairline">
        {questions.map((q, i) => (
          <AnswerReview key={q.id} index={i} question={q} response={byQuestion.get(q.id)} />
        ))}
      </ol>

      {finishError && (
        <p role="alert" className="mt-4 text-body-sm text-negative">
          {finishError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-fg-muted">Not ready? Leave now — your answers stay saved.</p>
        <Button variant="signal" size="lg" loading={finishing} loadingLabel="Finishing…" onClick={onFinish} trailingIcon={<ArrowRight />}>
          Finish interview
        </Button>
      </div>
    </motion.section>
  );
};

const AnswerReview: React.FC<{ index: number; question: InterviewQuestion; response?: InterviewResponse }> = ({
  index,
  question,
  response,
}) => {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  return (
    <li>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors duration-quick hover:bg-surface-hover"
        >
          <span className="pt-0.5 font-mono text-meta text-fg-muted">{pad(index + 1)}</span>
          <span className="flex-1 text-title-sm text-fg">{question.question_text}</span>
          <ChevronDown
            className={cn('mt-0.5 size-4 shrink-0 text-fg-muted transition-transform duration-quick ease-out', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: ease.out }}
            className="overflow-hidden"
          >
            <p className="whitespace-pre-wrap px-5 pb-5 pl-[3.25rem] text-body text-fg-secondary">
              {response?.response_text ?? 'No answer recorded.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};
