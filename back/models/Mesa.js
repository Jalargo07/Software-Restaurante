const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mesa = sequelize.define('Mesa', {
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
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento'),
    defaultValue: 'disponible',
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { unique: true, fields: ['tenant_id', 'numero'] }
  ]
});

module.exports = Mesa;
