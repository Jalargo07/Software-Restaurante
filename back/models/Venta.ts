import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Venta = sequelize.define('Venta', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sucursal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM('mesa', 'directa', 'delivery'),
    defaultValue: 'directa',
  },
  mesaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('abierta', 'cerrada', 'cancelada'),
    defaultValue: 'abierta',
  },
  metodoPago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto'),
    allowNull: true,
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryApp: {
    type: DataTypes.ENUM('rappi', 'uber', 'pedidosya'),
    allowNull: true,
  },
  deliveryPedidoId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  direccionEntrega: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  clienteTelefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'id'] },
    { fields: ['tenant_id', 'mesaId'] }
  ]
});

export default Venta;
