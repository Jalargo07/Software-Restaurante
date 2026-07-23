import { defineStore } from 'pinia'
import api from '../services/api'

export const useProveedorStore = defineStore('proveedores', {
  state: () => ({
    proveedores: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchProveedores() {
      this.loading = true
      try {
        const { data } = await api.get('/proveedores')
        this.proveedores = data
      } finally {
        this.loading = false
      }
    },
    async createProveedor(proveedor: any) {
      const { data } = await api.post('/proveedores', proveedor)
      this.proveedores.push(data)
      return data
    },
    async updateProveedor(id: number, proveedor: any) {
      const { data } = await api.put(`/proveedores/${id}`, proveedor)
      const index = this.proveedores.findIndex((p) => p.id === id)
      if (index !== -1) this.proveedores[index] = data
      return data
    },
    async desactivarProveedor(id: number) {
      await api.delete(`/proveedores/${id}`)
      this.proveedores = this.proveedores.filter((p) => p.id !== id)
    },
  },
})
