import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  autoRunOnStart:
    (process.env.AUTO_RUN_ON_START || 'true').toLowerCase() === 'true',
  db: {
    url: process.env.DATABASE_URL || null,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'wb',
    user: process.env.POSTGRES_USER || 'wb',
    password: process.env.POSTGRES_PASSWORD || 'wb',
  },
  wb: {
    base: process.env.WB_API_BASE || 'https://common-api.wildberries.ru',
    token: process.env.WB_API_TOKEN || '',
    boxPath: process.env.WB_TARIFFS_BOX_PATH || '/api/v1/tariffs/box',
    timezone: process.env.WB_TARIFFS_TIMEZONE || 'Europe/Moscow',
    cronFetch: process.env.CRON_FETCH_TARIFFS || '0 * * * *',
  },
  gsheet: {
    clientEmail: process.env.GOOGLE_SA_CLIENT_EMAIL || '',
    privateKey: (process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    sheetIds: (process.env.GOOGLE_SHEETS_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    tabName: process.env.GOOGLE_SHEET_TAB || 'stocks_coefs',
    cronExport: process.env.CRON_EXPORT_SHEETS || '10 * * * *',
  },
}));
