require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Notion Client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Avirixia Automation Backend is running' });
});

// Lead Webhook Endpoint
app.post('/webhook/lead', async (req, res) => {
  try {
    const { businessName, contactName, email, phone, website, notes } = req.body;

    // Add to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'business_leads_template!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          new Date().toISOString(),
          businessName || '',
          contactName || '',
          email || '',
          phone || '',
          website || '',
          notes || ''
        ]]
      }
    });

    // Add to Notion
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_LEADS_DB },
      properties: {
        'Business Name': { title: [{ text: { content: businessName || '' } }] },
        'Contact Name': { rich_text: [{ text: { content: contactName || '' } }] },
        'Email': { email: email || null },
        'Phone': { phone_number: phone || null },
        'Website': { url: website || null },
        'Notes': { rich_text: [{ text: { content: notes || '' } }] },
        'Status': { select: { name: 'New' } }
      }
    });

    res.json({ success: true, message: 'Lead added successfully' });
  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
