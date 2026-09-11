import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticateUser, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest, UserRole } from '../types';
import { SupabaseService } from '../services/supabase.service';

const router = Router();

const RoleSchema = z.object({
  userId: z.string().uuid('A valid target userId is required'),
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

// Admin-only: assign a role to another user's account.
// Regular users can NEVER change their own role (self-service role escalation is not permitted).
router.put(
  '/role',
  authenticateUser,
  requireRole(['admin']),
  validateBody(RoleSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId, role } = req.body as { userId: string; role: UserRole };

      const targetUser = await SupabaseService.getUserById(userId);
      if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const updatedUser = await SupabaseService.updateUserRole(userId, role);
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
