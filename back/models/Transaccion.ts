import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Transaccion = sequelize.define('Transaccion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  plan: { type: DataTypes.STRING, allowNull: false },
  modulos: { type: DataTypes.JSON, allowNull: true },
  monto: { type: DataTypes.FLOAT, allowNull: false },
  moneda: { type: DataTypes.STRING, defaultValue: 'CLP' },
  estado: { type: DataTypes.ENUM('pendiente', 'completado', 'fallido', 'reembolsado'), defaultValue: 'pendiente' },
  paypalOrderId: { type: DataTypes.STRING, allowNull: true },
  paypalCaptureId: { type: DataTypes.STRING, allowNull: true },
  respuestaPaypal: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'Transacciones',
  timestamps: true,
});

export default Transaccion;
