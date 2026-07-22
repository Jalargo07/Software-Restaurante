const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mesa = sequelize.define('Mesa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
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
});

module.exports = Mesa;
