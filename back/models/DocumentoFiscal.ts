import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const DocumentoFiscal = sequelize.define('DocumentoFiscal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  ventaId: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.ENUM('boleta', 'factura'), defaultValue: 'boleta' },
  estado: { type: DataTypes.ENUM('pendiente', 'timbrado', 'rechazado'), defaultValue: 'pendiente' },
  rutCliente: { type: DataTypes.STRING, allowNull: true },
  razonSocial: { type: DataTypes.STRING, allowNull: true },
  giro: { type: DataTypes.STRING, allowNull: true },
  direccion: { type: DataTypes.STRING, allowNull: true },
  comuna: { type: DataTypes.STRING, allowNull: true },
  ciudad: { type: DataTypes.STRING, allowNull: true },
  montoNeto: { type: DataTypes.FLOAT, defaultValue: 0 },
  iva: { type: DataTypes.FLOAT, defaultValue: 0 },
  montoTotal: { type: DataTypes.FLOAT, defaultValue: 0 },
  xml: { type: DataTypes.TEXT, allowNull: true },
  pdf: { type: DataTypes.TEXT, allowNull: true },
  timbre: { type: DataTypes.STRING, allowNull: true },
  folio: { type: DataTypes.STRING, allowNull: true },
  codigoBarras: { type: DataTypes.STRING, allowNull: true },
  fechaTimbre: { type: DataTypes.DATE, allowNull: true },
  respuestaSii: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'DocumentosFiscales',
  timestamps: true,
});

export default DocumentoFiscal;
