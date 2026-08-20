import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { settings } from './settings';

let sequelize: Sequelize;

if (process.env.NODE_ENV === 'test') {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'test-database.sqlite'),
    logging: false,
  });
} else if (process.env.DATABASE_URL) {
  // Soporte para DATABASE_URL (Supabase, Railway, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    timezone: '-03:00',
    dialectOptions: {
      useUTC: false,
      typeCast: true,
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
    },
    pool: {
      max: settings.db.pool.max,
      min: settings.db.pool.min,
      acquire: settings.db.pool.acquire,
      idle: settings.db.pool.idle,
    },
  });
} else if (process.env.DB_DIALECT === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'restaurantedb',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: false,
      timezone: '-03:00',
      dialectOptions: {
        useUTC: false,
        typeCast: true,
        ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
      },
      pool: {
        max: settings.db.pool.max,
        min: settings.db.pool.min,
        acquire: settings.db.pool.acquire,
        idle: settings.db.pool.idle,
      },
    }
  );
} else {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'database.sqlite'),
    logging: false,
  });
}

export default sequelize;
