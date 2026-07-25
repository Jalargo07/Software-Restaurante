import { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

export const BUCKET = process.env.S3_BUCKET_NAME || 'restaurante-bucket';
export const REGION = process.env.S3_REGION || 'auto';
export const ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
export const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY;
export const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('S3_ACCESS_KEY y S3_SECRET_KEY son requeridos en producción');
  }
  console.warn('⚠️ Credenciales S3 no configuradas, usando defaults de desarrollo');
}

// R2 requiere forcePathStyle: false, MinIO requiere true
export const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== undefined
  ? process.env.S3_FORCE_PATH_STYLE === 'true'
  : ENDPOINT.includes('localhost');

export const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY || 'dev-access-key',
    secretAccessKey: SECRET_KEY || 'dev-secret-key',
  },
  forcePathStyle,
});

export const ensureBucket = async () => {
  try {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
      console.log(`Bucket "${BUCKET}" ya existe.`);
    } catch (error) {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
      console.log(`Bucket "${BUCKET}" creado correctamente.`);

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

      try {
        await s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: BUCKET,
            Policy: JSON.stringify(policy),
          })
        );
        console.log(`Política pública aplicada al bucket "${BUCKET}".`);
      } catch (policyError: any) {
        console.warn(`No se pudo aplicar la política pública al bucket:`, policyError.message);
      }
    }
  } catch (error: any) {
    console.warn(`[S3] Aviso: No se pudo verificar o crear el bucket "${BUCKET}":`, error.message);
  }
};
