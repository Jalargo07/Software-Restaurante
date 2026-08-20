require('dotenv').config({ path: '../.env' });
process.env.NODE_ENV = 'test';

const app = require('../dist/server').default || require('../dist/server');
const sequelize = require('../dist/config/database').default || require('../dist/config/database');
const { Usuario, Tenant, TenantConfig } = require('../dist/models');

let adminToken;

async function setup() {
  adminToken = null;
  await sequelize.sync({ force: true });

  await Tenant.findOrCreate({
    where: { id: 1 },
    defaults: {
      nombre: 'Restaurante Principal',
      slug: 'restaurante-principal',
      activo: true
    }
  });

  await TenantConfig.findOrCreate({
    where: { tenant_id: 1 },
    defaults: {
      nombreCompleto: 'Restaurante Principal',
      colorPrimario: '#0d6efd',
      colorSecundario: '#6c757d',
      colorAcento: '#198754',
      fontPrincipal: 'Inter',
    }
  });

  await Usuario.create({
    nombre: 'Admin',
    email: 'admin@restaurant.com',
    password: 'admin123',
    rol: 'admin',
    activo: true,
    tenant_id: 1,
  });
}

async function getAdminToken() {
  if (adminToken) return adminToken;
  const request = require('supertest');
  const res = await request(app)
    .post('/api/usuarios/login')
    .send({ email: 'admin@restaurant.com', password: 'admin123' });
  adminToken = res.body.accessToken;
  return adminToken;
}

async function teardown() {
  adminToken = null;
}

module.exports = { app, setup, teardown, getAdminToken };
