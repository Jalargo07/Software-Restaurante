const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
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
  mesaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('abierta', 'cerrada', 'cancelada'),
    defaultValue: 'abierta',
  },
  metodoPago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto'),
    allowNull: true,
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'mesaId'] }
  ]
});

module.exports = Venta;
