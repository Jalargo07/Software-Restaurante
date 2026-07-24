const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.ENUM('bebida', 'comida', 'insumo', 'postre'),
    allowNull: false,
  },
  precioCompra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stockMinimo: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  unidad: {
    type: DataTypes.ENUM('unidad', 'kg', 'litro', 'docena'),
    defaultValue: 'unidad',
  },
  tipo: {
    type: DataTypes.ENUM('insumo', 'compuesto', 'directo'),
    defaultValue: 'directo',
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  merma: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'categoria'] }
  ]
});

module.exports = Producto;
