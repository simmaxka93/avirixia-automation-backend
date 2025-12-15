const axios = require('axios');
const logger = require('../config/logger');

class ZapierService {
  async sendWebhook(leadData) {
    try {
      const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
      
      if (!webhookUrl) {
        logger.warn('Zapier webhook URL not configured');
        return;
      }

      await axios.post(webhookUrl, leadData, {
        headers: { 'Content-Type': 'application/json' }
      });

      logger.info('Lead sent to Zapier', { email: leadData.email });
    } catch (error) {
      logger.error('Failed to send to Zapier', { error: error.message });
      // Don't throw - Zapier is optional
    }
  }
}

module.exports = new ZapierService();
