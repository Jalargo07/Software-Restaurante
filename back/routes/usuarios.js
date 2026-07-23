const { Router } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, usuario.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
});

router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
  res.json(usuarios);
});

router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });
    const usuario = await Usuario.create({ nombre, email, password, rol: rol || 'mesero' });
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombre, email, password, rol, activo } = req.body;
    if (email && email !== usuario.email) {
      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const datos = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (email !== undefined) datos.email = email;
    if (rol !== undefined) datos.rol = rol;
    if (activo !== undefined) datos.activo = activo;
    if (password) datos.password = password;

    await usuario.update(datos);
    res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.update({ activo: false });
    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
