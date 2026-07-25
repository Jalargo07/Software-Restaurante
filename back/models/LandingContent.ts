import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const LandingContent = sequelize.define('LandingContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  tableName: 'LandingContents',
  timestamps: true,
});

export default LandingContent;
