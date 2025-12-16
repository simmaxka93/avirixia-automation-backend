require('dotenv').config();
const express = require('express');
const logger = require('./src/config/logger');
const { initSentry, getSentryMiddleware } = require('./src/config/sentry');
const { setupSecurity } = require('./src/config/security');
const scheduler = require('./src/config/scheduler');

// Middleware
const corsMiddleware = require('./src/middleware/cors');
const apiKeyAuth = require('./src/middleware/auth');
const rateLimiter = require('./src/middleware/rateLimit');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const healthRoutes = require('./src/routes/health');

// Services
const notionService = require('./src/services/notionService');
const googleSheetsService = require('./src/services/googleSheetsService');
const zapierService = require('./src/services/zapierService');

// Validation
const { validateLead } = require('./src/validation/leadValidation');
const { validateEnv } = require('./src/utils/envValidator');

// Validate environment variables
validateEnv();

const app = express();

// Enable trust proxy for Railway (behind reverse proxy)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Initialize Sentry (before all other middleware)
initSentry(app);
const sentryMiddleware = getSentryMiddleware();
app.use(sentryMiddleware.requestHandler);
app.use(sentryMiddleware.tracingHandler);

// Security middleware
setupSecurity(app);

// Global Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(rateLimiter);

// Health check routes (before API key auth)
app.use('/health', healthRoutes);

// Legacy health check
app.get('/', (req, res) => {
  res.json({ status: 'Avirixia Automation Backend is running' });
});

// Lead Webhook Endpoint
app.post('/webhook/lead', apiKeyAuth, async (req, res, next) => {
  try {
    logger.info('Lead webhook received');
    const leadData = req.body;

    // Validate lead data
    const validation = validateLead(leadData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Process lead in parallel
    const results = await Promise.allSettled([
      notionService.createLead(leadData),
      googleSheetsService.appendLead(leadData),
      zapierService.sendLead(leadData),
    ]);

    // Check results
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      logger.warn('Some services failed', { failures });
    }

    logger.info('Lead processed successfully');
    res.status(200).json({
      success: true,
      message: 'Lead processed',
      results: {
        notion: results[0].status === 'fulfilled',
        googleSheets: results[1].status === 'fulfilled',
        zapier: results[2].status === 'fulfilled',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Sentry error handler (must be before other error handlers)
app.use(sentryMiddleware.errorHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize scheduled tasks
  scheduler.initDefaultTasks();
  logger.info('Scheduled tasks initialized');
});
