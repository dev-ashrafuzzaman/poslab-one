// src/config.js

// Load environment variables from Vite
const ENV = import.meta.env.MODE; // 'development', 'staging', 'production', etc.

export const Config = { 
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AccountingPro',
    env: ENV || 'development',
    baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173',
  },

  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    version: import.meta.env.VITE_API_VERSION || 'v1',
  },

  auth: {
    type: import.meta.env.VITE_AUTH_TYPE || 'JWT',
    tokenKey: import.meta.env.VITE_JWT_STORAGE_KEY || 'accountingpro_token',
  },

  accounting: {
    company: import.meta.env.VITE_COMPANY_NAME || 'Your Company Pvt Ltd',
    currency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
    financialYear: {
      start: import.meta.env.VITE_FINANCIAL_YEAR_START || '2025-01-01',
      end: import.meta.env.VITE_FINANCIAL_YEAR_END || '2025-12-31',
    },
    dateFormat: import.meta.env.VITE_DATE_FORMAT || 'YYYY-MM-DD',
  },

  ui: {
    theme: import.meta.env.VITE_THEME || 'light',
    logoUrl: import.meta.env.VITE_LOGO_URL || '/assets/logo.png',
  },

  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  },

  support: {
    email: import.meta.env.VITE_SUPPORT_EMAIL || 'support@yourcompany.com',
  },
};

// Optional helper functions
export const isDevelopment = ENV === 'development';
export const isStaging = ENV === 'staging';
export const isProduction = ENV === 'production';
 