import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const DetalleReceta = sequelize.define('DetalleReceta', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cantidad: { type: DataTypes.DECIMAL(8, 3), allowNull: false },
  unidad: { type: DataTypes.ENUM('kg', 'g', 'litro', 'ml', 'unidad', 'docena'), defaultValue: 'unidad' },
  productoId: { type: DataTypes.INTEGER, allowNull: false },
  insumoId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'productoId'] },
    { fields: ['tenant_id', 'insumoId'] }
  ]
});

export default DetalleReceta;
