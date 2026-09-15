import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { useJobRecommendations } from '../../lib/queries';
import { describeError } from '../../lib/format';
import type { JobRecommendation } from '../../types';
import { ButtonLink } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/Layout';
import { ErrorState, ListSkeleton, StateBlock } from '../../components/ui/States';
import { ease } from '../../motion/tokens';
import { cn } from '../../utils/cn';

export const JobMatchesPage: React.FC = () => {
  const query = useJobRecommendations();
  const jobs: JobRecommendation[] = query.data?.recommendations ?? [];
  const skills = query.data?.candidate_skills ?? [];

  return (
    <div>
      <PageHeader
        kicker="Your profile"
        title={<h1>Job matches</h1>}
        description="Every open role, ranked by how many of its required skills appear on your profile. No guesswork — the percentage is the overlap."
        meta={
          query.isSuccess ? (
            <>
              <span className="font-mono text-meta text-fg-muted">{query.data.total_jobs} roles</span>
              <span className="font-mono text-meta text-fg-muted">{skills.length} of your skills compared</span>
            </>
          ) : undefined
        }
      />

      {query.isPending ? (
        <ListSkeleton rows={4} label="Loading job matches" className="border-t border-edge" />
      ) : query.isError ? (
        <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : skills.length === 0 ? (
        <StateBlock
          kind="empty"
          title="Add skills to see matches"
          description="Matching compares your profile skills with each role’s requirements. Add skills yourself, or upload a résumé to extract them."
          actions={
            <>
              <ButtonLink to="/candidate/profile#skills">Add skills</ButtonLink>
              <ButtonLink to="/candidate/resume" variant="secondary">
                Upload résumé
              </ButtonLink>
            </>
          }
        />
      ) : jobs.length === 0 ? (
        <StateBlock kind="empty" title="No open roles right now" description="When recruiters publish roles, they’ll be ranked here against your skills." />
      ) : (
        <ol className="stagger divide-y divide-edge border-y border-edge">
          {jobs.map((job, i) => (
            <JobRow key={job.id} job={job} rank={i + 1} />
          ))}
        </ol>
      )}
    </div>
  );
};

const JobRow: React.FC<{ job: JobRecommendation; rank: number }> = ({ job, rank }) => {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();
  const matched = new Set((job.matched_skills ?? []).map((s) => s.toLowerCase()));
  const required = job.skills_required ?? [];

  return (
    <li className="grid grid-cols-1 gap-x-8 gap-y-4 py-6 md:grid-cols-[3rem_minmax(0,1fr)_10rem]">
      <span className="hidden font-mono text-meta text-fg-muted md:block">{String(rank).padStart(2, '0')}</span>

      <div className="min-w-0">
        <h2 className="text-title-lg text-fg">{job.title}</h2>
        {job.description && (
          <p className={cn('mt-1.5 max-w-prose text-body text-fg-secondary', !open && 'line-clamp-2')}>{job.description}</p>
        )}

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Required skills for ${job.title}`}>
          {required.map((skill) => {
            const hit = matched.has(skill.toLowerCase());
            return (
              <li
                key={skill}
                className={cn(
                  'inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-body-sm',
                  hit ? 'bg-signal-soft text-fg' : 'text-fg-muted shadow-[inset_0_0_0_1px_rgb(var(--c-edge))]'
                )}
              >
                {hit && <Check className="size-3.5 text-signal-text" strokeWidth={2.5} aria-hidden="true" />}
                {skill}
                <span className="sr-only">{hit ? '(you have this)' : '(missing)'}</span>
              </li>
            );
          })}
        </ul>

        {job.jd_raw_text && (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="mt-4 inline-flex items-center gap-1 rounded-xs text-body-sm text-fg-secondary hover:text-fg"
            >
              {open ? 'Hide full description' : 'Read full description'}
              <ChevronDown className={cn('size-4 transition-transform duration-quick ease-out', open && 'rotate-180')} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: ease.out }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 max-w-prose whitespace-pre-wrap rounded-sm bg-surface p-4 text-body-sm text-fg-secondary shadow-hairline">
                    {job.jd_raw_text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex items-baseline gap-2 md:block md:text-right">
        <p className="font-display text-display-md tabular-nums text-fg">{job.match_percentage}%</p>
        <p className="text-body-sm text-fg-muted">
          {job.matched_skills?.length ?? 0} of {required.length} skills
        </p>
      </div>
    </li>
  );
};
