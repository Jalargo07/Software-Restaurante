const { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

const BUCKET = process.env.S3_BUCKET_NAME || 'restaurante-bucket';
const REGION = process.env.S3_REGION || 'us-east-1';
const ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const ACCESS_KEY = process.env.S3_ACCESS_KEY || 'alejoadmin';
const SECRET_KEY = process.env.S3_SECRET_KEY || 'alejo1234';

const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  forcePathStyle: true,
});

const ensureBucket = async () => {
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
      } catch (policyError) {
        console.warn(`No se pudo aplicar la política pública al bucket:`, policyError.message);
      }
    }
  } catch (error) {
    console.error('Error al verificar/crear bucket S3:', error.message);
  }
};

module.exports = { s3Client, BUCKET, ensureBucket };
