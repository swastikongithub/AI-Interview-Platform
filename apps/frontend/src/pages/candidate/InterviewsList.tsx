import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus } from 'lucide-react';
import { apiService } from '../../services/api';
import { interviewTitle, queryKeys, useInterviews } from '../../lib/queries';
import { describeError, formatDate, shortId } from '../../lib/format';
import { interviewStatusMeta } from '../../lib/status';
import type { Interview } from '../../types';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/Layout';
import { Segmented } from '../../components/ui/Segmented';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, ListSkeleton, StateBlock } from '../../components/ui/States';

type Filter = 'active' | 'completed' | 'closed' | 'all';

const filterFns: Record<Filter, (i: Interview) => boolean> = {
  active: (i) => i.status === 'ready' || i.status === 'in_progress' || i.status === 'draft',
  completed: (i) => i.status === 'completed',
  closed: (i) => i.status === 'cancelled' || i.status === 'expired',
  all: () => true,
};

const rowAction: Partial<Record<Interview['status'], string>> = {
  in_progress: 'Resume',
  ready: 'Open brief',
  completed: 'View results',
};

export const InterviewsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useInterviews();
  const [filter, setFilter] = useState<Filter>('active');

  const createPractice = useMutation({
    mutationFn: () => apiService.createPracticeInterview('practice', 'text'),
    onSuccess: (interview) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
      navigate(`/candidate/interviews/${interview.id}`);
    },
  });

  const interviews = query.data ?? [];
  const counts = useMemo(
    () => ({
      active: interviews.filter(filterFns.active).length,
      completed: interviews.filter(filterFns.completed).length,
      closed: interviews.filter(filterFns.closed).length,
      all: interviews.length,
    }),
    [interviews]
  );
  const visible = interviews.filter(filterFns[filter]);

  return (
    <div>
      <PageHeader
        kicker="Practice"
        title={<h1>Interviews</h1>}
        description="Text interviews you can take at your own pace. Answers save when you submit each one."
        actions={
          <Button
            variant="primary"
            leadingIcon={<Plus />}
            loading={createPractice.isPending}
            loadingLabel="Creating…"
            onClick={() => createPractice.mutate()}
          >
            New practice interview
          </Button>
        }
      />

      {createPractice.isError && (
        <p role="alert" className="mb-6 rounded-sm bg-negative-soft px-3.5 py-3 text-body-sm text-negative">
          {describeError(createPractice.error, 'Could not create the interview.').message}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Filter interviews"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'active', label: 'Active', count: query.isSuccess ? counts.active : undefined },
            { value: 'completed', label: 'Completed', count: query.isSuccess ? counts.completed : undefined },
            { value: 'closed', label: 'Closed', count: query.isSuccess ? counts.closed : undefined },
            { value: 'all', label: 'All', count: query.isSuccess ? counts.all : undefined },
          ]}
        />
      </div>

      {query.isPending ? (
        <ListSkeleton rows={5} label="Loading interviews" className="border-t border-edge" />
      ) : query.isError ? (
        <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} className="border-t border-edge" />
      ) : visible.length === 0 ? (
        <div className="border-t border-edge">
          <StateBlock
            kind="empty"
            title={interviews.length === 0 ? 'No interviews yet' : 'Nothing in this view'}
            description={
              interviews.length === 0
                ? 'Start a practice interview to rehearse structured answers. It takes about ten minutes.'
                : 'Try another filter to see the rest of your interviews.'
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md bg-surface shadow-hairline">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_7rem_8rem_9rem_7.5rem] gap-4 border-b border-edge px-5 py-2.5 text-meta text-fg-muted md:grid">
            <span>Interview</span>
            <span>Mode</span>
            <span>Created</span>
            <span>Status</span>
            <span className="sr-only">Action</span>
          </div>
          <ul className="stagger divide-y divide-edge">
            {visible.map((interview) => {
              const meta = interviewStatusMeta[interview.status];
              const to =
                interview.status === 'completed'
                  ? `/candidate/interviews/${interview.id}/evaluation`
                  : `/candidate/interviews/${interview.id}`;
              return (
                <li key={interview.id}>
                  <Link
                    to={to}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors duration-quick hover:bg-surface-hover md:grid-cols-[minmax(0,1.6fr)_7rem_8rem_9rem_7.5rem]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-title-sm text-fg">{interviewTitle(interview)}</span>
                      <span className="block font-mono text-meta text-fg-muted">#{shortId(interview.id)}</span>
                    </span>
                    <span className="hidden font-mono text-meta uppercase text-fg-secondary md:block">{interview.mode}</span>
                    <span className="hidden text-body-sm text-fg-secondary md:block">{formatDate(interview.scheduled_at)}</span>
                    <span className="col-start-1 row-start-2 flex items-center gap-3 md:col-auto md:row-auto">
                      <StatusBadge meta={meta} />
                      <span className="text-body-sm text-fg-muted md:hidden">{formatDate(interview.scheduled_at)}</span>
                    </span>
                    <span className="col-start-2 row-span-2 row-start-1 inline-flex items-center justify-end gap-1 text-body-sm text-fg-secondary group-hover:text-fg md:col-auto md:row-auto">
                      <span className="hidden sm:inline">{rowAction[interview.status] ?? 'View'}</span>
                      <ArrowRight className="size-4 transition-transform duration-quick ease-out group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
