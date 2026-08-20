import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const OnboardingProgress = sequelize.define('OnboardingProgress', {
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
  stepCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 3 }
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'OnboardingProgress',
  timestamps: true
});

export default OnboardingProgress;