import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, FileUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { queryKeys, useResumeStatus } from '../../lib/queries';
import { describeError, formatDateTime } from '../../lib/format';
import { resumeStatusMeta } from '../../lib/status';
import type { ATSReport, ResumeExtractedJson, ResumeStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { PageHeader, Section } from '../../components/ui/Layout';
import { Meter } from '../../components/ui/Meter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, Skeleton, StateBlock } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';

const MAX_BYTES = 5 * 1024 * 1024;

export const ResumePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();
  const { notify } = useToast();
  const statusQuery = useResumeStatus();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: (file: File) => apiService.uploadResume(file),
    onSuccess: async (res) => {
      setLocalError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.resumeStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobRecommendations });
      refreshProfile();
      notify(
        res.dedup
          ? { tone: 'info', title: 'Same file as before', description: 'This résumé was already analyzed, so the existing report is shown.' }
          : { tone: 'success', title: 'Résumé uploaded', description: 'Analysis has started. This page updates when it’s done.' }
      );
    },
  });

  const pickFile = (file: File | undefined) => {
    upload.reset();
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setLocalError(`“${file.name}” isn’t a PDF. Export your résumé as a PDF and try again.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(`“${file.name}” is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`);
      return;
    }
    setLocalError(null);
    upload.mutate(file);
  };

  const data = statusQuery.data;
  const status = (data?.resume_status ?? 'none') as ResumeStatus;
  const report: ATSReport | null = data?.ats_report ?? null;
  const extracted: ResumeExtractedJson | null = data?.resume_extracted_json ?? null;
  const uploadError = localError ?? (upload.isError ? describeError(upload.error, 'The upload failed.').message : null);
  const processing = status === 'processing' || upload.isPending;

  return (
    <div>
      <PageHeader
        kicker="Your profile"
        title={<h1>Résumé &amp; ATS</h1>}
        description="Upload a text-based PDF. We extract your experience and score how it reads to applicant tracking systems."
        meta={statusQuery.isSuccess ? <StatusBadge meta={resumeStatusMeta[status] ?? resumeStatusMeta.none} /> : undefined}
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <div className="space-y-12">
          {/* Upload target: a real button for keyboard users, a drop zone for pointer users. */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              'relative overflow-hidden rounded-lg border-2 border-dashed p-6 transition-[border-color,background-color] duration-quick ease-out sm:p-8',
              dragActive ? 'border-fg bg-signal-soft' : 'border-edge-strong bg-surface'
            )}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <span
                className={cn(
                  'grid size-14 shrink-0 place-items-center rounded-md transition-colors duration-quick',
                  dragActive ? 'bg-fg text-fg-inverse' : 'bg-surface-sunken text-fg-secondary'
                )}
                aria-hidden="true"
              >
                <FileUp className="size-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-title-lg text-fg">
                  {upload.isPending ? 'Uploading…' : dragActive ? 'Drop to upload' : status === 'none' ? 'Upload your résumé' : 'Replace your résumé'}
                </p>
                <p className="mt-1 text-body-sm text-fg-muted">PDF only · up to 5 MB · 10 analyses per hour</p>
              </div>
              <Button
                variant={status === 'none' ? 'signal' : 'secondary'}
                size="lg"
                loading={upload.isPending}
                loadingLabel="Uploading…"
                disabled={processing}
                onClick={() => inputRef.current?.click()}
              >
                {status === 'none' ? 'Choose PDF' : 'Choose new PDF'}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
            {processing && <div className="activity-bar absolute inset-x-0 bottom-0 h-1 bg-edge" aria-hidden="true" />}
          </div>

          {uploadError && (
            <p role="alert" className="-mt-8 flex items-start gap-2 rounded-sm bg-negative-soft px-3.5 py-3 text-body-sm text-negative">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {uploadError}
            </p>
          )}

          {statusQuery.isPending ? (
            <div className="space-y-4" role="status" aria-label="Loading résumé status">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32" />
            </div>
          ) : statusQuery.isError ? (
            <ErrorState error={describeError(statusQuery.error)} onRetry={() => statusQuery.refetch()} retrying={statusQuery.isFetching} />
          ) : status === 'processing' ? (
            <div role="status" aria-live="polite">
              <StateBlock
                kind="pending"
                title="Analyzing your résumé"
                description={
                  <>
                    Text extraction and ATS scoring run in the background — usually under a minute.
                    {data?.processing_started_at && (
                      <span className="mt-1 block font-mono text-meta text-fg-muted">Started {formatDateTime(data.processing_started_at)}</span>
                    )}
                  </>
                }
              />
            </div>
          ) : status === 'failed' ? (
            <StateBlock
              kind="error"
              title="The analysis didn’t finish"
              description="This usually means the PDF has no selectable text (for example, a scanned image). Export a text-based PDF and upload it again."
              actions={
                <Button variant="secondary" size="sm" leadingIcon={<RefreshCw />} onClick={() => inputRef.current?.click()}>
                  Upload another file
                </Button>
              }
            />
          ) : status === 'complete' && report ? (
            <AtsReport report={report} completedAt={data?.processing_completed_at} durationMs={data?.processing_duration_ms} />
          ) : (
            <StateBlock
              kind="empty"
              title="No report yet"
              description="Once you upload a PDF, your ATS score, missing keywords and structural notes appear here."
            />
          )}
        </div>

        <aside className="space-y-10 lg:sticky lg:top-10 lg:self-start" aria-label="Extracted details">
          <Section title="Extracted from your résumé" headingLevel="h2">
            {extracted && (extracted.skills?.length || extracted.experience?.length || extracted.education?.length || extracted.name) ? (
              <ExtractedDetails data={extracted} />
            ) : (
              <p className="text-body-sm text-fg-muted">Nothing extracted yet.</p>
            )}
          </Section>
        </aside>
      </div>
    </div>
  );
};

const AtsReport: React.FC<{ report: ATSReport; completedAt?: string | null; durationMs?: number | null }> = ({
  report,
  completedAt,
  durationMs,
}) => {
  const keywords = report.missing_keywords ?? [];
  const grammar = report.grammar_notes ?? [];
  const suggestions = report.improvement_suggestions ?? [];
  const band = report.score >= 80 ? 'Strong' : report.score >= 60 ? 'Workable' : 'Needs work';

  return (
    <div className="space-y-12">
      <section aria-labelledby="ats-score" className="grid grid-cols-1 gap-6 border-t border-edge pt-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end sm:gap-10">
        <div>
          <p id="ats-score" className="text-meta text-fg-muted">ATS score</p>
          <p className="font-display text-[4.5rem] font-semibold leading-none tracking-[-0.04em] text-fg">
            {report.score}
            <span className="ml-1 font-mono text-body text-fg-muted">/100</span>
          </p>
        </div>
        <div className="space-y-3 pb-2">
          <Meter label={band} value={report.score} size="sm" />
          <p className="font-mono text-micro uppercase text-fg-muted">
            {completedAt ? `Analyzed ${formatDateTime(completedAt)}` : 'Analyzed'}
            {typeof durationMs === 'number' ? ` · ${(durationMs / 1000).toFixed(1)}s` : ''}
            {report.model ? ` · ${report.model}` : ''}
          </p>
        </div>
      </section>

      <Section index="01" title="Missing keywords" description="Terms commonly expected for your target roles that your résumé doesn’t mention.">
        {keywords.length === 0 ? (
          <p className="text-body-sm text-fg-muted">No missing keywords flagged.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li key={k} className="rounded-sm bg-caution-soft px-2.5 py-1 text-body-sm text-caution">
                {k}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section index="02" title="What to improve">
        {suggestions.length === 0 ? (
          <p className="text-body-sm text-fg-muted">No suggestions in this report.</p>
        ) : (
          <ol className="space-y-4">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-meta text-fg-muted">{String(i + 1).padStart(2, '0')}</span>
                <p className="max-w-prose text-body text-fg">{s}</p>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section index="03" title="Language & formatting">
        {grammar.length === 0 ? (
          <p className="text-body-sm text-fg-muted">No language or formatting issues noted.</p>
        ) : (
          <ul className="space-y-3">
            {grammar.map((g, i) => (
              <li key={i} className="flex gap-3 text-body text-fg-secondary">
                <span className="mt-2.5 h-px w-3 shrink-0 bg-fg-muted" aria-hidden="true" />
                {g}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Link to="/candidate/jobs" className="group inline-flex items-center gap-2 rounded-xs text-title-sm text-fg">
        See roles that match your skills
        <ArrowRight className="size-4 transition-transform duration-quick ease-out group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
};

const ExtractedDetails: React.FC<{ data: ResumeExtractedJson }> = ({ data }) => (
  <dl className="space-y-6">
    {data.name && (
      <div>
        <dt className="text-meta text-fg-muted">Name</dt>
        <dd className="mt-1 text-body text-fg">{data.name}</dd>
      </div>
    )}
    {data.skills && data.skills.length > 0 && (
      <div>
        <dt className="text-meta text-fg-muted">Skills · {data.skills.length}</dt>
        <dd className="mt-2 flex flex-wrap gap-1.5">
          {data.skills.map((s) => (
            <span key={s} className="rounded-xs bg-surface-sunken px-2 py-0.5 text-body-sm text-fg-secondary">
              {s}
            </span>
          ))}
        </dd>
      </div>
    )}
    {data.experience && data.experience.length > 0 && (
      <div>
        <dt className="text-meta text-fg-muted">Experience</dt>
        <dd className="mt-2 space-y-2.5">
          {data.experience.map((e, i) => (
            <p key={i} className="text-body-sm">
              <span className="text-fg">{e.role}</span>
              <span className="text-fg-muted"> · {e.company}</span>
              {e.duration && <span className="block font-mono text-meta text-fg-muted">{e.duration}</span>}
            </p>
          ))}
        </dd>
      </div>
    )}
    {data.education && data.education.length > 0 && (
      <div>
        <dt className="text-meta text-fg-muted">Education</dt>
        <dd className="mt-2 space-y-2.5">
          {data.education.map((e, i) => (
            <p key={i} className="text-body-sm">
              <span className="text-fg">{e.degree}</span>
              <span className="text-fg-muted"> · {e.institution}</span>
              {e.year && <span className="block font-mono text-meta text-fg-muted">{e.year}</span>}
            </p>
          ))}
        </dd>
      </div>
    )}
    <p className="border-t border-edge pt-4 text-body-sm text-fg-muted">
      Want these on your profile?{' '}
      <Link to="/candidate/profile#skills" className="rounded-xs text-fg underline decoration-edge-strong underline-offset-4">
        Review your profile
      </Link>
    </p>
  </dl>
);
