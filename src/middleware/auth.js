const logger = require('../config/logger');

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    logger.warn('API request without API key', { ip: req.ip });
    return res.status(401).json({ error: 'API key required' });
  }
  
  if (apiKey !== process.env.API_KEY) {
    logger.warn('Invalid API key attempt', { ip: req.ip });
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
}

module.exports = apiKeyAuth;
