import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class WhatsAppTemplate extends Model {
  declare id: number;
  declare tenantId: number;
  declare nombre: string;
  declare templateId: string | null;
  declare contenido: string;
  declare variables: string[];
}

WhatsAppTemplate.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  variables: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'WhatsAppTemplates',
  sequelize
});

export default WhatsAppTemplate;
