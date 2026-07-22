import { defineStore } from 'pinia'
import api from '../services/api'

export const useProductoStore = defineStore('productos', {
  state: () => ({
    productos: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchProductos(categoria?: string) {
      this.loading = true
      try {
        const params = categoria ? { categoria } : {}
        const { data } = await api.get('/productos', { params })
        this.productos = data
      } finally {
        this.loading = false
      }
    },
    async createProducto(producto: any) {
      const { data } = await api.post('/productos', producto)
      this.productos.push(data)
      return data
    },
    async updateProducto(id: number, producto: any) {
      const { data } = await api.put(`/productos/${id}`, producto)
      const index = this.productos.findIndex((p) => p.id === id)
      if (index !== -1) this.productos[index] = data
      return data
    },
  },
})
