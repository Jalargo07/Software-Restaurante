import Tesseract from 'tesseract.js';

export async function escanearOCR(buffer: Buffer, mimetype: string): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, 'spa', {
    logger: () => {},
  });
  return data.text;
}
