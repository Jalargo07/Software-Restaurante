import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

export const settings = {
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',

  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    trustProxy: env === 'production' ? 'loopback' : false,
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost')
      .split(',')
      .map((o) => o.trim()),
  },

  db: {
    synchronize: env !== 'production', // sync({ alter: true }) solo en dev/test
    logging: env === 'development',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || (env === 'production' ? '20' : '5'), 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
    },
  },

  seed: {
    enabled: env !== 'production' || process.env.RUN_SEED === 'true',
  },

  security: {
    helmetEnabled: env === 'production',
    rateLimitEnabled: true,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },

  s3: {
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== undefined
      ? process.env.S3_FORCE_PATH_STYLE === 'true'
      : (process.env.S3_ENDPOINT || '').includes('localhost'),
  },

  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || ''
  },

  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    businessPhone: process.env.WHATSAPP_BUSINESS_PHONE || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0'
  },
} as const;
