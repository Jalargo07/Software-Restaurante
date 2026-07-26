import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Kardex = sequelize.define('Kardex', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'salida', 'merma'),
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  compraId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'productoId'] },
    { fields: ['tenant_id', 'fecha'] },
  ],
});

export default Kardex;
