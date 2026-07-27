import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente_aprobacion', 'activo', 'suspendido'),
    defaultValue: 'activo',
    allowNull: false,
  },
  plan: {
    type: DataTypes.STRING,
    defaultValue: 'basico',
    allowNull: false,
  },
  modulos: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'Tenants',
  timestamps: true,
});

export default Tenant;
