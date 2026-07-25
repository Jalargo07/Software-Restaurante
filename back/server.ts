import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dns from 'dns';
import dotenv from 'dotenv';
import sequelize from './config/database';

// Forzar resolución DNS a IPv4 (fix para Supabase + Render)
dns.setDefaultResultOrder('ipv4first');
import { connectRedis, disconnectRedis } from './config/redis';
import tenantContext from './middleware/tenantContext';
import { generalLimiter } from './middleware/rateLimit';
import mesasRoutes from './routes/mesas';
import productosRoutes from './routes/productos';
import comprasRoutes from './routes/compras';
import ventasRoutes from './routes/ventas';
import usuariosRoutes from './routes/usuarios';
import proveedoresRoutes from './routes/proveedores';
import reportesRoutes from './routes/reportes';
import comandasRoutes from './routes/comandas';
import auditoriaRoutes from './routes/auditoria';
import corteCajaRoutes from './routes/corteCaja';
import uploadRoutes from './routes/upload';
import brandingRoutes from './routes/branding';
import publicBrandingRoutes from './routes/publicBranding';
import superAdminRoutes from './routes/superAdmin';
import { setSocketIO } from './utils/cacheInvalidation';
import { Tenant, Usuario, TenantConfig } from './models';
import { ensureBucket } from './config/s3';

dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const settings = require('./config/settings').default;

const app = express();
const PORT = settings.server.port;

// Trust proxy (necesario para rate limiting detrás de reverse proxy en Koyeb/Vercel)
app.set('trust proxy', settings.server.trustProxy);

// Seguridad: Helmet (headers HTTP seguros)
app.use(helmet({
  contentSecurityPolicy: false, // Desactivado para permitir inline scripts de la app
  crossOriginEmbedderPolicy: false, // Permitir embeds de imágenes de R2
}));

// CORS configurado según entorno (soporta múltiples orígenes separados por coma)
const corsOrigins = settings.cors.origins;
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// Rate limiting general (100 requests/15min por IP)
app.use('/api', generalLimiter);

app.use(express.json({ limit: '10mb' })); // Límite de tamaño de body

app.use('/api/public', publicBrandingRoutes);

app.use('/api', tenantContext);

app.use('/api/mesas', mesasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/comandas', comandasRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/cortes', corteCajaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Restaurant API running' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOrigins, methods: ['GET', 'POST'] },
});
app.set('io', io);

setSocketIO(io);

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket desconectado: ${socket.id}`));
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    if (settings.db.synchronize) {
      await sequelize.sync({ alter: true });
      console.log('Models synced');
    } else {
      console.log('Producción: sincronización de modelos omitida (usar migraciones)');
    }

    await ensureBucket();

    if (settings.seed.enabled) {
      const [defaultTenant] = await Tenant.findOrCreate({
        where: { id: 1 },
        defaults: {
          nombre: 'Restaurante Principal',
          slug: 'restaurante-principal',
          activo: true,
        },
      }) as [any, boolean];
      console.log(`Tenant por defecto activo: ${defaultTenant.nombre}`);

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

      await TenantConfig.findOrCreate({
        where: { tenant_id: defaultTenant.get('id') },
        defaults: {
          nombreCompleto: 'Restaurante Principal',
          colorPrimario: '#0d6efd',
          colorSecundario: '#6c757d',
          colorAcento: '#198754',
          fontPrincipal: 'Inter',
        },
      });
      console.log('TenantConfig por defecto creada');
    }

    connectRedis();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

if (require.main === module) {
  startServer();

  const shutdown = async () => {
    await disconnectRedis();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
