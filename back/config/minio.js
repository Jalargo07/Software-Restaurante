const Minio = require('minio');

const BUCKET = process.env.MINIO_BUCKET || 'restaurant-images';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) {
      await minioClient.makeBucket(BUCKET, 'us-east-1');
      console.log(`Bucket "${BUCKET}" creado`);

      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET, JSON.stringify(policy));
      console.log(`Política pública aplicada al bucket "${BUCKET}"`);
    }
  } catch (error) {
    console.error('Error al verificar/crear bucket MinIO:', error.message);
  }
};

module.exports = { minioClient, BUCKET, ensureBucket };
