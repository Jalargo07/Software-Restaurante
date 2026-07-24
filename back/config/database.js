const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'test-database.sqlite'),
    logging: false,
  });
} else if (process.env.DB_DIALECT === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'restaurantedb',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      timezone: '-03:00',
      dialectOptions: {
        useUTC: false,
        typeCast: true,
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

module.exports = sequelize;
