import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight, Search, UserX } from 'lucide-react';
import { apiService } from '../../services/api';
import { interviewTitle, queryKeys, useInterviews } from '../../lib/queries';
import { describeError, formatDate, shortId } from '../../lib/format';
import { interviewStatusMeta } from '../../lib/status';
import type { CandidateProfile, Interview, InterviewStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/Layout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, ListSkeleton, StateBlock } from '../../components/ui/States';
import { cn } from '../../utils/cn';

type Stage = 'all' | InterviewStatus | 'needs_interviewer';

const flow: InterviewStatus[] = ['draft', 'ready', 'in_progress', 'completed'];
const closed: InterviewStatus[] = ['cancelled', 'expired'];
const PAGE = 20;

export const RecruiterDashboard: React.FC = () => {
  const query = useInterviews();
  const [stage, setStage] = useState<Stage>('all');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const interviews = query.data ?? [];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: interviews.length, needs_interviewer: 0 };
    interviews.forEach((i) => {
      c[i.status] = (c[i.status] ?? 0) + 1;
      if (!i.interviewer_id && i.status === 'completed') c.needs_interviewer += 1;
    });
    return c;
  }, [interviews]);

  const staged = interviews.filter((i) =>
    stage === 'all' ? true : stage === 'needs_interviewer' ? !i.interviewer_id && i.status === 'completed' : i.status === stage
  );

  // Resolve names only for candidates on the visible page, deduplicated.
  const candidateIds = Array.from(new Set(staged.slice(0, limit).map((i) => i.candidate_id).filter(Boolean)));
  const profileQueries = useQueries({
    queries: candidateIds.map((cid) => ({
      queryKey: queryKeys.profile(cid),
      queryFn: async (): Promise<CandidateProfile | null> => {
        try {
          return await apiService.getProfileById(cid);
        } catch {
          return null;
        }
      },
      staleTime: 5 * 60 * 1000,
    })),
  });
  const names = new Map<string, string>();
  candidateIds.forEach((cid, idx) => {
    const name = profileQueries[idx]?.data?.name;
    if (name) names.set(cid, name);
  });

  const term = search.trim().toLowerCase();
  const visible = term
    ? staged.filter((i) => i.id.startsWith(term) || i.candidate_id?.startsWith(term) || names.get(i.candidate_id)?.toLowerCase().includes(term))
    : staged;

  const selectStage = (s: Stage) => {
    setStage(s);
    setLimit(PAGE);
  };

  return (
    <div>
      <PageHeader
        kicker="Hiring"
        title={<h1>Pipeline</h1>}
        description="Every interview on the platform, by stage. Open one to review responses, assign an interviewer, or close it."
      />

      {/* Stage flow — doubles as the primary filter */}
      <nav aria-label="Pipeline stages" className="scrollbar-none -mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ol className="flex min-w-max items-stretch gap-px overflow-hidden rounded-md bg-edge shadow-hairline">
          <StageButton label="All" count={counts.all} active={stage === 'all'} onClick={() => selectStage('all')} loading={query.isPending} />
          {flow.map((s) => (
            <StageButton
              key={s}
              label={interviewStatusMeta[s].label}
              count={counts[s] ?? 0}
              active={stage === s}
              onClick={() => selectStage(s)}
              loading={query.isPending}
              arrow
            />
          ))}
          {closed.map((s) => (
            <StageButton
              key={s}
              label={interviewStatusMeta[s].label}
              count={counts[s] ?? 0}
              active={stage === s}
              onClick={() => selectStage(s)}
              loading={query.isPending}
              muted
            />
          ))}
        </ol>
      </nav>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
          <label htmlFor="pipeline-search" className="sr-only">
            Search by candidate name or ID
          </label>
          <input
            id="pipeline-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Candidate name or ID"
            className="h-10 w-full rounded-sm bg-surface pl-9 pr-3 text-body text-fg shadow-hairline placeholder:text-fg-muted focus:shadow-[0_0_0_2px_rgb(var(--c-focus))] focus:outline-none focus-visible:outline-none"
          />
        </div>
        <button
          type="button"
          aria-pressed={stage === 'needs_interviewer'}
          onClick={() => selectStage(stage === 'needs_interviewer' ? 'all' : 'needs_interviewer')}
          className={cn(
            'pressable inline-flex h-10 items-center gap-2 rounded-sm px-3 text-body-sm',
            stage === 'needs_interviewer' ? 'bg-fg text-fg-inverse' : 'bg-surface text-fg-secondary shadow-hairline hover:text-fg'
          )}
        >
          <UserX className="size-4" aria-hidden="true" />
          Finished, no interviewer
          <span className="font-mono text-micro tabular-nums opacity-70">{counts.needs_interviewer}</span>
        </button>
      </div>

      {query.isPending ? (
        <ListSkeleton rows={6} label="Loading pipeline" className="border-t border-edge" />
      ) : query.isError ? (
        <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : visible.length === 0 ? (
        <div className="border-t border-edge">
          <StateBlock
            kind="empty"
            title={interviews.length === 0 ? 'No interviews on the platform yet' : 'No interviews match'}
            description={
              interviews.length === 0
                ? 'Interviews appear here as soon as candidates create them.'
                : 'Try another stage or clear the search.'
            }
          />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md bg-surface shadow-hairline">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Interviews in the {stage === 'all' ? 'whole pipeline' : 'selected stage'}</caption>
              <thead className="hidden border-b border-edge text-meta text-fg-muted md:table-header-group">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-normal">Candidate</th>
                  <th scope="col" className="px-3 py-2.5 font-normal">Interview</th>
                  <th scope="col" className="px-3 py-2.5 font-normal">Stage</th>
                  <th scope="col" className="px-3 py-2.5 font-normal">Interviewer</th>
                  <th scope="col" className="px-3 py-2.5 font-normal">Created</th>
                  <th scope="col" className="px-5 py-2.5 font-normal"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {visible.slice(0, limit).map((i) => (
                  <PipelineRow key={i.id} interview={i} name={names.get(i.candidate_id)} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-mono text-meta text-fg-muted">
              Showing {Math.min(limit, visible.length)} of {visible.length}
            </p>
            {visible.length > limit && (
              <Button variant="secondary" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
                Show more
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const StageButton: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  loading?: boolean;
  arrow?: boolean;
  muted?: boolean;
}> = ({ label, count, active, onClick, loading, muted }) => (
  <li className="flex flex-1">
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex w-full min-w-[7.5rem] flex-col items-start gap-1 px-4 py-3 text-left transition-colors duration-quick ease-out',
        active ? 'bg-fg text-fg-inverse' : muted ? 'bg-surface-sunken text-fg-muted hover:bg-surface' : 'bg-surface text-fg hover:bg-surface-hover'
      )}
    >
      <span className={cn('text-meta', active ? 'text-fg-inverse/70' : 'text-fg-muted')}>{label}</span>
      <span className="font-display text-title-lg tabular-nums">{loading ? '–' : count}</span>
    </button>
  </li>
);

const PipelineRow: React.FC<{ interview: Interview; name?: string }> = ({ interview, name }) => {
  const to = `/recruiter/interviews/${interview.id}`;
  return (
    <tr className="group relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 px-5 py-3.5 transition-colors duration-quick hover:bg-surface-hover md:table-row md:p-0">
      <td className="min-w-0 md:px-5 md:py-3.5">
        {/* The whole row is clickable through this stretched link. */}
        <Link to={to} className="block truncate text-title-sm text-fg after:absolute after:inset-0 after:content-['']">
          {name ?? 'Unnamed candidate'}
        </Link>
        <span className="block font-mono text-meta text-fg-muted">#{shortId(interview.candidate_id)}</span>
      </td>
      <td className="col-start-1 text-body-sm text-fg-secondary md:px-3 md:py-3.5">
        {interviewTitle(interview)}
        <span className="ml-2 font-mono text-micro uppercase text-fg-muted">{interview.mode}</span>
      </td>
      <td className="col-start-2 row-start-1 md:px-3 md:py-3.5">
        <StatusBadge meta={interviewStatusMeta[interview.status]} />
      </td>
      <td className="col-start-1 text-body-sm md:px-3 md:py-3.5">
        {interview.interviewer_id ? (
          <span className="font-mono text-meta text-fg-secondary">
            <span className="md:hidden">Interviewer </span>#{shortId(interview.interviewer_id)}
          </span>
        ) : (
          <span className="text-fg-muted">Unassigned</span>
        )}
      </td>
      <td className="hidden text-body-sm text-fg-secondary md:table-cell md:px-3 md:py-3.5">{formatDate(interview.scheduled_at)}</td>
      <td className="hidden md:table-cell md:px-5 md:py-3.5">
        <ArrowRight className="ml-auto size-4 text-fg-muted transition-transform duration-quick ease-out group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
      </td>
    </tr>
  );
};
