import { defineStore } from 'pinia'
import api from '../services/api'

export const useMesaStore = defineStore('mesas', {
  state: () => ({
    mesas: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchMesas() {
      this.loading = true
      try {
        const { data } = await api.get('/mesas')
        this.mesas = data
      } finally {
        this.loading = false
      }
    },
    async updateMesa(id: number, mesa: any) {
      const { data } = await api.put(`/mesas/${id}`, mesa)
      const index = this.mesas.findIndex((m) => m.id === id)
      if (index !== -1) this.mesas[index] = data
      return data
    },
  },
})
