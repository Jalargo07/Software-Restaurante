const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

const TenantConfig = sequelize.define('TenantConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  colorPrimario: {
    type: DataTypes.STRING,
    defaultValue: '#0d6efd',
    validate: {
      isHexColor(value) {
        if (!HEX_COLOR_REGEX.test(value)) {
          throw new Error('colorPrimario must be a valid hex color');
        }
      },
    },
  },
  colorSecundario: {
    type: DataTypes.STRING,
    defaultValue: '#6c757d',
    validate: {
      isHexColor(value) {
        if (!HEX_COLOR_REGEX.test(value)) {
          throw new Error('colorSecundario must be a valid hex color');
        }
      },
    },
  },
  colorAcento: {
    type: DataTypes.STRING,
    defaultValue: '#198754',
    validate: {
      isHexColor(value) {
        if (!HEX_COLOR_REGEX.test(value)) {
          throw new Error('colorAcento must be a valid hex color');
        }
      },
    },
  },
  nombreCompleto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fontPrincipal: {
    type: DataTypes.STRING,
    defaultValue: 'Inter',
  },
}, {
  tableName: 'TenantConfigs',
  timestamps: true,
});

module.exports = TenantConfig;
