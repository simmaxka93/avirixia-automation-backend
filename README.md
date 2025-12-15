# Avirixia Automation Backend

Node.js backend für Avirixia Business Lead Automation – integriert Notion & Google Sheets.

## Features

- **Lead Webhook**: `POST /webhook/lead` empfängt Lead‑Daten und schreibt sie in Google Sheets + Notion
- **Notion Integration**: Erstellt automatisch Datenbankeinträge für neue Leads
- **Google Sheets**: Appends neue Leads in ein konfiguriertes Spreadsheet
- **CORS enabled**: Kann von jedem Frontend/GPT aufgerufen werden

## Setup

1. **Dependencies installieren**:
   ```bash
   npm install
   ```

2. **Umgebungsvariablen setzen** (siehe `.env.example`):
   - `NOTION_TOKEN`: Notion Integration Token
   - `NOTION_LEADS_DB`: Notion Database ID
   - `GOOGLE_SERVICE_EMAIL`: Google Service Account Email
   - `GOOGLE_PRIVATE_KEY`: Private Key des Service Accounts
   - `SPREADSHEET_ID`: Google Sheets ID

3. **Starten**:
   ```bash
   npm start
   ```

## Deployment auf Railway

1. Repo mit Railway‑Projekt verbinden
2. Environment Variables im Railway Dashboard setzen
3. Railway deployed automatisch bei jedem Push

## API Endpoints

### `GET /`
Health Check – gibt Status zurück.

### `POST /webhook/lead`
Empfängt Lead‑Daten als JSON:
```json
{
  "businessName": "Beispiel GmbH",
  "contactName": "Max Mustermann",
  "email": "max@beispiel.de",
  "phone": "+49123456789",
  "website": "https://beispiel.de",
  "notes": "Interessiert an Creator Management"
}
```

Schreibt die Daten in:
- Google Sheet `business_leads_template`
- Notion DB `Business Leads`

## Lizenz

MIT
