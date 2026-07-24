const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleReceta = sequelize.define('DetalleReceta', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
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
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'recetaId'] },
    { fields: ['tenant_id', 'insumoId'] }
  ]
});

module.exports = DetalleReceta;
