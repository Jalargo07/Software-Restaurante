const { minioClient, BUCKET } = require('../config/minio');

const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const ext = req.file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

    await minioClient.putObject(BUCKET, filename, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET}/${filename}`;

    res.status(201).json({ filename, url });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir imagen' });
  }
};

const eliminarImagen = async (req, res) => {
  try {
    const { filename } = req.params;
    await minioClient.removeObject(BUCKET, filename);
    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

module.exports = { subirImagen, eliminarImagen };
