import { defineStore } from 'pinia'
import api from '../services/api'
import { useExcelExport } from '../composables/useExcelExport'

export const useReporteStore = defineStore('reportes', {
  state: () => ({
    ventasHoy: { total: 0, cantidad: 0 } as { total: number; cantidad: number },
    ventasPorDia: [] as any[],
    productosMasVendidos: [] as any[],
    comprasMes: { total: 0, cantidad: 0 } as { total: number; cantidad: number },
    loading: false,
    exportando: false,
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
    async exportarVentasExcel(fechaDesde?: string, fechaHasta?: string) {
      this.exportando = true
      try {
        const { descargarExcel } = useExcelExport()
        let params = 'ventas'
        const queryParts: string[] = []
        if (fechaDesde) queryParts.push(`fechaDesde=${fechaDesde}`)
        if (fechaHasta) queryParts.push(`fechaHasta=${fechaHasta}`)
        if (queryParts.length) params += '?' + queryParts.join('&')
        const hoy = new Date().toISOString().slice(0, 10)
        await descargarExcel(params, `ventas_${hoy}.xlsx`)
      } finally {
        this.exportando = false
      }
    },
    async exportarComprasExcel(fechaDesde?: string, fechaHasta?: string) {
      this.exportando = true
      try {
        const { descargarExcel } = useExcelExport()
        let params = 'compras'
        const queryParts: string[] = []
        if (fechaDesde) queryParts.push(`fechaDesde=${fechaDesde}`)
        if (fechaHasta) queryParts.push(`fechaHasta=${fechaHasta}`)
        if (queryParts.length) params += '?' + queryParts.join('&')
        const hoy = new Date().toISOString().slice(0, 10)
        await descargarExcel(params, `compras_${hoy}.xlsx`)
      } finally {
        this.exportando = false
      }
    },
  },
})
