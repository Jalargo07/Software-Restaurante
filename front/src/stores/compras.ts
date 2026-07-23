import { defineStore } from 'pinia'
import api from '../services/api'

export const useCompraStore = defineStore('compras', {
  state: () => ({
    compras: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchCompras() {
      this.loading = true
      try {
        const { data } = await api.get('/compras')
        this.compras = data
      } finally {
        this.loading = false
      }
    },
    async createCompra(compra: { proveedorId: number; observaciones?: string; detalles: { productoId: number; cantidad: number; precioUnitario: number }[] }) {
      const { data } = await api.post('/compras', compra)
      this.compras.unshift(data)
      return data
    },
    async recibirCompra(id: number) {
      const { data } = await api.put(`/compras/${id}/recibir`)
      const idx = this.compras.findIndex((c) => c.id === id)
      if (idx !== -1) this.compras[idx] = data
      return data
    },
    async actualizarCompra(id: number, compra: { proveedorId?: number; observaciones?: string; detalles?: { productoId: number; cantidad: number; precioUnitario: number }[] }) {
      const { data } = await api.put(`/compras/${id}`, compra)
      const idx = this.compras.findIndex((c) => c.id === id)
      if (idx !== -1) this.compras[idx] = data
      return data
    },
    async cancelarCompra(id: number) {
      await api.delete(`/compras/${id}`)
      await this.fetchCompras()
    },
  },
})
