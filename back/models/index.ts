import Tenant from './Tenant';
import Sucursal from './Sucursal';
import Mesa from './Mesa';
import Producto from './Producto';
import Compra from './Compra';
import DetalleCompra from './DetalleCompra';
import Venta from './Venta';
import DetalleVenta from './DetalleVenta';
import Usuario from './Usuario';
import Proveedor from './Proveedor';
import Auditoria from './Auditoria';
import DetalleReceta from './DetalleReceta';
import CorteCaja from './CorteCaja';
import TenantConfig from './TenantConfig';
import Kardex from './Kardex';
import DocumentoFiscal from './DocumentoFiscal';
import Transaccion from './Transaccion';
import LandingContent from './LandingContent';
import SuperAdmin from './SuperAdmin';
import DeliveryConfig from './DeliveryConfig';
import ContactoMensaje from './ContactoMensaje';
import SessionActiva from './SessionActiva';
import RefreshToken from './RefreshToken';
import OnboardingProgress from './OnboardingProgress';

// Sucursal -> Models
Sucursal.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Tenant.hasMany(Sucursal, { foreignKey: 'tenant_id' });
Sucursal.hasMany(Mesa, { foreignKey: 'sucursal_id' });
Mesa.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Sucursal.hasMany(Venta, { foreignKey: 'sucursal_id' });
Venta.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Sucursal.hasMany(DetalleVenta, { foreignKey: 'sucursal_id' });
DetalleVenta.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Sucursal.hasMany(Compra, { foreignKey: 'sucursal_id' });
Compra.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Sucursal.hasMany(DetalleCompra, { foreignKey: 'sucursal_id' });
DetalleCompra.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Sucursal.hasMany(Usuario, { foreignKey: 'sucursal_id' });
Usuario.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Sucursal.hasMany(CorteCaja, { foreignKey: 'sucursal_id' });
CorteCaja.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });

// Tenant -> Models
Tenant.hasMany(Usuario, { foreignKey: 'tenant_id' });
Usuario.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Producto, { foreignKey: 'tenant_id' });
Producto.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Proveedor, { foreignKey: 'tenant_id' });
Proveedor.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Mesa, { foreignKey: 'tenant_id' });
Mesa.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Venta, { foreignKey: 'tenant_id' });
Venta.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(DetalleVenta, { foreignKey: 'tenant_id' });
DetalleVenta.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Compra, { foreignKey: 'tenant_id' });
Compra.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(DetalleCompra, { foreignKey: 'tenant_id' });
DetalleCompra.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(DetalleReceta, { foreignKey: 'tenant_id' });
DetalleReceta.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(CorteCaja, { foreignKey: 'tenant_id' });
CorteCaja.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Auditoria, { foreignKey: 'tenant_id' });
Auditoria.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Tenant -> TenantConfig (1:1)
Tenant.hasOne(TenantConfig, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
TenantConfig.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Compra -> DetalleCompra
Compra.hasMany(DetalleCompra, { foreignKey: 'CompraId' });
DetalleCompra.belongsTo(Compra, { foreignKey: 'CompraId' });

// Producto -> DetalleCompra
Producto.hasMany(DetalleCompra, { foreignKey: 'ProductoId' });
DetalleCompra.belongsTo(Producto, { foreignKey: 'ProductoId' });

// Mesa -> Venta
Mesa.hasMany(Venta, { foreignKey: 'mesaId' });
Venta.belongsTo(Mesa, { foreignKey: 'mesaId' });

// Venta -> DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'VentaId' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'VentaId' });

// Producto -> DetalleVenta
Producto.hasMany(DetalleVenta, { foreignKey: 'ProductoId' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'ProductoId' });

// Proveedor -> Compra
Proveedor.hasMany(Compra, { foreignKey: 'proveedorId' });
Compra.belongsTo(Proveedor, { foreignKey: 'proveedorId' });

// Producto -> DetalleReceta
Producto.hasMany(DetalleReceta, { foreignKey: 'productoId', as: 'detallesReceta', onDelete: 'CASCADE' });
DetalleReceta.belongsTo(Producto, { foreignKey: 'productoId', as: 'productoCompuesto' });

// DetalleReceta -> insumo (Producto)
DetalleReceta.belongsTo(Producto, { foreignKey: 'insumoId', as: 'insumo' });
Producto.hasMany(DetalleReceta, { foreignKey: 'insumoId', as: 'insumosEnRecetas' });

// Usuario -> Auditoria
Usuario.hasMany(Auditoria, { foreignKey: 'usuarioId' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Usuario -> CorteCaja
Usuario.hasMany(CorteCaja, { foreignKey: 'usuarioId' });
CorteCaja.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Tenant -> Kardex
Tenant.hasMany(Kardex, { foreignKey: 'tenant_id' });
Kardex.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Producto -> Kardex
Producto.hasMany(Kardex, { foreignKey: 'productoId' });
Kardex.belongsTo(Producto, { foreignKey: 'productoId' });

// Compra -> Kardex
Compra.hasMany(Kardex, { foreignKey: 'compraId' });
Kardex.belongsTo(Compra, { foreignKey: 'compraId' });

// Venta -> Kardex
Venta.hasMany(Kardex, { foreignKey: 'ventaId' });
Kardex.belongsTo(Venta, { foreignKey: 'ventaId' });

// DocumentoFiscal
Tenant.hasMany(DocumentoFiscal, { foreignKey: 'tenant_id' });
DocumentoFiscal.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Venta.hasOne(DocumentoFiscal, { foreignKey: 'ventaId' });
DocumentoFiscal.belongsTo(Venta, { foreignKey: 'ventaId' });

// Transaccion
Tenant.hasMany(Transaccion, { foreignKey: 'tenant_id' });
Transaccion.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// DeliveryConfig
Tenant.hasMany(DeliveryConfig, { foreignKey: 'tenant_id' });
DeliveryConfig.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// SessionActiva -> Usuario
Usuario.hasMany(SessionActiva, { foreignKey: 'usuarioId', as: 'sesiones' });
SessionActiva.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// RefreshToken -> Usuario
Usuario.hasMany(RefreshToken, { foreignKey: 'usuarioId', as: 'refreshTokens' });
RefreshToken.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// OnboardingProgress -> Tenant
Tenant.hasOne(OnboardingProgress, { foreignKey: 'tenantId', as: 'onboarding' });
OnboardingProgress.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

export {
  Tenant,
  Sucursal,
  Mesa,
  Producto,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  Usuario,
  Proveedor,
  Auditoria,
  DetalleReceta,
  CorteCaja,
  TenantConfig,
  Kardex,
  DocumentoFiscal,
  Transaccion,
  LandingContent,
  SuperAdmin,
  DeliveryConfig,
  ContactoMensaje,
  SessionActiva,
  RefreshToken,
  OnboardingProgress,
};
