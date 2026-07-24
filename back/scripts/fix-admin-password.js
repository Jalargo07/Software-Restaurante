const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { Usuario } = require('../models');

async function fix() {
  await sequelize.authenticate();
  const hash = await bcrypt.hash('admin123', 10);
  await Usuario.update({ password: hash }, { where: { email: 'admin@restaurant.com' }, individualHooks: false });
  const admin = await Usuario.findOne({ where: { email: 'admin@restaurant.com' } });
  const match = await bcrypt.compare('admin123', admin.password);
  console.log('Password updated, match:', match);
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
