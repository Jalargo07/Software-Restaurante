import { defineStore } from 'pinia'
import api from '../services/api'

export const useVentaStore = defineStore('ventas', {
  state: () => ({
    ventas: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchVentas(estado?: string) {
      this.loading = true
      try {
        const params = estado ? { estado } : {}
        const { data } = await api.get('/ventas', { params })
        this.ventas = data
      } finally {
        this.loading = false
      }
    },
    async createVenta(data: { mesaId?: number }) {
      const res = await api.post('/ventas', data)
      this.ventas.unshift(res.data)
      return res.data
    },
    async createVentaRapida(data: { mesaId?: number; metodoPago: string; productos: { productoId: number; cantidad: number; precioUnitario?: number }[] }) {
      const res = await api.post('/ventas/rapida', data)
      this.ventas.unshift(res.data)
      return res.data
    },
    async addProductos(ventaId: number, productos: { productoId: number; cantidad: number; precioUnitario?: number }[]) {
      const res = await api.post(`/ventas/${ventaId}/productos`, { productos })
      const idx = this.ventas.findIndex((v) => v.id === ventaId)
      if (idx !== -1) this.ventas[idx] = res.data
      return res.data
    },
    async cobrarVenta(ventaId: number, metodoPago: string) {
      const res = await api.put(`/ventas/${ventaId}/cobrar`, { metodoPago })
      const idx = this.ventas.findIndex((v) => v.id === ventaId)
      if (idx !== -1) this.ventas[idx] = res.data
      return res.data
    },
  },
})
