import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useProfileById } from '../../lib/queries';
import { describeError, initials, safeHttpUrl, shortId } from '../../lib/format';
import { Avatar } from '../ui/Layout';
import { ErrorState, Skeleton } from '../ui/States';

/** Candidate identity and background for reviewers. Only real profile data. */
export const CandidateContext: React.FC<{ candidateId: string; compact?: boolean }> = ({ candidateId, compact }) => {
  const query = useProfileById(candidateId);

  if (query.isPending) {
    return (
      <div className="flex items-center gap-3" role="status" aria-label="Loading candidate">
        <Skeleton className="size-9 rounded-sm" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return <ErrorState error={describeError(query.error)} onRetry={() => query.refetch()} />;
  }

  const profile = query.data;
  const name = profile?.name || null;
  const links = [
    { label: 'GitHub', href: profile?.github_url },
    { label: 'LinkedIn', href: profile?.linkedin_url },
    { label: 'Portfolio', href: profile?.portfolio_url },
  ]
    .map((l) => ({ ...l, href: safeHttpUrl(l.href) }))
    .filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar label={initials(name ?? candidateId)} />
        <div className="min-w-0">
          <p className="truncate text-title-md text-fg">{name ?? 'Unnamed candidate'}</p>
          <p className="font-mono text-meta text-fg-muted">Candidate #{shortId(candidateId)}</p>
        </div>
      </div>

      {!profile ? (
        <p className="text-body-sm text-fg-muted">This candidate hasn’t created a profile yet.</p>
      ) : (
        <>
          {profile.skills?.length > 0 && (
            <div>
              <p className="mb-2 text-meta text-fg-muted">Skills</p>
              <ul className="flex flex-wrap gap-1.5">
                {profile.skills.slice(0, compact ? 8 : 24).map((s) => (
                  <li key={s} className="rounded-xs bg-surface-sunken px-2 py-0.5 text-body-sm text-fg-secondary">
                    {s}
                  </li>
                ))}
                {compact && profile.skills.length > 8 && (
                  <li className="px-1 py-0.5 font-mono text-meta text-fg-muted">+{profile.skills.length - 8}</li>
                )}
              </ul>
            </div>
          )}

          {!compact && profile.experience?.length > 0 && (
            <div>
              <p className="mb-2 text-meta text-fg-muted">Experience</p>
              <ul className="space-y-2.5">
                {profile.experience.map((e, i) => (
                  <li key={`${e.company}-${i}`} className="text-body-sm">
                    <span className="text-fg">{e.role}</span>
                    <span className="text-fg-muted"> · {e.company}</span>
                    <span className="block font-mono text-meta text-fg-muted">{e.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {typeof profile.ats_report?.score === 'number' && (
            <p className="text-body-sm text-fg-secondary">
              Résumé ATS score <span className="font-mono text-fg">{profile.ats_report.score}/100</span>
            </p>
          )}

          {links.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xs text-body-sm text-fg-secondary underline decoration-edge-strong underline-offset-4 hover:text-fg"
                  >
                    {l.label}
                    <ExternalLink className="size-3" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
