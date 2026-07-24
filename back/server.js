const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tenantContext = require('./middleware/tenantContext');
app.use('/api', tenantContext);

// Routes
app.use('/api/mesas', require('./routes/mesas'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/comandas', require('./routes/comandas'));
app.use('/api/auditoria', require('./routes/auditoria'));
app.use('/api/recetas', require('./routes/recetas'));
app.use('/api/cortes', require('./routes/corteCaja'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/branding', require('./routes/branding'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Restaurant API running' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'] },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket desconectado: ${socket.id}`));
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Models synced');

    const { ensureBucket } = require('./config/s3');
    await ensureBucket();

    // Seed default tenant
    const { Tenant, Usuario, TenantConfig } = require('./models');
    const [defaultTenant] = await Tenant.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Restaurante Principal',
        slug: 'restaurante-principal',
        activo: true
      }
    });
    console.log(`Tenant por defecto activo: ${defaultTenant.nombre}`);

    // Seed admin user
    const adminExists = await Usuario.findOne({ where: { email: 'admin@restaurant.com' } });
    if (!adminExists) {
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@restaurant.com',
        password: 'admin123',
        rol: 'admin',
        tenant_id: 1,
      });
      console.log('Admin user created: admin@restaurant.com / admin123');
    }

    // Seed default TenantConfig
    await TenantConfig.findOrCreate({
      where: { tenant_id: defaultTenant.id },
      defaults: {
        nombreCompleto: 'Restaurante Principal',
        colorPrimario: '#0d6efd',
        colorSecundario: '#6c757d',
        colorAcento: '#198754',
        fontPrincipal: 'Inter',
      }
    });
    console.log('TenantConfig por defecto creada');

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
