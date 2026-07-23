const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/mesas', require('./routes/mesas'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/proveedores', require('./routes/proveedores'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Restaurant API running' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Models synced');

    // Seed admin user
    const { Usuario } = require('./models');
    const adminExists = await Usuario.findOne({ where: { email: 'admin@restaurant.com' } });
    if (!adminExists) {
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@restaurant.com',
        password: 'admin123',
        rol: 'admin',
      });
      console.log('Admin user created: admin@restaurant.com / admin123');
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
