import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  replacedByToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'RefreshTokens',
  timestamps: false
});

export default RefreshToken;
