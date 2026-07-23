const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET } = require('../config/s3');

const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const ext = req.file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

    const uploadParams = {
      Bucket: BUCKET,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
    const url = `${endpoint.replace(/\/$/, '')}/${BUCKET}/${filename}`;

    res.status(201).json({ filename, url });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
};

const eliminarImagen = async (req, res) => {
  try {
    const { filename } = req.params;
    const deleteParams = {
      Bucket: BUCKET,
      Key: filename,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

module.exports = { subirImagen, eliminarImagen };
