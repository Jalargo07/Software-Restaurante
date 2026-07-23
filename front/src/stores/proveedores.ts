import { defineStore } from 'pinia'
import api from '../services/api'
import type { Proveedor, ProveedorCreatePayload, ProveedorUpdatePayload } from '../types'

export const useProveedorStore = defineStore('proveedores', {
  state: () => ({
    proveedores: [] as Proveedor[],
    total: 0,
    pagina: 1,
    paginas: 1,
    limite: 10,
    loading: false,
  }),
  actions: {
    async fetchProveedores(pagina = 1, limite = 10, buscar?: string) {
      this.loading = true
      try {
        const params: any = { pagina, limite }
        if (buscar) params.buscar = buscar
        const { data } = await api.get('/proveedores', { params })
        this.proveedores = data.data
        this.total = data.total
        this.pagina = data.pagina
        this.paginas = data.paginas
        this.limite = data.limite
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
