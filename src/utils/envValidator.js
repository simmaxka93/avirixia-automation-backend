/**
 * Environment Variable Validator
 * Validates required environment variables at startup
 */

const logger = require('./logger');

const REQUIRED_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'NOTION_TOKEN',
  'NOTION_DATABASE_ID',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SPREADSHEET_ID',
  'API_KEY',
  'CORS_ORIGIN'
];

const OPTIONAL_ENV_VARS = [
  'ZAPIER_WEBHOOK_URL',
  'SENTRY_DSN',
  'REDIS_URL',
  'LOG_LEVEL'
];

function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables (warnings only)
  OPTIONAL_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // Log warnings for optional variables
  if (warnings.length > 0) {
    logger.warn('Optional environment variables not set:', {
      variables: warnings,
      message: 'Some features may be disabled'
    });
  }

  // Fail if required variables are missing
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(errorMessage);
    logger.error('Please check your .env file or Railway environment variables');
    throw new Error(errorMessage);
  }

  // Validate specific formats
  if (process.env.GOOGLE_PRIVATE_KEY && !process.env.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
    logger.warn('GOOGLE_PRIVATE_KEY may be incorrectly formatted');
  }

  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    throw new Error('PORT must be a valid number');
  }

  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    logger.warn(`NODE_ENV '${process.env.NODE_ENV}' is not standard. Use: development, production, or test`);
  }

  logger.info('Environment validation successful', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    optionalVarsSet: OPTIONAL_ENV_VARS.filter(v => process.env[v]).length
  });

  return true;
}

module.exports = {
  validateEnv,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
};
