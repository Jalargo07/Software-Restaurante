import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface EscaneoItemFactura {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  unidad?: string;
  productoId?: number | null;
}

export interface EscaneoProveedorFactura {
  nombre: string;
  id?: number | null;
  rut?: string;
}

export interface EscaneoFacturaResult {
  proveedor: EscaneoProveedorFactura;
  fecha: string;
  items: EscaneoItemFactura[];
}

const PROMPT_TEMPLATE = `Eres un asistente experto en facturación chilena y latinoamericana.
Dado el siguiente texto extraído con OCR de una factura de compra,
extrae la información en formato JSON válido (sin markdown, solo JSON) con esta estructura:
{
  "proveedor": "nombre del proveedor",
  "fecha": "YYYY-MM-DD",
  "items": [
    { "nombre": "nombre del producto", "cantidad": 5, "precioUnitario": 1500 }
  ]
}

Reglas:
- Normalizar nombres de productos (singular, mayúsculas correctas)
- Si el precio unitario no está explícito, calcularlo como total_linea / cantidad
- Ignorar impuestos (IVA), descuentos, totales
- Si la cantidad no está visible, asumir 1
- Si la unidad no está, NO incluir el campo unidad

Proveedores conocidos: {{proveedores}}
Productos conocidos: {{productos}}

Texto OCR:
{{texto}}`;

function construirPrompt(textoOCR: string, proveedores: any[], productos: any[]): string {
  return PROMPT_TEMPLATE
    .replace('{{proveedores}}', proveedores.map(p => p.nombre).join(', '))
    .replace('{{productos}}', productos.map(p => p.nombre).join(', '))
    .replace('{{texto}}', textoOCR);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function buscarCoincidencia(nombre: string, lista: any[]): any | null {
  if (!nombre) return null;
  const n = nombre.toLowerCase().trim();
  // 1. Exact match
  let match = lista.find((x: any) => x.nombre.toLowerCase() === n);
  if (match) return match;
  // 2. Includes
  match = lista.find((x: any) => n.includes(x.nombre.toLowerCase()) || x.nombre.toLowerCase().includes(n));
  if (match) return match;
  // 3. Fuzzy (Levenshtein < 30% del largo)
  let best: any = null;
  let bestDist = Infinity;
  for (const item of lista) {
    const dist = levenshtein(n, item.nombre.toLowerCase());
    const threshold = Math.max(n.length, item.nombre.length) * 0.3;
    if (dist < bestDist && dist < threshold) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

function parsearRespuesta(raw: string, proveedores: any[], productos: any[]): EscaneoFacturaResult {
  const limpiado = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(limpiado);

  const proveedorMatch = buscarCoincidencia(parsed.proveedor, proveedores);

  const items = (parsed.items || []).map((item: any) => {
    const productoMatch = buscarCoincidencia(item.nombre, productos);
    return {
      nombre: item.nombre || '',
      cantidad: Number(item.cantidad) || 1,
      precioUnitario: Number(item.precioUnitario) || 0,
      productoId: productoMatch?.id || null,
    };
  });

  return {
    proveedor: {
      nombre: parsed.proveedor || '',
      id: proveedorMatch?.id || null,
    },
    fecha: parsed.fecha || '',
    items,
  };
}

async function llamarGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL || 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function llamarOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content || '{}';
}

async function llamarDeepSeek(prompt: string): Promise<string> {
  const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com/v1',
  });
  const response = await deepseek.chat.completions.create({
    model: process.env.AI_MODEL || 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content || '{}';
}

async function llamarGroq(prompt: string): Promise<string> {
  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
  });
  const response = await groq.chat.completions.create({
    model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content || '{}';
}

export async function parsearFactura(
  textoOCR: string,
  proveedores: any[],
  productos: any[]
): Promise<EscaneoFacturaResult> {
  const provider = process.env.AI_PROVIDER || 'gemini';
  const prompt = construirPrompt(textoOCR, proveedores, productos);

  let raw: string;
  try {
    if (provider === 'openai') {
      raw = await llamarOpenAI(prompt);
    } else if (provider === 'deepseek') {
      raw = await llamarDeepSeek(prompt);
    } else if (provider === 'groq') {
      raw = await llamarGroq(prompt);
    } else {
      raw = await llamarGemini(prompt);
    }
  } catch (error: any) {
    console.error(`${provider} falló:`, error.message);
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'CHANGE_ME') {
      console.warn('Probando con OpenAI como fallback...');
      raw = await llamarOpenAI(prompt);
    } else {
      throw new Error(`${provider}: ${error.message}`);
    }
  }

  return parsearRespuesta(raw, proveedores, productos);
}

export async function parsearConIA(textoOCR: string, tenantId: number): Promise<EscaneoFacturaResult> {
  const { Proveedor, Producto } = await import('../models');
  const proveedores = await Proveedor.findAll({ where: { activo: true, tenantId } });
  const productos = await Producto.findAll({ where: { activo: true, tenantId } });
  return parsearFactura(textoOCR, proveedores, productos);
}
