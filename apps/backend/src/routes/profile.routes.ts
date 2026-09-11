import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';
import { SupabaseService } from '../services/supabase.service';

const router = Router();

const EducationItemSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  year: z.string().min(1, 'Year is required'),
});

const ExperienceItemSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().optional(),
});

const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  skills: z.array(z.string()).default([]),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
  resume_file_url: z.string().url('Invalid Resume File URL').optional().or(z.literal('')),
});

const UserIdParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// GET /api/v1/profiles/me
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const profile = await SupabaseService.getProfileByUserId(user.id);
    if (!profile) {
      res.status(200).json({
        user_id: user.id,
        name: '',
        education: [],
        experience: [],
        skills: [],
      });
      return;
    }
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/profiles/me
router.put(
  '/me',
  authenticateUser,
  validateBody(ProfileUpdateSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const profileData = req.body;

      const updatedProfile = await SupabaseService.upsertProfile({
        ...profileData,
        user_id: user.id,
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: updatedProfile,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/v1/profiles/:userId
router.get(
  '/:userId',
  authenticateUser,
  validateParams(UserIdParamSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const caller = req.user!;
      const { userId } = req.params;

      // RLS/RBAC Check: User can only view own profile unless they are recruiter/interviewer/admin
      if (caller.id !== userId && !['recruiter', 'interviewer', 'admin'].includes(caller.role)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to view this profile' });
        return;
      }

      const profile = await SupabaseService.getProfileByUserId(userId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
