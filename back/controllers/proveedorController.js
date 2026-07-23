const { Proveedor, Compra, DetalleCompra, Producto } = require('../models');
const { registrarAuditoria } = require('../utils/auditoria');

const obtenerTodos = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({ where: { activo: true } });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

const crear = async (req, res) => {
  try {
    const proveedor = await Proveedor.create(req.body);

    await registrarAuditoria({
      req,
      accion: 'crear',
      entidad: 'Proveedor',
      entidadId: proveedor.id,
      detalles: { nombre: proveedor.nombre },
    });

    res.status(201).json(proveedor);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

const actualizar = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.update(req.body);

    await registrarAuditoria({
      req,
      accion: 'actualizar',
      entidad: 'Proveedor',
      entidadId: proveedor.id,
      detalles: { nombre: proveedor.nombre, cambios: Object.keys(req.body) },
    });

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

const desactivar = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.update({ activo: false });

    await registrarAuditoria({
      req,
      accion: 'desactivar',
      entidad: 'Proveedor',
      entidadId: proveedor.id,
      detalles: { nombre: proveedor.nombre },
    });

    res.json({ message: 'Proveedor desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar proveedor' });
  }
};

const historialCompras = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

    const compras = await Compra.findAll({
      where: { proveedorId: req.params.id },
      include: [{ model: DetalleCompra, include: [Producto] }],
      order: [['fecha', 'DESC']],
    });

    const totalCompras = compras.reduce((sum, c) => sum + Number(c.total), 0);
    const comprasRecibidas = compras.filter((c) => c.estado === 'recibida').length;
    const comprasPendientes = compras.filter((c) => c.estado === 'pendiente').length;

    res.json({
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        email: proveedor.email,
        telefono: proveedor.telefono,
      },
      resumen: {
        totalCompras: compras.length,
        comprasRecibidas,
        comprasPendientes,
        montoTotal: totalCompras,
      },
      compras,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de compras' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  desactivar,
  historialCompras,
};
