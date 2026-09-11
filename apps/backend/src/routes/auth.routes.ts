import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest, UserRole } from '../types';
import { SupabaseService } from '../services/supabase.service';

const router = Router();

const RoleSchema = z.object({
  role: z.enum(['candidate', 'recruiter', 'interviewer', 'admin']),
});

router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const profile = await SupabaseService.getProfileByUserId(user.id);
    res.status(200).json({
      user,
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put(
  '/role',
  authenticateUser,
  validateBody(RoleSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const { role } = req.body as { role: UserRole };
      const updatedUser = await SupabaseService.updateUserRole(user.id, role);
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json({
        message: 'Role updated successfully',
        user: updatedUser,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
