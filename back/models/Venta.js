const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
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
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    allowNull: true,
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Venta;
