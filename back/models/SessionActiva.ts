import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const SessionActiva = sequelize.define('SessionActiva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tokenId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loginAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ultimoUso: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  revokeAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'SessionActivas',
  timestamps: false
});

export default SessionActiva;
