const { Client } = require('@notionhq/client');
const logger = require('../config/logger');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

class NotionService {
  async createLeadEntry(leadData) {
    try {
      const response = await notion.pages.create({
        parent: { database_id: process.env.NOTION_LEADS_DB },
        properties: {
          'Name': {
            title: [{ text: { content: `${leadData.first_name} ${leadData.last_name}` } }]
          },
          'Email': {
            email: leadData.email
          },
          'Phone': {
            phone_number: leadData.phone || ''
          },
          'Company': {
            rich_text: [{ text: { content: leadData.company || '' } }]
          },
          'Source': {
            select: { name: leadData.source || 'website' }
          },
          'Status': {
            select: { name: 'New' }
          }
        }
      });
      
      logger.info('Lead created in Notion', { leadId: response.id });
      return response;
    } catch (error) {
      logger.error('Failed to create Notion entry', { error: error.message });
      throw error;
    }
  }
}

module.exports = new NotionService();
