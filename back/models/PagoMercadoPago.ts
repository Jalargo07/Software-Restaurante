import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

export const PagoMercadoPago = sequelize.define('PagoMercadoPago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  preferenceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ARS'
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'PagoMercadoPagos'
});
