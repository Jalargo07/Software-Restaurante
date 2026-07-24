const { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { s3Client, BUCKET } = require('../config/s3');
const { withTenant } = require('../utils/tenantScope');

const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const webpBuffer = await sharp(req.file.buffer)
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.webp`;
    const key = `${req.tenantId}/${filename}`;

    const uploadParams = {
      Bucket: BUCKET,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
    const url = `${endpoint.replace(/\/$/, '')}/${BUCKET}/${key}`;

    res.status(201).json({ filename, key, url });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
};

const eliminarImagen = async (req, res) => {
  try {
    const { key } = req.params;

    let resolvedKey = key;
    if (!key.includes('/')) {
      const listResponse = await s3Client.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${req.tenantId}/`,
      }));

      const match = (listResponse.Contents || []).find(
        (obj) => obj.Key && obj.Key.endsWith(key)
      );

      if (match) {
        resolvedKey = match.Key;
      }
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: resolvedKey,
    }));

    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

module.exports = { subirImagen, eliminarImagen };
