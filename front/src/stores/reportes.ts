import { defineStore } from 'pinia'
import api from '../services/api'
import { useExcelExport } from '../composables/useExcelExport'
import type { ReporteVentasHoy, ProductoMasVendido, VentasPorDia, ResumenCaja } from '../types'

export const useReporteStore = defineStore('reportes', {
  state: () => ({
    ventasHoy: { total: 0, cantidad: 0 } as ReporteVentasHoy,
    ventasPorDia: [] as VentasPorDia[],
    productosMasVendidos: [] as ProductoMasVendido[],
    comprasMes: { total: 0, cantidad: 0 } as ResumenCaja,
    loading: false,
    exportando: false,
    filtroPeriodo: 'hoy' as 'hoy' | '7dias' | '30dias' | 'mes' | 'personalizado',
    fechaDesde: '',
    fechaHasta: '',
  }),
  actions: {
    async fetchAll(params?: { fechaDesde?: string; fechaHasta?: string; dias?: number }) {
      this.loading = true
      try {
        const queryParams = new URLSearchParams()
        if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde)
        if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta)
        if (params?.dias !== undefined) queryParams.append('dias', params.dias.toString())

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : ''

        const [vh, vpd, pmv, cm] = await Promise.all([
          api.get(`/reportes/ventas-hoy${qs}`),
          api.get(`/reportes/ventas-por-dia${qs}`),
          api.get(`/reportes/productos-mas-vendidos${qs}`),
          api.get(`/reportes/compras-mes${qs}`),
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
