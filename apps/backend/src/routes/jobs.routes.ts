import { Router, Response } from 'express';
import { authenticateUser, requireRole } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { SupabaseService } from '../services/supabase.service';
import { JobsService } from '../services/jobs.service';

const router = Router();

/**
 * GET /api/v1/jobs/recommendations
 * Candidate-only endpoint computing skill overlap percentage between the candidate's
 * profiles.skills and each jobs.skills_required row. Pure set logic without ML/AI calls.
 */
router.get(
  '/recommendations',
  authenticateUser,
  requireRole(['candidate']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const profile = await SupabaseService.getProfileByUserId(user.id);
      const candidateSkills = profile?.skills || [];

      const recommendations = await JobsService.getRecommendedJobs(candidateSkills);

      res.status(200).json({
        user_id: user.id,
        candidate_skills: candidateSkills,
        total_jobs: recommendations.length,
        recommendations,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
