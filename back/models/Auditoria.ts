import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Auditoria = sequelize.define('Auditoria', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usuarioEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entidadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  detalles: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('detalles');
      try {
        return rawValue ? JSON.parse(rawValue) : null;
      } catch {
        return rawValue;
      }
    },
    set(value: any) {
      this.setDataValue('detalles', value ? JSON.stringify(value) : null);
    },
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'usuarioId'] }
  ]
});

export default Auditoria;
