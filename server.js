require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const logger = require('./src/config/logger');

// Middleware
const corsMiddleware = require('./src/middleware/cors');
const apiKeyAuth = require('./src/middleware/auth');
const rateLimiter = require('./src/middleware/rateLimit');
const errorHandler = require('./src/middleware/errorHandler');

// Services
const notionService = require('./src/services/notionService');
const googleSheetsService = require('./src/services/googleSheetsService');
const zapierService = require('./src/services/zapierService');

// Validation
const { validateLead } = require('./src/validation/leadValidation');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(rateLimiter);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Avirixia Automation Backend is running' });
});

// Lead Webhook Endpoint
app.post('/webhook/lead', apiKeyAuth, async (req, res, next) => {
  try {
    // Validate input
    const validatedData = validateLead(req.body);
    
    logger.info('Received lead webhook', { email: validatedData.email });

    // Execute all services in parallel
    await Promise.allSettled([
      notionService.createLeadEntry(validatedData),
      googleSheetsService.appendLead(validatedData),
      zapierService.sendWebhook(validatedData)
    ]);

    res.status(200).json({
      success: true,
      message: 'Lead processed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Error Handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
