const { Router } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, usuario.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
});

router.get('/', async (req, res) => {
  const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
  res.json(usuarios);
});

router.post('/', async (req, res) => {
  const usuario = await Usuario.create(req.body);
  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
});

module.exports = router;
