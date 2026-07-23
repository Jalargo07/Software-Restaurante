import { defineStore } from 'pinia'
import api from '../services/api'
import type { Venta, VentaProductoPayload } from '../types'

export const usePedidoStore = defineStore('pedidos', {
  state: () => ({
    pedidos: [] as Venta[],
    loading: false,
  }),
  actions: {
    async fetchPedidos(estado?: string) {
      this.loading = true
      try {
        const params = estado ? { estado } : {}
        const { data } = await api.get('/ventas', { params })
        this.pedidos = data
      } finally {
        this.loading = false
      }
    },
    async createPedido(mesaId?: number) {
      const { data } = await api.post('/ventas', { mesaId })
      this.pedidos.unshift(data)
      return data
    },
    async cancelarPedido(id: number) {
      await api.delete(`/ventas/${id}`)
      this.pedidos = this.pedidos.filter((p) => p.id !== id)
    },
    async addProductos(ventaId: number, productos: VentaProductoPayload[]) {
      const { data } = await api.post(`/ventas/${ventaId}/productos`, { productos })
      const index = this.pedidos.findIndex((p) => p.id === ventaId)
      if (index !== -1) this.pedidos[index] = data
      return data
    },
    async updatePedido(id: number, dataPedido: { cliente?: string; mesaId?: number | null }) {
      const { data } = await api.put(`/ventas/${id}`, dataPedido)
      const index = this.pedidos.findIndex((p) => p.id === id)
      if (index !== -1) this.pedidos[index] = data
      return data
    },
    async editarDetalle(ventaId: number, detalleId: number, cantidad: number) {
      const { data } = await api.put(`/ventas/${ventaId}/detalle/${detalleId}`, { cantidad })
      const index = this.pedidos.findIndex((p) => p.id === ventaId)
      if (index !== -1) this.pedidos[index] = data
      return data
    },
    async eliminarDetalle(ventaId: number, detalleId: number) {
      const { data } = await api.delete(`/ventas/${ventaId}/detalle/${detalleId}`)
      const index = this.pedidos.findIndex((p) => p.id === ventaId)
      if (index !== -1) this.pedidos[index] = data
      return data
    },
  },
})
