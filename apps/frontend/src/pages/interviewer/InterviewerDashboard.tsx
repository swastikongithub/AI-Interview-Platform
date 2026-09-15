import React from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { interviewTitle, queryKeys, useInterviews } from '../../lib/queries';
import { describeError, formatRelative, initials, shortId } from '../../lib/format';
import { interviewStatusMeta } from '../../lib/status';
import type { CandidateProfile, Interview } from '../../types';
import { Avatar, PageHeader, Section } from '../../components/ui/Layout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, ListSkeleton, StateBlock } from '../../components/ui/States';
import { TextReveal } from '../../motion/TextReveal';

export const InterviewerDashboard: React.FC = () => {
  const query = useInterviews();
  const interviews = query.data ?? [];

  const toAssess = interviews.filter((i) => i.status === 'completed');
  const underway = interviews.filter((i) => i.status === 'in_progress');
  const upcoming = interviews.filter((i) => i.status === 'ready' || i.status === 'draft');
  const closed = interviews.filter((i) => i.status === 'cancelled' || i.status === 'expired');

  const candidateIds = Array.from(new Set(interviews.map((i) => i.candidate_id))).slice(0, 25);
  const profiles = useQueries({
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
  const nameOf = (cid: string) => profiles[candidateIds.indexOf(cid)]?.data?.name ?? null;

  return (
    <div>
      <PageHeader
        kicker="Assessment"
        title={
          <TextReveal>
            {query.isSuccess && toAssess.length > 0
              ? `${toAssess.length} ${toAssess.length === 1 ? 'interview is' : 'interviews are'} ready to assess.`
              : 'Assignments'}
          </TextReveal>
        }
        description="Interviews assigned to you. Finished interviews can be scored now; the rest are listed so you know what’s coming."
      />

      {query.isPending ? (
        <ListSkeleton rows={5} label="Loading assignments" className="border-t border-edge" />
      ) : query.isError ? (
        <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : interviews.length === 0 ? (
        <div className="border-t border-edge">
          <StateBlock
            kind="empty"
            size="page"
            title="Nothing assigned to you"
            description="When a recruiter assigns you an interview, it appears here. You’ll be able to read the candidate’s answers and score them."
          />
        </div>
      ) : (
        <div className="space-y-12">
          <Group title="Ready to assess" description="The candidate has finished. Read the responses and record your evaluation." items={toAssess} nameOf={nameOf} emphasis empty="No finished interviews waiting." />
          <Group title="Candidate answering" description="In progress — responses appear as they’re submitted." items={underway} nameOf={nameOf} empty="No interviews in progress." />
          <Group title="Not started" items={upcoming} nameOf={nameOf} empty="Nothing upcoming." />
          {closed.length > 0 && <Group title="Closed" items={closed} nameOf={nameOf} empty="" />}
        </div>
      )}
    </div>
  );
};

const Group: React.FC<{
  title: string;
  description?: string;
  items: Interview[];
  nameOf: (cid: string) => string | null;
  empty: string;
  emphasis?: boolean;
}> = ({ title, description, items, nameOf, empty, emphasis }) => (
  <Section title={title} description={description} actions={<span className="font-mono text-meta tabular-nums text-fg-muted">{items.length}</span>}>
    {items.length === 0 ? (
      <p className="text-body-sm text-fg-muted">{empty}</p>
    ) : (
      <ul className={emphasis ? 'stagger grid grid-cols-1 gap-3 md:grid-cols-2' : 'divide-y divide-edge'}>
        {items.map((i) => {
          const name = nameOf(i.candidate_id);
          return (
            <li key={i.id}>
              <Link
                to={`/interviewer/interviews/${i.id}`}
                className={
                  emphasis
                    ? 'group flex items-center gap-4 rounded-md bg-surface p-4 shadow-hairline transition-shadow duration-quick ease-out hover:shadow-[0_0_0_1px_rgb(var(--c-fg))]'
                    : 'group -mx-3 flex items-center gap-4 rounded-sm px-3 py-3 transition-colors duration-quick hover:bg-surface'
                }
              >
                <Avatar label={initials(name ?? i.candidate_id)} tone={emphasis ? 'signal' : 'default'} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-title-sm text-fg">{name ?? `Candidate #${shortId(i.candidate_id)}`}</span>
                  <span className="block text-body-sm text-fg-muted">
                    {interviewTitle(i)} · {formatRelative(i.scheduled_at)}
                  </span>
                </span>
                {!emphasis && <StatusBadge meta={interviewStatusMeta[i.status]} className="hidden sm:inline-flex" />}
                <ArrowRight className="size-4 text-fg-muted transition-transform duration-quick ease-out group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    )}
  </Section>
);
