require('dotenv').config();
const { s3Client } = require('../config/s3');
const { ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testS3() {
  try {
    console.log('Verificando conexión con MinIO / S3 con AWS SDK v3...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('¡Conexión exitosa con MinIO / S3!');
    console.log('Buckets encontrados:', response.Buckets ? response.Buckets.map(b => b.Name) : []);
  } catch (error) {
    console.error('Error al conectar con S3 / MinIO:', error);
    process.exit(1);
  }
}

testS3();
