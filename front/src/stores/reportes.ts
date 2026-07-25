import { defineStore } from 'pinia'
import api from '../services/api'
import { useExcelExport } from '../composables/useExcelExport'
import type { ReporteVentasHoy, ProductoMasVendido, VentasPorDia, ResumenCaja, GananciaBruta } from '../types'

export const useReporteStore = defineStore('reportes', {
  state: () => ({
    ventasHoy: { total: 0, cantidad: 0 } as ReporteVentasHoy,
    ventasPorDia: [] as VentasPorDia[],
    gananciaBruta: [] as GananciaBruta[],
    productosMasVendidos: [] as ProductoMasVendido[],
    comprasMes: { total: 0, cantidad: 0 } as ResumenCaja,
    loading: false,
    exportando: false,
    filtroPeriodo: 'hoy' as 'hoy' | '7dias' | '30dias' | 'mes' | 'personalizado',
    fechaDesde: '',
    fechaHasta: '',
    productoIds: [] as (string | number)[],
  }),
  actions: {
    async fetchAll(params?: { fechaDesde?: string; fechaHasta?: string; dias?: number; productoIds?: (string | number)[] }) {
      this.loading = true
      try {
        const queryParams = new URLSearchParams()
        if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde)
        if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta)
        if (params?.dias !== undefined) queryParams.append('dias', params.dias.toString())
        if (params?.productoIds && params.productoIds.length > 0) {
          queryParams.append('productoIds', params.productoIds.join(','))
        }

        const qs = queryParams.toString() ? `?${queryParams.toString()}` : ''

        const [vh, vpd, pmv, cm, gb] = await Promise.all([
          api.get(`/reportes/ventas-hoy${qs}`),
          api.get(`/reportes/ventas-por-dia${qs}`),
          api.get(`/reportes/productos-mas-vendidos${qs}`),
          api.get(`/reportes/compras-mes${qs}`),
          api.get(`/reportes/ganancia-bruta${qs}`),
        ])
        this.ventasHoy = vh.data
        this.ventasPorDia = vpd.data
        this.productosMasVendidos = pmv.data
        this.comprasMes = cm.data
        this.gananciaBruta = gb.data
      } finally {
        this.loading = false
      }
    },
    async fetchGananciaBruta(params?: { fechaDesde?: string; fechaHasta?: string; dias?: number }) {
      try {
        const queryParams = new URLSearchParams()
        if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde)
        if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta)
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : ''
        const { data } = await api.get(`/reportes/ganancia-bruta${qs}`)
        this.gananciaBruta = data
      } catch (error) {
        console.error('Error fetching ganancia bruta:', error)
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
