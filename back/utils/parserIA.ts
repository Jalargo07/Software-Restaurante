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

export async function parsearFactura(
  textoOCR: string,
  proveedores: any[],
  productos: any[]
): Promise<EscaneoFacturaResult> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const proveedoresStr = proveedores.map(p => p.nombre).join(', ');
  const productosStr = productos.map(p => p.nombre).join(', ');

  const prompt = `Eres un asistente experto en facturación chilena y latinoamericana.
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

Proveedores conocidos: ${proveedoresStr}
Productos conocidos: ${productosStr}

Texto OCR:
${textoOCR}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());

  const proveedorMatch = proveedores.find(p =>
    parsed.proveedor?.toLowerCase().includes(p.nombre.toLowerCase()) ||
    p.nombre.toLowerCase().includes(parsed.proveedor?.toLowerCase())
  );

  const items = (parsed.items || []).map((item: any) => {
    const productoMatch = productos.find(p =>
      item.nombre?.toLowerCase().includes(p.nombre.toLowerCase()) ||
      p.nombre.toLowerCase().includes(item.nombre?.toLowerCase())
    );
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
