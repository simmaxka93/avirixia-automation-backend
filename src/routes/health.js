/**
 * Health Check Routes
 * Provides endpoints for monitoring system health
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Simple health check
router.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };
  
  res.json(healthData);
});

// Readiness check (for Railway/K8s)
router.get('/health/ready', async (req, res) => {
  try {
    // Check critical services
    const checks = {
      notion: await checkNotionConnection(),
      googleSheets: await checkGoogleSheetsConnection(),
      timestamp: new Date().toISOString()
    };

    const allHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : true
    );

    if (allHealthy) {
      res.json({ ready: true, checks });
    } else {
      res.status(503).json({ ready: false, checks });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({ 
      ready: false, 
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check (for Railway/K8s)
router.get('/health/live', (req, res) => {
  res.json({ 
    alive: true, 
    timestamp: new Date().toISOString() 
  });
});

// Helper functions
async function checkNotionConnection() {
  try {
    return !!process.env.NOTION_TOKEN && !!process.env.NOTION_DATABASE_ID;
  } catch (error) {
    return false;
  }
}

async function checkGoogleSheetsConnection() {
  try {
    return !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && 
           !!process.env.GOOGLE_PRIVATE_KEY && 
           !!process.env.GOOGLE_SPREADSHEET_ID;
  } catch (error) {
    return false;
  }
}

module.exports = router;
