const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receta = sequelize.define('Receta', {
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
  nombre: { type: DataTypes.STRING, allowNull: false },
  porciones: { type: DataTypes.INTEGER, defaultValue: 1 },
  productoId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { unique: true, fields: ['tenant_id', 'productoId'] }
  ]
});

module.exports = Receta;
