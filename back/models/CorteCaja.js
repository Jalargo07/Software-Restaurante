const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CorteCaja = sequelize.define('CorteCaja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  totalEfectivo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalTarjeta: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalTransferencia: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalGeneral: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  cantidadVentas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ventasCanceladas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  montoCanceladas: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  ventasCerradas: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('ventasCerradas');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch {
        return rawValue;
      }
    },
    set(value) {
      this.setDataValue('ventasCerradas', value ? JSON.stringify(value) : null);
    },
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cerradoEn: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = CorteCaja;
