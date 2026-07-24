const Tenant = require('./Tenant');
const Mesa = require('./Mesa');
const Producto = require('./Producto');
const Compra = require('./Compra');
const DetalleCompra = require('./DetalleCompra');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Usuario = require('./Usuario');
const Proveedor = require('./Proveedor');
const Auditoria = require('./Auditoria');
const Receta = require('./Receta');
const DetalleReceta = require('./DetalleReceta');
const CorteCaja = require('./CorteCaja');
const TenantConfig = require('./TenantConfig');

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

Tenant.hasMany(Receta, { foreignKey: 'tenant_id' });
Receta.belongsTo(Tenant, { foreignKey: 'tenant_id' });

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

// Receta -> DetalleReceta
Receta.hasMany(DetalleReceta, { foreignKey: 'recetaId' });
DetalleReceta.belongsTo(Receta, { foreignKey: 'recetaId' });

// Producto -> Receta
Producto.hasOne(Receta, { foreignKey: 'productoId' });
Receta.belongsTo(Producto, { foreignKey: 'productoId' });

// DetalleReceta -> insumo (Producto)
DetalleReceta.belongsTo(Producto, { foreignKey: 'insumoId', as: 'insumo' });
Producto.hasMany(DetalleReceta, { foreignKey: 'insumoId', as: 'insumosEnRecetas' });

// Usuario -> Auditoria
Usuario.hasMany(Auditoria, { foreignKey: 'usuarioId' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Usuario -> CorteCaja
Usuario.hasMany(CorteCaja, { foreignKey: 'usuarioId' });
CorteCaja.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = {
  Tenant,
  Mesa,
  Producto,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  Usuario,
  Proveedor,
  Auditoria,
  Receta,
  DetalleReceta,
  CorteCaja,
  TenantConfig,
};
