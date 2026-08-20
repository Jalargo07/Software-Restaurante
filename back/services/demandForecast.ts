interface DataPoint {
  fecha: Date;
  cantidad: number;
}

interface ForecastResult {
  productoId: number;
  nombre: string;
  cantidadPredicha: number;
  confianza: number;
}

export function linearRegression(data: DataPoint[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.cantidad || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = data[i].cantidad;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function predecirDemanda(data: DataPoint[], diasFuturos: number = 7): number {
  const { slope, intercept } = linearRegression(data);
  return Math.max(0, intercept + slope * data.length + slope * diasFuturos);
}

export function calcularConfianza(data: DataPoint[]): number {
  if (data.length < 3) return 0;

  const { slope, intercept } = linearRegression(data);

  let sumErrors = 0;
  for (let i = 0; i < data.length; i++) {
    const predicted = intercept + slope * i;
    sumErrors += Math.pow(data[i].cantidad - predicted, 2);
  }

  const range = Math.max(...data.map(d => d.cantidad)) - Math.min(...data.map(d => d.cantidad));
  if (range === 0) return 0;
  const r2 = 1 - (sumErrors / (data.length * Math.pow(range, 2)));
  return Math.min(100, Math.max(0, r2 * 100));
}

export async function obtenerForecast(
  tenantId: number,
  dias: number = 7
): Promise<ForecastResult[]> {
  const { Producto, DetalleVenta, Venta } = await import('../models');

  const productos = await Producto.findAll({
    where: { tenantId, activo: true }
  });

  const results: ForecastResult[] = [];

  for (const producto of productos) {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 30);

    const ventas = await Venta.findAll({
      where: { tenantId, estado: 'cerrada', createdAt: { gte: fechaDesde } },
      include: [{
        model: DetalleVenta,
        where: { productoId: (producto as any).id },
        required: true
      }]
    });

    const cantidadesPorDia: Record<string, number> = {};
    for (const venta of ventas) {
      const fechaKey = (venta as any).createdAt.toISOString().split('T')[0];
      const detalle = (venta as any).DetalleVentas?.[0];
      if (detalle) {
        cantidadesPorDia[fechaKey] = (cantidadesPorDia[fechaKey] || 0) + detalle.cantidad;
      }
    }

    const dataPoints: DataPoint[] = Object.entries(cantidadesPorDia)
      .map(([fecha, cantidad]) => ({ fecha: new Date(fecha), cantidad }))
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    if (dataPoints.length >= 3) {
      const cantidadPredicha = Math.round(predecirDemanda(dataPoints, dias));
      const confianza = Math.round(calcularConfianza(dataPoints));

      results.push({
        productoId: (producto as any).id,
        nombre: (producto as any).nombre,
        cantidadPredicha,
        confianza
      });
    }
  }

  return results.sort((a, b) => b.confianza - a.confianza);
}
