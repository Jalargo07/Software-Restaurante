const { Receta, DetalleReceta, Producto } = require('../models');

const obtenerTodas = async (req, res) => {
  try {
    const recetas = await Receta.findAll({
      include: [
        { model: Producto },
        { model: DetalleReceta, include: [{ model: Producto, as: 'insumo' }] },
      ],
    });
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener recetas' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id, {
      include: [
        { model: Producto },
        { model: DetalleReceta, include: [{ model: Producto, as: 'insumo' }] },
      ],
    });
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
    res.json(receta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener receta' });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, porciones, productoId, detalles } = req.body;

    if (!productoId) return res.status(400).json({ error: 'productoId es requerido' });

    const producto = await Producto.findByPk(productoId);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    if (producto.tipo !== 'compuesto') return res.status(400).json({ error: 'El producto debe ser tipo compuesto' });

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos 1 ingrediente en detalles' });
    }

    const insumoIds = new Set();
    for (const d of detalles) {
      if (!d.insumoId) return res.status(400).json({ error: 'Cada ingrediente debe tener un insumoId' });
      if (Number(d.cantidad) <= 0) return res.status(400).json({ error: `La cantidad del insumo ${d.insumoId} debe ser mayor a 0` });

      if (insumoIds.has(d.insumoId)) {
        return res.status(400).json({ error: `Insumo duplicado en la receta: ${d.insumoId}` });
      }
      insumoIds.add(d.insumoId);

      const insumo = await Producto.findByPk(d.insumoId);
      if (!insumo) return res.status(400).json({ error: `Insumo id ${d.insumoId} no encontrado` });
      if (insumo.tipo !== 'insumo') return res.status(400).json({ error: `El producto id ${d.insumoId} debe ser tipo insumo` });
    }

    const receta = await Receta.create({ nombre, porciones, productoId });

    const detallesData = detalles.map((d) => ({
      recetaId: receta.id,
      insumoId: d.insumoId,
      cantidad: d.cantidad,
      unidad: d.unidad || 'unidad',
      merma: d.merma || 0,
    }));
    await DetalleReceta.bulkCreate(detallesData);

    const recetaCompleta = await Receta.findByPk(receta.id, {
      include: [
        { model: Producto },
        { model: DetalleReceta, include: [{ model: Producto, as: 'insumo' }] },
      ],
    });

    res.status(201).json(recetaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear receta' });
  }
};

const actualizar = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    const { nombre, porciones, productoId, detalles } = req.body;

    if (productoId && productoId !== receta.productoId) {
      return res.status(400).json({ error: 'No se puede cambiar el producto asociado a la receta' });
    }

    if (detalles !== undefined) {
      if (!Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: 'Debe incluir al menos 1 ingrediente en detalles' });
      }

      const insumoIds = new Set();
      for (const d of detalles) {
        if (!d.insumoId) return res.status(400).json({ error: 'Cada ingrediente debe tener un insumoId' });
        if (Number(d.cantidad) <= 0) return res.status(400).json({ error: `La cantidad del insumo ${d.insumoId} debe ser mayor a 0` });

        if (insumoIds.has(d.insumoId)) {
          return res.status(400).json({ error: `Insumo duplicado en la receta: ${d.insumoId}` });
        }
        insumoIds.add(d.insumoId);

        const insumo = await Producto.findByPk(d.insumoId);
        if (!insumo) return res.status(400).json({ error: `Insumo id ${d.insumoId} no encontrado` });
        if (insumo.tipo !== 'insumo') return res.status(400).json({ error: `El producto id ${d.insumoId} debe ser tipo insumo` });
      }
    }

    await receta.update({ nombre, porciones });

    if (detalles !== undefined) {
      await DetalleReceta.destroy({ where: { recetaId: receta.id } });

      const detallesData = detalles.map((d) => ({
        recetaId: receta.id,
        insumoId: d.insumoId,
        cantidad: d.cantidad,
        unidad: d.unidad || 'unidad',
        merma: d.merma || 0,
      }));
      await DetalleReceta.bulkCreate(detallesData);
    }

    const recetaCompleta = await Receta.findByPk(receta.id, {
      include: [
        { model: Producto },
        { model: DetalleReceta, include: [{ model: Producto, as: 'insumo' }] },
      ],
    });

    res.json(recetaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar receta' });
  }
};

const eliminar = async (req, res) => {
  try {
    const receta = await Receta.findByPk(req.params.id);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    await DetalleReceta.destroy({ where: { recetaId: receta.id } });
    await receta.destroy();

    res.json({ message: 'Receta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar receta' });
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
