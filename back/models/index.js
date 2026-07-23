const Mesa = require('./Mesa');
const Producto = require('./Producto');
const Compra = require('./Compra');
const DetalleCompra = require('./DetalleCompra');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Usuario = require('./Usuario');
const Proveedor = require('./Proveedor');

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

module.exports = {
  Mesa,
  Producto,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  Usuario,
  Proveedor,
};
