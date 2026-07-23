import { defineStore } from 'pinia'
import api from '../services/api'
import type { Producto, ProductoCreatePayload, ProductoUpdatePayload } from '../types'

export const useProductoStore = defineStore('productos', {
  state: () => ({
    productos: [] as Producto[],
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
    async createProducto(producto: ProductoCreatePayload) {
      const { data } = await api.post('/productos', producto)
      this.productos.push(data)
      return data
    },
    async updateProducto(id: number, producto: ProductoUpdatePayload) {
      const { data } = await api.put(`/productos/${id}`, producto)
      const index = this.productos.findIndex((p) => p.id === id)
      if (index !== -1) this.productos[index] = data
      return data
    },
    async desactivarProducto(id: number) {
      await api.delete(`/productos/${id}`)
      this.productos = this.productos.filter((p) => p.id !== id)
    },
  },
})
