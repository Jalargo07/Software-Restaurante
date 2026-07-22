const Mesa = require('./Mesa');
const Producto = require('./Producto');
const Compra = require('./Compra');
const DetalleCompra = require('./DetalleCompra');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Usuario = require('./Usuario');

// Compra -> DetalleCompra
Compra.hasMany(DetalleCompra);
DetalleCompra.belongsTo(Compra);

// Producto -> DetalleCompra
Producto.hasMany(DetalleCompra);
DetalleCompra.belongsTo(Producto);

// Mesa -> Venta
Mesa.hasMany(Venta, { foreignKey: 'mesaId' });
Venta.belongsTo(Mesa, { foreignKey: 'mesaId' });

// Venta -> DetalleVenta
Venta.hasMany(DetalleVenta);
DetalleVenta.belongsTo(Venta);

// Producto -> DetalleVenta
Producto.hasMany(DetalleVenta);
DetalleVenta.belongsTo(Producto);

module.exports = {
  Mesa,
  Producto,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  Usuario,
};
