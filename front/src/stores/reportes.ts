import { defineStore } from 'pinia'
import api from '../services/api'

export const useReporteStore = defineStore('reportes', {
  state: () => ({
    ventasHoy: { total: 0, cantidad: 0 } as { total: number; cantidad: number },
    ventasPorDia: [] as any[],
    productosMasVendidos: [] as any[],
    comprasMes: { total: 0, cantidad: 0 } as { total: number; cantidad: number },
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const [vh, vpd, pmv, cm] = await Promise.all([
          api.get('/reportes/ventas-hoy'),
          api.get('/reportes/ventas-por-dia'),
          api.get('/reportes/productos-mas-vendidos'),
          api.get('/reportes/compras-mes'),
        ])
        this.ventasHoy = vh.data
        this.ventasPorDia = vpd.data
        this.productosMasVendidos = pmv.data
        this.comprasMes = cm.data
      } finally {
        this.loading = false
      }
    },
  },
})
