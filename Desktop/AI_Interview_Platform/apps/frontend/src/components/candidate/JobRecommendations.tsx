import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { JobRecommendation } from '../../types';

export const JobRecommendations: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: () => apiService.getJobRecommendations(),
  });

  const recommendations: JobRecommendation[] = data?.recommendations || [];

  if (isLoading) {
    return (
      <div className="bg-editorial-card border border-editorial-border rounded-editorial-lg p-6 shadow-editorial-card">
        <h3 className="text-xl font-outfit font-bold text-editorial-text-primary mb-2">
          Recommended Jobs for You
        </h3>
        <p className="text-sm font-inter text-editorial-text-muted">
          Analyzing skill overlaps against available positions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-editorial-card border border-editorial-border rounded-editorial-lg p-6 shadow-editorial-card">
        <h3 className="text-xl font-outfit font-bold text-editorial-text-primary mb-2">
          Recommended Jobs for You
        </h3>
        <p className="text-sm font-inter text-red-300">
          Failed to load job recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-editorial-card border border-editorial-border rounded-editorial-lg p-6 shadow-editorial-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-outfit font-bold text-editorial-text-primary">
            Recommended Jobs for You
          </h3>
          <p className="text-sm font-inter text-editorial-text-secondary mt-1">
            Positions matched to your technical skills using real-time skill overlap analysis.
          </p>
        </div>
        <span className="text-xs font-inter text-editorial-text-muted">
          {recommendations.length} {recommendations.length === 1 ? 'Job' : 'Jobs'} Found
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-editorial-text-muted font-inter text-sm">
          No job recommendations available yet. Add skills to your profile or upload a resume!
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((job) => {
            const isHighMatch = job.match_percentage >= 70;
            const matchedSet = new Set(
              (job.matched_skills || []).map((s) => s.toLowerCase())
            );

            return (
              <div
                key={job.id}
                className="p-5 bg-editorial-bg/40 border border-editorial-border/60 hover:border-editorial-accent-amber/40 rounded-editorial-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-outfit font-bold text-editorial-text-primary">
                      {job.title}
                    </h4>
                    <p className="text-xs font-inter text-editorial-text-muted mt-1">
                      {job.description}
                    </p>
                  </div>

                  {/* Match Percentage Pill Chip */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-editorial-pill text-xs font-outfit font-bold shrink-0 ${
                      isHighMatch
                        ? 'bg-editorial-accent-amber/15 text-editorial-accent-amber border border-editorial-accent-amber/30'
                        : 'bg-editorial-border/40 text-editorial-text-secondary border border-editorial-border'
                    }`}
                  >
                    {job.match_percentage}% Match
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="mt-4 pt-3 border-t border-editorial-border/40">
                  <p className="text-xs font-inter text-editorial-text-muted mb-2">
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills_required || []).map((skill, idx) => {
                      const isMatched = matchedSet.has(skill.toLowerCase());
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-editorial-pill text-xs font-inter ${
                            isMatched
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-editorial-border/20 text-editorial-text-muted border border-editorial-border/40'
                          }`}
                        >
                          {isMatched ? `✓ ${skill}` : skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
