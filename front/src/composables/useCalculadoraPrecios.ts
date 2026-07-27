import type { ModulosSeleccionados } from '../types'

export const PRECIOS_MODULOS = {
  pos: { rapido: 0, mesas: 5000, ambos: 10000 },
  mesas: { '0': 0, '5': 10000, '10': 15000, '20': 25000, ilimitado: 40000 },
  usuarios: { '1': 0, '3': 5000, '5': 10000, '10': 20000, ilimitado: 35000 },
  inventario: { basico: 0, avanzado: 8000 },
  delivery: { no: 0, si: 10000 },
  menuQr: { no: 0, si: 5000 },
  reportes: { basico: 0, avanzado: 5000 },
  multiSucursal: { no: 0, si: 10000 },
} as const

export function calcularPrecio(modulos: ModulosSeleccionados): number {
  let total = 15000
  for (const [modulo, valor] of Object.entries(modulos)) {
    const precios = (PRECIOS_MODULOS as any)[modulo]
    if (precios && (precios as any)[valor] !== undefined) {
      total += (precios as any)[valor]
    }
  }
  return total
}