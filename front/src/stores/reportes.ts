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
    cogs: {
      totalVentas: 0,
      totalCostos: 0,
      cogsPorcentaje: 0,
      gananciaBruta: 0,
      margenPorcentaje: 0,
    },
    heatmap: {
      horas: [] as number[],
      dias: [] as string[],
      matrix: [] as number[][],
    },
    loading: false,
    error: null as string | null,
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
        this.fetchCOGS(params?.fechaDesde, params?.fechaHasta)
      } finally {
        this.loading = false
      }
    },
    async fetchGananciaBruta(params?: { fechaDesde?: string; fechaHasta?: string; dias?: number; productoIds?: (string | number)[] }) {
      try {
        const queryParams = new URLSearchParams()
        if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde)
        if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta)
        if (params?.productoIds && params.productoIds.length > 0) {
          queryParams.append('productoIds', params.productoIds.join(','))
        }
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : ''
        const { data } = await api.get(`/reportes/ganancia-bruta${qs}`)
        this.gananciaBruta = data
      } catch (error) {
        console.error('Error fetching ganancia bruta:', error)
      }
    },
    async fetchCOGS(fechaDesde?: string, fechaHasta?: string) {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (fechaDesde) params.append('fechaDesde', fechaDesde)
        if (fechaHasta) params.append('fechaHasta', fechaHasta)
        const { data } = await api.get(`/reportes/cogs?${params.toString()}`)
        this.cogs = data
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async fetchHeatmap(productoId?: string | number) {
      try {
        const params = new URLSearchParams()
        if (productoId) params.append('productoId', productoId.toString())
        const { data } = await api.get(`/reportes/heatmap?${params.toString()}`)
        this.heatmap = data
      } catch (error: any) {
        this.error = error.message
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
