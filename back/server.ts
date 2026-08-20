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
import { setSocketIOGetter } from './utils/socketIOGetter';
import { iniciarOcrWorker, cerrarOcrWorker } from './jobs/ocrWorker';
import tenantContext from './middleware/tenantContext';
import sucursalContext from './middleware/sucursalContext';
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
import menuRoutes from './routes/menus';
import superAdminRoutes from './routes/superAdmin';
import facturasRoutes from './routes/facturas';
import pagosRoutes from './routes/pagos';
import landingRoutes, { landingPublicRouter } from './routes/landing';
import deliveryRoutes, { deliveryPublicRouter } from './routes/delivery';
import sucursalRoutes from './routes/sucursales';
import contactoRoutes from './routes/contacto';
import { initializeSocketHandlers } from './services/socketHandler';
import { setSocketIO } from './utils/cacheInvalidation';
import { Tenant, Usuario, TenantConfig, LandingContent, SuperAdmin, Sucursal } from './models';
import superAdminAuthRoutes from './routes/superAdminAuth';
import { getDefaultData } from './controllers/landingController';
import { ensureBucket } from './config/s3';
import { validateLicense } from './utils/licenseValidator';
import { checkLicense } from './utils/licenseGuard';
import { errorHandler } from './middleware/errorHandler';

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
app.use('/api/public', menuRoutes);
app.use('/api/public', landingPublicRouter);
app.use('/api/delivery', deliveryPublicRouter);

app.use('/api/contacto', contactoRoutes);

app.use('/api/super-admin', superAdminAuthRoutes);

app.use('/api', tenantContext);
app.use('/api', sucursalContext);

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
app.use('/api/facturas', facturasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/sucursales', sucursalRoutes);

app.use(errorHandler);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Restaurant API running' });
});

app.get('/api/license-check', (_req, res) => {
  const result = checkLicense();
  res.json({ ok: result.ok, warning: result.warning || null });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOrigins, methods: ['GET', 'POST'] },
});
app.set('io', io);
setSocketIOGetter(io);

setSocketIO(io);

initializeSocketHandlers(io);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Validación de licencia (nunca bloquea el arranque)
    const licenseKey = process.env.LICENSE_KEY;
    if (licenseKey) {
      const result = validateLicense(licenseKey);
      if (result.valid) {
        console.log(`✅ License OK: tenant=${result.tenantId}, type=${result.licenseType}, expires=${result.expiryDate}`);
      } else {
        console.error(`\n╔══════════════════════════════════════════════════════════╗`);
        console.error(`║  ⛔ LICENCIA INVÁLIDA O EXPIRADA                        ║`);
        console.error(`║  BiteOps requiere una licencia válida para uso comercial ║`);
        console.error(`║  Detalle: ${result.error?.padEnd(45)}║`);
        console.error(`║  Contacte: soporte@biteops.app                           ║`);
        console.error(`╚══════════════════════════════════════════════════════════╝\n`);
      }
    } else {
      console.error(`\n╔══════════════════════════════════════════════════════════╗`);
      console.error(`║  ⛔ SIN LICENCIA                                         ║`);
      console.error(`║  BiteOps requiere una licencia válida para uso comercial ║`);
      console.error(`║  Establezca la variable LICENSE_KEY en .env              ║`);
      console.error(`║  Contacte: soporte@biteops.app                           ║`);
      console.error(`╚══════════════════════════════════════════════════════════╝\n`);
    }

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

      const saExists = await SuperAdmin.findOne({ where: { email: 'super@biteops.app' } });
      if (!saExists) {
        await SuperAdmin.create({
          nombre: 'Super Admin',
          email: 'super@biteops.app',
          password: 'BiteOps2026!',
        });
        console.log('Super-admin creado en tabla propia: super@biteops.app / BiteOps2026!');
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

      const sucursalCount = await Sucursal.count({ where: { tenant_id: defaultTenant.id } });
      if (sucursalCount === 0) {
        await Sucursal.create({ tenant_id: defaultTenant.id, nombre: 'Sucursal Principal', direccion: 'Dirección principal', telefono: '555-0000' });
        console.log('Sucursal Principal creada');
      }

      // Seed landing content por defecto
      const landingCount = await LandingContent.count();
      if (landingCount === 0) {
        await LandingContent.create({ data: getDefaultData() });
        console.log('Landing content por defecto creado');
      }
    }

    connectRedis();
    iniciarOcrWorker();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);

      // Check periódico de licencia (cada hora)
      let lastLicenseOk = true;
      licenseInterval = setInterval(() => {
        const result = checkLicense();
        
        if (lastLicenseOk && !result.ok) {
          // Cambió de válida a inválida — log de alerta
          console.error(`\n╔══════════════════════════════════════════════════════════╗`);
          console.error(`║  ⛔ LICENCIA EXPIRADA O INVÁLIDA DETECTADA              ║`);
          console.error(`║  La licencia cambió de estado durante la ejecución.     ║`);
          console.error(`║  Detalle: ${result.warning?.padEnd(45)}║`);
          console.error(`║  Algunas funcionalidades pueden dejar de funcionar.     ║`);
          console.error(`║  Contacte: soporte@biteops.app                          ║`);
          console.error(`╚══════════════════════════════════════════════════════════╝\n`);
        } else if (!lastLicenseOk && result.ok) {
          // Cambió de inválida a válida — log de recuperación
          console.log('✅ Licencia restaurada válida.');
        }
        
        lastLicenseOk = result.ok;
      }, 60 * 60 * 1000); // Cada hora
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

let licenseInterval: NodeJS.Timeout | null = null;

if (require.main === module) {
  startServer();

  const shutdown = async () => {
    if (licenseInterval) clearInterval(licenseInterval);
    await cerrarOcrWorker();
    await disconnectRedis();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection (no fatal):', err);
  });
}

export default app;
