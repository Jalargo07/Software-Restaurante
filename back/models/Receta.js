const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receta = sequelize.define('Receta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  porciones: { type: DataTypes.INTEGER, defaultValue: 1 },
  productoId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Receta;
