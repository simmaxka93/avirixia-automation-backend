const { google } = require('googleapis');
const logger = require('../config/logger');

class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async appendLead(leadData) {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      const range = 'Leads!A:G';
      
      const values = [[
        new Date().toISOString(),
        `${leadData.first_name} ${leadData.last_name}`,
        leadData.email,
        leadData.phone || '',
        leadData.company || '',
        leadData.message || '',
        leadData.source || 'website'
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });

      logger.info('Lead appended to Google Sheets', { email: leadData.email });
    } catch (error) {
      logger.error('Failed to append to Google Sheets', { error: error.message });
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
