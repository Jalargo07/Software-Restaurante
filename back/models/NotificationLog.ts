import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class NotificationLog extends Model {
  declare id: number;
  declare tenantId: number;
  declare tipo: string;
  declare destinatario: string;
  declare mensaje: string;
  declare status: string;
  declare error: string | null;
}

NotificationLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destinatario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'NotificationLogs',
  sequelize
});

export default NotificationLog;
