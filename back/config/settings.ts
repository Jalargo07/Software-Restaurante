const env = process.env.NODE_ENV || 'development';

const settings = {
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',

  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    trustProxy: env === 'production',
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost')
      .split(',')
      .map((o) => o.trim()),
  },

  db: {
    synchronize: env !== 'production', // sync({ alter: true }) solo en dev/test
    logging: env === 'development',
  },

  seed: {
    enabled: env !== 'production' || process.env.RUN_SEED === 'true',
  },

  security: {
    helmetEnabled: env === 'production',
    rateLimitEnabled: true,
  },

  s3: {
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== undefined
      ? process.env.S3_FORCE_PATH_STYLE === 'true'
      : (process.env.S3_ENDPOINT || '').includes('localhost'),
  },
} as const;

export default settings;
