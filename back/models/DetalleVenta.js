const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define('DetalleVenta', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estadoComanda: {
    type: DataTypes.ENUM('pendiente', 'en_preparacion', 'listo'),
    defaultValue: 'pendiente',
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'VentaId'] },
    { fields: ['tenant_id', 'ProductoId'] }
  ]
});

module.exports = DetalleVenta;
