import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const DetalleCompra = sequelize.define('DetalleCompra', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'CompraId'] },
    { fields: ['tenant_id', 'ProductoId'] }
  ]
});

export default DetalleCompra;
