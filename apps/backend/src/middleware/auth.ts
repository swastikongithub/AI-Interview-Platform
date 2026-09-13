import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserRole } from '../types';
import { SupabaseService, supabase, isRealSupabase } from '../services/supabase.service';
import { logger } from '../utils/logger';
import { AuthEvents } from '../config/authEvents';

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const reqId = (req as any).id || 'unknown';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(
        { event: AuthEvents.INVALID_TOKEN, reqId },
        'Unauthorized: Missing or invalid authorization header'
      );
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let userId: string | null = null;

    if (isRealSupabase && process.env.TEST_MODE !== 'true') {
      if (!supabase) {
        res.status(500).json({ error: 'Supabase client not initialized' });
        return;
      }
      const { data: authData, error } = await supabase.auth.getUser(token);
      if (error || !authData.user) {
        logger.warn(
          { event: AuthEvents.INVALID_TOKEN, reqId, err: error?.message },
          'Unauthorized: Invalid or expired token'
        );
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }
      userId = authData.user.id;
    } else {
      // In-memory / unit-test mode verification via JWT secret
      try {
        const secret =
          process.env.SUPABASE_JWT_SECRET ||
          'super-secret-jwt-token-with-at-least-32-characters-long';
        const decoded = jwt.verify(token, secret) as any;
        userId = decoded.sub || decoded.id;
        if (!userId) {
          throw new Error('No user ID in token payload');
        }
      } catch (err: any) {
        const event = err.name === 'TokenExpiredError' ? AuthEvents.EXPIRED_TOKEN : AuthEvents.INVALID_TOKEN;
        logger.warn({ event, reqId, error: err.message }, 'Unauthorized: Invalid test JWT');
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }
    }

    const user = await SupabaseService.getUserById(userId!);
    if (!user) {
      logger.warn(
        { event: AuthEvents.INVALID_TOKEN, userId, reqId },
        'Unauthorized: User account record not found in database'
      );
      res.status(401).json({ error: 'Unauthorized: User account record not found in db' });
      return;
    }

    logger.info(
      { event: AuthEvents.LOGIN_SUCCESS, userId: user.id, role: user.role, reqId },
      'User authenticated successfully'
    );
    req.user = user;
    next();
  } catch (err: any) {
    logger.error(
      { event: AuthEvents.INVALID_TOKEN, error: err.message },
      'Authentication unexpected error'
    );
    res.status(500).json({ error: `Authentication error: ${err.message}` });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const reqId = (req as any).id || 'unknown';

    if (!req.user) {
      logger.warn(
        { event: AuthEvents.PERMISSION_DENIED, reqId },
        'Unauthorized: No user authenticated for role guard'
      );
      res.status(401).json({ error: 'Unauthorized: No user authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        {
          event: AuthEvents.ROLE_MISMATCH,
          userId: req.user.id,
          reqId,
          expectedRoles: allowedRoles,
          actualRole: req.user.role,
        },
        'Forbidden: User role does not match required roles'
      );
      res.status(403).json({
        error: `Forbidden: Requires role [${allowedRoles.join(', ')}]. Current role is '${req.user.role}'`,
      });
      return;
    }

    next();
  };
}
