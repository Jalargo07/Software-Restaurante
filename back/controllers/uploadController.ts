import { Request, Response } from 'express';
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { s3Client, BUCKET } from '../config/s3';
import path from 'path';

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Tamaño máximo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function validarArchivo(file: Express.Multer.File): string | null {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo excede el tamaño máximo de 5MB (${Math.round(file.size / 1024 / 1024 * 100) / 100}MB)`;
  }

  // Validar MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return `Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes (JPG, PNG, WebP, GIF)`;
  }

  // Validar extensión
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Extensión no permitida: ${ext}. Solo se permiten: ${ALLOWED_EXTENSIONS.join(', ')}`;
  }

  return null;
}

function sanitizarFilename(filename: string): string {
  // Eliminar caracteres peligrosos y espacios
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export const subirImagen = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Validar archivo
    const error = validarArchivo(req.file);
    if (error) {
      return res.status(400).json({ error });
    }

    // Validar tenantId
    if (!req.tenantId) {
      return res.status(400).json({ error: 'Tenant no especificado' });
    }

    // Procesar imagen con Sharp (convertir a WebP, reducir tamaño)
    const webpBuffer = await sharp(req.file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // Generar nombre seguro
    const sanitizedOriginal = sanitizarFilename(
      path.basename(req.file.originalname, path.extname(req.file.originalname))
    );
    const filename = `${Date.now()}-${sanitizedOriginal}.webp`;
    const key = `${req.tenantId}/${filename}`;

    // Validar path traversal (defensa en profundidad)
    if (key.includes('..') || key.includes('\\') || key.startsWith('/')) {
      return res.status(400).json({ error: 'Nombre de archivo inválido' });
    }

    const uploadParams = {
      Bucket: BUCKET,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const publicUrl = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || 'http://localhost:9000';
    const url = `${publicUrl.replace(/\/$/, '')}/${BUCKET}/${key}`;

    return res.status(201).json({ filename, key, url });
  } catch (error: any) {
    console.error('Error al subir imagen:', error);
    return res.status(500).json({ error: 'Error al subir imagen' });
  }
};

export const eliminarImagen = async (req: Request, res: Response) => {
  try {
    const keyParam = req.params.key;
    const key = Array.isArray(keyParam) ? keyParam[0] : keyParam;

    // Validar path traversal
    if (!key || key.includes('..') || key.includes('\\') || key.startsWith('/')) {
      return res.status(400).json({ error: 'Clave de imagen inválida' });
    }

    let resolvedKey = key;

    // Si no tiene prefijo de tenant, buscar en el tenant actual
    if (!key.includes('/')) {
      if (!req.tenantId) {
        return res.status(400).json({ error: 'Tenant no especificado' });
      }

      const listResponse = await s3Client.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${req.tenantId}/`,
      }));

      const match = (listResponse.Contents || []).find(
        (obj: any) => obj.Key && obj.Key.endsWith(key)
      );

      if (match) {
        resolvedKey = match.Key!;
      } else {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
    }

    // Validar que la imagen pertenece al tenant actual
    if (req.tenantId && !resolvedKey.startsWith(`${req.tenantId}/`)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta imagen' });
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: resolvedKey,
    }));

    return res.json({ message: 'Imagen eliminada' });
  } catch (error: any) {
    console.error('Error al eliminar imagen:', error);
    return res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};
