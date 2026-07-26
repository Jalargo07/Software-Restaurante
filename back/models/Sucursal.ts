import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Sucursal = sequelize.define('Sucursal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  direccion: { type: DataTypes.STRING, allowNull: true },
  telefono: { type: DataTypes.STRING, allowNull: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'Sucursales',
  timestamps: true,
  indexes: [{ unique: true, fields: ['tenant_id', 'nombre'] }],
});

export default Sucursal;
