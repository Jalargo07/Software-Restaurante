import { defineStore } from 'pinia'
import api from '../services/api'
import type { Venta, MetodoPago, VentaProductoPayload } from '../types'

export const useVentaStore = defineStore('ventas', {
  state: () => ({
    ventas: [] as Venta[],
    total: 0,
    pagina: 1,
    paginas: 1,
    limite: 10,
    loading: false,
  }),
  actions: {
    async fetchVentas(pagina = 1, limite = 10, estado?: string) {
      this.loading = true
      try {
        const params: any = { pagina, limite }
        if (estado) params.estado = estado
        const { data } = await api.get('/ventas', { params })
        this.ventas = data.data
        this.total = data.total
        this.pagina = data.pagina
        this.paginas = data.paginas
        this.limite = data.limite
      } finally {
        this.loading = false
      }
    },
    async createVenta(data: { mesaId?: number }) {
      const res = await api.post('/ventas', data)
      this.ventas.unshift(res.data)
      return res.data
    },
    async createVentaRapida(data: { mesaId?: number; metodoPago: MetodoPago; productos: VentaProductoPayload[] }) {
      const res = await api.post('/ventas/rapida', data)
      this.ventas.unshift(res.data)
      return res.data
    },
    async addProductos(ventaId: number, productos: VentaProductoPayload[]) {
      const res = await api.post(`/ventas/${ventaId}/productos`, { productos })
      const idx = this.ventas.findIndex((v) => v.id === ventaId)
      if (idx !== -1) this.ventas[idx] = res.data
      return res.data
    },
    async cobrarVenta(ventaId: number, metodoPago: MetodoPago) {
      const res = await api.put(`/ventas/${ventaId}/cobrar`, { metodoPago })
      const idx = this.ventas.findIndex((v) => v.id === ventaId)
      if (idx !== -1) this.ventas[idx] = res.data
      return res.data
    },
    async cobrarVentaDividida(ventaId: number, pagos: Array<{ metodo: MetodoPago; monto: number }>) {
      const res = await api.put(`/ventas/${ventaId}/cobrar`, { pagos })
      const idx = this.ventas.findIndex((v) => v.id === ventaId)
      if (idx !== -1) this.ventas[idx] = res.data
      return res.data
    },
  },
})
