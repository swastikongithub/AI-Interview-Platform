import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { v4 as uuidv4 } from 'uuid';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import resumeRoutes from './routes/resume.routes';
import jobsRoutes from './routes/jobs.routes';
import config from './config';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './middleware/requestId';
import { openApiSpec } from './docs/swagger';
import { ResumeQueueService } from './services/resumeQueue.service';
import { GeminiService } from './services/gemini.service';

const app: Express = express();
ResumeQueueService.init().catch((err) => {
  logger.error({ err: err.message }, 'Failed to initialize ResumeQueueService');
  process.exit(1);
});
try {
  GeminiService.init();
} catch (err: any) {
  logger.error({ err: err.message }, 'Failed to initialize GeminiService');
  process.exit(1);
}

// Middleware: Request ID & JSON Parsing & CORS
app.use(requestIdMiddleware);
app.use(cors());
app.use(express.json());

// Ground Rule #4: Rate limiting on all endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1', apiLimiter);

// ---------------------------------------------------------------------------
// 6. HEALTH & READINESS ENDPOINTS (Unauthenticated)
// ---------------------------------------------------------------------------

const healthHandler = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    database_mode: config.database.isRealSupabase ? 'supabase_postgres' : 'local_mock',
  });
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// ---------------------------------------------------------------------------
// EDGE CASE #1: LOCK DOWN /ready — NO MOCK-PASS IN PRODUCTION
// ---------------------------------------------------------------------------
app.get('/ready', async (req: Request, res: Response) => {
  try {
    if (!config.supabaseAdmin) {
      throw new Error('Database client not initialized. Real Supabase credentials are required.');
    }
    
    // Check Database
    const { error } = await config.supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    if (error) {
      throw new Error(`Database check failed: ${error.message}`);
    }

    // Since BullMQ requires Redis, we should also check Redis connection if possible,
    // but the DB check is sufficient for basic readiness if we assume Redis is checked at startup.
    
    return res.status(200).json({
      status: 'ready',
      mode: 'verified',
    });
  } catch (err: any) {
    logger.error({ err: err.message }, 'Readiness check failed');
    return res.status(503).json({
      status: 'unavailable',
      error: 'Service dependencies unreachable',
    });
  }
});

// ---------------------------------------------------------------------------
// EDGE CASE #2: HARD-GATE SWAGGER UI — NOT JUST A DEV-MODE COMMENT
// ---------------------------------------------------------------------------
if (config.env === 'development') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

// ---------------------------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/jobs', jobsRoutes);


if (config.env !== 'production') {
  app.get('/api/v1/test-error', (req: Request, res: Response, next: NextFunction) => {
    next(new Error('Sensitive database SQL syntax error in /var/www/app/src/db.ts:14'));
  });
}

// ---------------------------------------------------------------------------
// EDGE CASE #3: ERROR RESPONSES — LOG FULL DETAIL SERVER-SIDE,
// RETURN ONLY errorId TO CLIENT
// ---------------------------------------------------------------------------

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorId = uuidv4();

  // Log full error (message, stack trace, request ID, error ID) server-side only
  logger.error({
    errorId,
    reqId: req.id,
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
  }, `Server Error [${errorId}]: ${err.message}`);

  // Return ONLY errorId and generic safe message to the client
  res.status(500).json({
    errorId,
    message: 'An internal server error occurred. Please contact support with this error ID.',
  });
});

export default app;
