import { Worker } from 'bullmq';
import { getBullMQConnection } from './connection';
import { escanearConOCR } from '../utils/ocrScanner';
import { parsearConIA } from '../utils/parserIA';
import { OcrJobData } from './ocrQueue';
import { getSocketIO } from '../utils/socketIOGetter';

let worker: Worker | null = null;

export function iniciarOcrWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<OcrJobData>(
    'ocr-processing',
    async (job) => {
      const { imagenBase64, tenantId, mimetype } = job.data;

      await job.updateProgress(10);

      const ocrResult = await escanearConOCR(imagenBase64, mimetype);

      await job.updateProgress(50);

      if (!ocrResult.texto.trim()) {
        throw new Error('No se pudo extraer texto de la factura');
      }

      const parseado = await parsearConIA(ocrResult.texto, tenantId);

      await job.updateProgress(90);

      const io = getSocketIO();
      if (io) {
        io.to(`tenant:${tenantId}`).emit('ocr-complete', {
          jobId: job.id,
          resultado: parseado,
        });
      }

      return parseado;
    },
    {
      connection: getBullMQConnection(),
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job OCR ${job.id} completado`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job OCR ${job?.id} falló:`, err.message);

    if (job) {
      const io = getSocketIO();
      if (io) {
        io.to(`tenant:${job.data.tenantId}`).emit('ocr-failed', {
          jobId: job.id,
          error: err.message,
        });
      }
    }
  });

  worker.on('progress', (job, progress) => {
    console.log(`Job OCR ${job.id} progreso: ${progress}%`);
  });

  console.log('✅ OCR Worker iniciado');

  return worker;
}

export async function cerrarOcrWorker() {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('OCR Worker cerrado');
  }
}
