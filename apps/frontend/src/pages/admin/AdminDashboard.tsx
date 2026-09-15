import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Minus, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { interviewTitle, queryKeys, useHealth, useInterviews } from '../../lib/queries';
import { describeError, formatDateTime, formatDuration, formatRelative, shortId } from '../../lib/format';
import { interviewStatusMeta, roleLabel } from '../../lib/status';
import type { InterviewStatus, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { SelectField, TextField } from '../../components/ui/Field';
import { PageHeader, Section } from '../../components/ui/Layout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ErrorState, ListSkeleton, Skeleton } from '../../components/ui/States';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statusOrder: InterviewStatus[] = ['draft', 'ready', 'in_progress', 'completed', 'cancelled', 'expired'];
const segmentTone: Record<InterviewStatus, string> = {
  draft: 'bg-edge-strong',
  ready: 'bg-info',
  in_progress: 'bg-caution',
  completed: 'bg-positive',
  cancelled: 'bg-fg-muted',
  expired: 'bg-fg-muted/60',
};

export const AdminDashboard: React.FC = () => (
  <div>
    <PageHeader
      kicker="Platform"
      title={<h1>Operations</h1>}
      description="Live service status, interview activity across all accounts, and role administration."
    />
    <div className="space-y-14">
      <HealthPanel />
      <div className="grid grid-cols-1 gap-14 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <InterviewActivity />
        <RoleAdministration />
      </div>
      <AccessPolicy />
    </div>
  </div>
);

const HealthPanel: React.FC = () => {
  const query = useHealth();
  const data = query.data;
  const healthy = data?.status === 'healthy';

  return (
    <section aria-labelledby="health-title" className="theme-night overflow-hidden rounded-lg bg-canvas text-fg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5" aria-hidden="true">
            {healthy && <span className="absolute inset-0 animate-ping rounded-full bg-positive opacity-60 motion-reduce:animate-none" />}
            <span className={cn('relative size-2.5 rounded-full', query.isPending ? 'bg-fg-muted' : healthy ? 'bg-positive' : 'bg-negative')} />
          </span>
          <h2 id="health-title" className="text-title-md">
            API service
          </h2>
          {!query.isPending && (
            <StatusBadge tone={healthy ? 'positive' : 'negative'}>{query.isError ? 'Unreachable' : healthy ? 'Healthy' : data?.status ?? 'Unknown'}</StatusBadge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<RefreshCw className={cn(query.isFetching && 'animate-spin motion-reduce:animate-none')} />}
          onClick={() => query.refetch()}
          disabled={query.isFetching}
        >
          {query.isFetching ? 'Checking…' : 'Check now'}
        </Button>
      </div>

      {query.isPending ? (
        <div className="grid grid-cols-1 gap-px bg-edge sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Checking service health">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 bg-canvas p-5 sm:p-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="px-5 sm:px-6">
          <ErrorState
            error={describeError(query.error)}
            title="The API didn’t answer its health check"
            onRetry={() => query.refetch()}
            retrying={query.isFetching}
          />
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-px bg-edge sm:grid-cols-2 lg:grid-cols-4">
          <HealthStat label="Uptime" value={formatDuration(data!.uptime)} detail="Since last process start" />
          <HealthStat label="Database" value={data!.database_mode === 'supabase_postgres' ? 'Supabase Postgres' : data!.database_mode === 'local_mock' ? 'Local mock' : data!.database_mode} detail="Reported by the API" />
          <HealthStat label="Version" value={data!.version} mono detail="API package" />
          <HealthStat label="Checked" value={formatRelative(data!.timestamp)} detail={formatDateTime(data!.timestamp)} />
        </dl>
      )}
    </section>
  );
};

const HealthStat: React.FC<{ label: string; value: string; detail: string; mono?: boolean }> = ({ label, value, detail, mono }) => (
  <div className="bg-canvas p-5 sm:p-6">
    <dt className="text-meta text-fg-muted">{label}</dt>
    <dd className={cn('mt-1.5 truncate text-title-lg text-fg', mono && 'font-mono text-title-md')}>{value}</dd>
    <dd className="mt-0.5 truncate text-body-sm text-fg-muted">{detail}</dd>
  </div>
);

const InterviewActivity: React.FC = () => {
  const query = useInterviews();
  const interviews = query.data ?? [];
  const counts = useMemo(() => {
    const c = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<InterviewStatus, number>;
    interviews.forEach((i) => (c[i.status] = (c[i.status] ?? 0) + 1));
    return c;
  }, [interviews]);
  const total = interviews.length;
  const unassignedFinished = interviews.filter((i) => i.status === 'completed' && !i.interviewer_id).length;

  return (
    <Section title="Interview activity" description="All interviews on the platform, by lifecycle state.">
      {query.isPending ? (
        <ListSkeleton rows={4} label="Loading interview activity" />
      ) : query.isError ? (
        <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : total === 0 ? (
        <p className="py-4 text-body-sm text-fg-muted">No interviews have been created yet.</p>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-display-md tabular-nums text-fg">{total}</p>
              {unassignedFinished > 0 && (
                <p className="text-body-sm text-caution">
                  {unassignedFinished} finished without an interviewer
                </p>
              )}
            </div>
            {/* Proportional distribution — each segment is exactly its share of real interviews. */}
            <div className="mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={statusOrder.map((s) => `${interviewStatusMeta[s].label}: ${counts[s]}`).join(', ')}>
              {statusOrder
                .filter((s) => counts[s] > 0)
                .map((s) => (
                  <span key={s} className={cn('h-full', segmentTone[s])} style={{ flexGrow: counts[s], flexBasis: 0 }} />
                ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {statusOrder.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', segmentTone[s])} aria-hidden="true" />
                  <dt className="text-body-sm text-fg-secondary">{interviewStatusMeta[s].label}</dt>
                  <dd className="ml-auto font-mono text-body-sm tabular-nums text-fg">{counts[s]}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="mb-2 text-meta text-fg-muted">Most recent</p>
            <ul className="divide-y divide-edge border-y border-edge">
              {interviews.slice(0, 6).map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                  <span className="font-mono text-meta text-fg-muted">#{shortId(i.id)}</span>
                  <span className="min-w-0 flex-1 truncate text-body-sm text-fg">{interviewTitle(i)}</span>
                  <span className="font-mono text-meta text-fg-muted">cand. #{shortId(i.candidate_id)}</span>
                  <StatusBadge meta={interviewStatusMeta[i.status]} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Section>
  );
};

const RoleAdministration: React.FC = () => {
  const { updateUserRole, user } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<UserRole>('interviewer');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => updateUserRole(userId.trim(), role),
    onSuccess: () => {
      setConfirm(false);
      notify({ tone: 'success', title: 'Role updated', description: `#${shortId(userId.trim())} is now ${roleLabel[role]}.` });
      setUserId('');
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
    },
  });

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.reset();
    const uid = userId.trim();
    if (!UUID.test(uid)) {
      setFieldError('Enter a full user ID (UUID).');
      return;
    }
    if (uid === user?.id) {
      setFieldError('You can’t change your own role here. Ask another administrator.');
      return;
    }
    setFieldError(null);
    setConfirm(true);
  };

  return (
    <Section title="Role administration" description="Assign a role to an existing account. Takes effect on that user’s next request.">
      <form onSubmit={review} noValidate className="space-y-4">
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setFieldError(null);
          }}
          placeholder="00000000-0000-0000-0000-000000000000"
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-body-sm"
          error={fieldError}
        />
        <SelectField label="New role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          {(['candidate', 'recruiter', 'interviewer', 'admin'] as UserRole[]).map((r) => (
            <option key={r} value={r}>
              {roleLabel[r]}
            </option>
          ))}
        </SelectField>
        {role === 'admin' && (
          <p className="flex gap-2 rounded-sm bg-caution-soft px-3 py-2.5 text-body-sm text-caution">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Administrators can change anyone’s role, including yours.
          </p>
        )}
        <Button type="submit" variant="primary">
          Review change
        </Button>
      </form>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Make this user ${roleLabel[role] === 'Administrator' ? 'an' : 'a'} ${roleLabel[role]}?`}
        description={
          <span>
            Account <span className="font-mono text-body-sm text-fg">{userId.trim()}</span> will have{' '}
            {roleLabel[role].toLowerCase()} permissions on its next request.
          </span>
        }
        confirmLabel="Change role"
        confirmVariant={role === 'admin' ? 'danger' : 'primary'}
        loading={mutation.isPending}
        error={mutation.isError ? describeError(mutation.error, 'The role could not be changed.').message : null}
        onConfirm={() => mutation.mutate()}
      />
    </Section>
  );
};

type Access = boolean | string;
const policy: { capability: string; access: Record<UserRole, Access> }[] = [
  { capability: 'Edit own profile', access: { candidate: true, recruiter: true, interviewer: true, admin: true } },
  { capability: 'Upload résumé for ATS analysis', access: { candidate: true, recruiter: false, interviewer: false, admin: false } },
  { capability: 'View other users’ profiles', access: { candidate: false, recruiter: true, interviewer: true, admin: true } },
  { capability: 'Create interviews', access: { candidate: 'Practice & mock', recruiter: true, interviewer: true, admin: true } },
  { capability: 'View interviews', access: { candidate: 'Own only', recruiter: 'All', interviewer: 'Assigned', admin: 'All' } },
  { capability: 'Assign interviewers', access: { candidate: false, recruiter: true, interviewer: false, admin: true } },
  { capability: 'Write evaluations', access: { candidate: false, recruiter: false, interviewer: 'Assigned', admin: true } },
  { capability: 'Read evaluations', access: { candidate: 'Released, own', recruiter: 'All', interviewer: 'Assigned', admin: 'All' } },
  { capability: 'Change user roles', access: { candidate: false, recruiter: false, interviewer: false, admin: true } },
];

const AccessPolicy: React.FC = () => (
  <Section title="Access policy" description="Reference for what the API authorizes per role. Enforcement happens server-side and in database row-level security.">
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <caption className="sr-only">Role permissions</caption>
        <thead>
          <tr className="border-b border-edge text-meta text-fg-muted">
            <th scope="col" className="py-2.5 pr-4 font-normal">Capability</th>
            {(['candidate', 'recruiter', 'interviewer', 'admin'] as UserRole[]).map((r) => (
              <th key={r} scope="col" className="px-3 py-2.5 font-normal">
                {roleLabel[r]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {policy.map((row) => (
            <tr key={row.capability}>
              <th scope="row" className="py-3 pr-4 text-body-sm font-normal text-fg">
                {row.capability}
              </th>
              {(['candidate', 'recruiter', 'interviewer', 'admin'] as UserRole[]).map((r) => {
                const a = row.access[r];
                return (
                  <td key={r} className="px-3 py-3 text-body-sm">
                    {a === true ? (
                      <span className="inline-flex items-center gap-1.5 text-fg">
                        <Check className="size-4 text-positive" aria-hidden="true" /> Yes
                      </span>
                    ) : a === false ? (
                      <span className="inline-flex items-center gap-1.5 text-fg-muted">
                        <Minus className="size-4" aria-hidden="true" /> No
                      </span>
                    ) : (
                      <span className="text-fg-secondary">{a}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);
