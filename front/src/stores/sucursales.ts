import { defineStore } from 'pinia'
import api from '../services/api'
import type { Sucursal } from '../types'

export const useSucursalStore = defineStore('sucursales', {
  state: () => ({
    sucursales: [] as Sucursal[],
    selectedId: null as number | null,
    loading: false,
  }),
  getters: {
    selected: (state) => state.sucursales.find(s => s.id === state.selectedId) || null,
    hasSucursales: (state) => state.sucursales.length > 0,
  },
  actions: {
    async fetchSucursales() {
      this.loading = true
      try {
        const { data } = await api.get('/sucursales')
        this.sucursales = data
        if (data.length > 0 && !this.selectedId) this.selectedId = data[0].id
      } finally { this.loading = false }
    },
    setSucursal(id: number) { this.selectedId = id },
    async crear(payload: Partial<Sucursal>) {
      const { data } = await api.post('/sucursales', payload)
      this.sucursales.push(data)
      return data
    },
    async actualizar(id: number, payload: Partial<Sucursal>) {
      const { data } = await api.put(`/sucursales/${id}`, payload)
      const idx = this.sucursales.findIndex(s => s.id === id)
      if (idx !== -1) this.sucursales[idx] = data
      return data
    },
    async eliminar(id: number) {
      await api.delete(`/sucursales/${id}`)
      this.sucursales = this.sucursales.filter(s => s.id !== id)
      if (this.selectedId === id) this.selectedId = this.sucursales[0]?.id || null
    },
  },
})
