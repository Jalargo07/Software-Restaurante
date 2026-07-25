import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

const SuperAdmin = sequelize.define('SuperAdmin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  twoFactorSecret: { type: DataTypes.TEXT, allowNull: true },
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  hooks: {
    beforeCreate: async (sa: any) => { if (sa.password) sa.password = await bcrypt.hash(sa.password, 10) },
    beforeUpdate: async (sa: any) => { if (sa.changed('password')) sa.password = await bcrypt.hash(sa.password, 10) },
  },
});

export default SuperAdmin;
