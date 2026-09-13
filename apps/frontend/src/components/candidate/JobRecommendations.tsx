import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { JobRecommendation } from '../../types';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';

export const JobRecommendations: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: () => apiService.getJobRecommendations(),
  });

  const recommendations: JobRecommendation[] = data?.recommendations || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="border-b border-line pb-4 flex justify-between items-end">
          <h2 className="text-3xl font-serif text-ink tracking-tight">Curated Opportunities</h2>
          <span className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">Loading Opportunities...</span>
        </div>
        <div className="h-32 border border-line bg-paper-raised animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="border-b border-line pb-4 flex justify-between items-end">
          <h2 className="text-3xl font-serif text-ink tracking-tight">Curated Opportunities</h2>
        </div>
        <div className="p-6 border border-critical/30 bg-critical/5 text-critical text-sm font-sans">
          Telemetry failure while retrieving opportunities.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="border-b border-line pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-accent mb-3 block">Alignment Matrix</span>
          <h2 className="text-4xl font-serif text-ink tracking-tight">
            <MaskedTextReveal text="Curated Opportunities" delay={0.2} />
          </h2>
        </div>
        <span className="font-mono text-xs text-ink-muted uppercase tracking-widest pb-1">
          {recommendations.length} Active Vectors
        </span>
      </div>

      {recommendations.length === 0 ? (
        <Reveal delay={0.4}>
          <div className="py-16 text-center border border-dashed border-line">
            <p className="text-lg font-serif text-ink mb-2">Insufficient Data</p>
            <p className="text-sm font-sans text-ink-muted">Update your skills or initialize your dossier to unlock predictive job matching.</p>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-16">
          {recommendations.map((job, idx) => {
            const isHighMatch = job.match_percentage >= 70;
            const matchedSet = new Set((job.matched_skills || []).map((s) => s.toLowerCase()));

            return (
              <Reveal key={job.id} delay={0.3 + (idx * 0.1)} y={30}>
                <div className="group border-t border-line pt-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="max-w-2xl">
                      <h4 className="text-3xl font-serif text-ink mb-4 group-hover:text-accent transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-base font-sans font-light text-ink-muted leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Match Fidelity</span>
                      <div className={`text-4xl font-serif tracking-tight ${isHighMatch ? 'text-accent' : 'text-ink-muted'}`}>
                        {job.match_percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-line border-dashed">
                    <div className="md:col-span-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-4 block">Required Variables</span>
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      {(job.skills_required || []).map((skill, sIdx) => {
                        const isMatched = matchedSet.has(skill.toLowerCase());
                        return (
                          <span
                            key={sIdx}
                            className={`inline-flex items-center px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-widest border transition-colors ${
                              isMatched
                                ? 'bg-paper-raised text-ink border-line'
                                : 'bg-transparent text-ink-faint border-line/50 border-dashed'
                            }`}
                          >
                            {isMatched ? <span className="text-accent mr-2">✓</span> : null}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
};
