const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
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
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usuarioEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entidadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  detalles: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('detalles');
      try {
        return rawValue ? JSON.parse(rawValue) : null;
      } catch {
        return rawValue;
      }
    },
    set(value) {
      this.setDataValue('detalles', value ? JSON.stringify(value) : null);
    },
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'usuarioId'] }
  ]
});

module.exports = Auditoria;
