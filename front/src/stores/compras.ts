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
    async createCompra(compra: { proveedor: string; observaciones?: string; detalles: { productoId: number; cantidad: number; precioUnitario: number }[] }) {
      const { data } = await api.post('/compras', compra)
      this.compras.unshift(data)
      return data
    },
  },
})
