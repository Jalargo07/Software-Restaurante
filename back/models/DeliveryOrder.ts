import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const DeliveryOrder = sequelize.define('DeliveryOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  partnerOrderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  partner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  comision: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rawPayload: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'DeliveryOrders'
});

export default DeliveryOrder;
