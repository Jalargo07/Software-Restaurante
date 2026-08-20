import { Queue } from 'bullmq';
import { getBullMQConnection } from './connection';

export const ocrQueue = new Queue('ocr-processing', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export interface OcrJobData {
  imagenBase64: string;
  tenantId: number;
  mimetype: string;
  fileName: string;
}

export async function encolarEscaneoFactura(data: OcrJobData) {
  return await ocrQueue.add('escanear-factura', data, {
    jobId: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
}

export async function obtenerEstadoJob(jobId: string) {
  const job = await ocrQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress;

  return {
    jobId: job.id,
    state,
    progress,
    result: job.returnvalue,
    failedReason: job.failedReason,
  };
}
