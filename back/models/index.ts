import Tenant from './Tenant';
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

export {
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
  DetalleReceta,
  CorteCaja,
  TenantConfig,
  Kardex,
  DocumentoFiscal,
  Transaccion,
};
