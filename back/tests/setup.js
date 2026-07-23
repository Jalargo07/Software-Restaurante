require('dotenv').config({ path: '../.env' });
process.env.NODE_ENV = 'test';

const app = require('../server');
const sequelize = require('../config/database');
const { Usuario } = require('../models');

let adminToken;

async function setup() {
  adminToken = null;
  await sequelize.sync({ force: true });

  await Usuario.create({
    nombre: 'Admin',
    email: 'admin@restaurant.com',
    password: 'admin123',
    rol: 'admin',
    activo: true,
  });
}

async function getAdminToken() {
  if (adminToken) return adminToken;
  const request = require('supertest');
  const res = await request(app)
    .post('/api/usuarios/login')
    .send({ email: 'admin@restaurant.com', password: 'admin123' });
  adminToken = res.body.token;
  return adminToken;
}

async function teardown() {
  adminToken = null;
}

module.exports = { app, setup, teardown, getAdminToken };
