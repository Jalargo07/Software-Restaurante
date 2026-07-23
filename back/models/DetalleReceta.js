const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleReceta = sequelize.define('DetalleReceta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unidad: { type: DataTypes.ENUM('kg', 'g', 'litro', 'ml', 'unidad'), defaultValue: 'unidad' },
  merma: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'La merma no puede ser negativa' },
      max: { args: [100], msg: 'La merma no puede superar 100' },
    },
  },
  recetaId: { type: DataTypes.INTEGER, allowNull: false },
  insumoId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = DetalleReceta;
