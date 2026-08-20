import Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extraerTextoPDF(buffer: Buffer): Promise<string> {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const lines: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 3); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    lines.push(content.items.map((item: any) => item.str).join(' '));
  }
  return lines.join('\n');
}

export async function escanearOCR(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const texto = await extraerTextoPDF(buffer);
    if (texto.trim()) return texto;
    throw new Error('PDF escaneado no soportado. Convertilo a imagen JPG/PNG primero.');
  }
  const { data } = await Tesseract.recognize(buffer, 'spa', {
    logger: () => {},
  });
  return data.text;
}

export async function escanearConOCR(base64Image: string, mimetype: string): Promise<{ texto: string }> {
  const buffer = Buffer.from(base64Image, 'base64');
  const texto = await escanearOCR(buffer, mimetype);
  return { texto };
}
