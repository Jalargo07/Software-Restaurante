import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

export const CogsConfig = sequelize.define('CogsConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  categoriaCOGS: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'CogsConfigs'
});