import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const DeliveryConfig = sequelize.define('DeliveryConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  app: { type: DataTypes.ENUM('rappi', 'uber', 'pedidosya'), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: false },
  webhookSecret: { type: DataTypes.STRING, allowNull: true },
  apiKey: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'DeliveryConfigs',
  timestamps: true,
});

export default DeliveryConfig;
