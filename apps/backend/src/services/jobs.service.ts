import { JobRecommendation } from '../types';
import { SupabaseService } from './supabase.service';

export class JobsService {
  /**
   * Computes skill overlap between candidate skills and job required skills.
   * Pure set logic (no ML, no AI call needed for this part).
   * Returns jobs sorted descending by match percentage.
   */
  static async getRecommendedJobs(candidateSkills: string[] = []): Promise<JobRecommendation[]> {
    const jobs = await SupabaseService.getJobs();

    // Standardize candidate skills to lowercase for case-insensitive set matching
    const candidateSkillsLower = new Set(
      candidateSkills.map((s) => s.trim().toLowerCase()).filter(Boolean)
    );

    const recommendations: JobRecommendation[] = jobs.map((job) => {
      const requiredSkills = job.skills_required || [];
      const matched_skills: string[] = [];

      for (const reqSkill of requiredSkills) {
        if (candidateSkillsLower.has(reqSkill.trim().toLowerCase())) {
          matched_skills.push(reqSkill);
        }
      }

      const totalRequired = requiredSkills.length || 1;
      const match_percentage = Math.round((matched_skills.length / totalRequired) * 100);

      return {
        ...job,
        match_percentage,
        matched_skills,
      };
    });

    // Sort descending by match_percentage, then by title
    recommendations.sort((a, b) => {
      if (b.match_percentage !== a.match_percentage) {
        return b.match_percentage - a.match_percentage;
      }
      return a.title.localeCompare(b.title);
    });

    return recommendations;
  }
}
