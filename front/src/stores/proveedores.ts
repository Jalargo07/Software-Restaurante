import { defineStore } from 'pinia'
import api from '../services/api'
import type { Proveedor, ProveedorCreatePayload, ProveedorUpdatePayload } from '../types'

export const useProveedorStore = defineStore('proveedores', {
  state: () => ({
    proveedores: [] as Proveedor[],
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
    async createProveedor(proveedor: ProveedorCreatePayload) {
      const { data } = await api.post('/proveedores', proveedor)
      this.proveedores.push(data)
      return data
    },
    async updateProveedor(id: number, proveedor: ProveedorUpdatePayload) {
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
