import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { errorHandler } from './middleware/error.js';
import { authRouter } from './routes/auth.js';
import { smtpRouter } from './routes/smtp.js';
import { leadsRouter } from './routes/leads.js';
import { campaignsRouter } from './routes/campaigns.js';
import { aiRouter } from './routes/ai.js';
import { trackingRouter } from './routes/tracking.js';
import { analyticsRouter } from './routes/analytics.js';
import { templatesRouter } from './routes/templates.js';
import { settingsRouter } from './routes/settings.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, limit: env.RATE_LIMIT_MAX, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'outreach-suite-api', date: new Date().toISOString() }));
app.use('/auth', authRouter);
app.use('/smtp', smtpRouter);
app.use('/leads', leadsRouter);
app.use('/campaigns', campaignsRouter);
app.use('/templates', templatesRouter);
app.use('/ai', aiRouter);
app.use('/analytics', analyticsRouter);
app.use('/settings', settingsRouter);
app.use('/t', trackingRouter);
app.use(errorHandler);

app.listen(env.PORT, () => console.log(`API listening on ${env.PORT}`));
