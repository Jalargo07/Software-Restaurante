import { defineStore } from 'pinia'
import api from '../services/api'
import type { ResumenCaja, CorteCaja } from '../types'

export const useCorteStore = defineStore('cortes', {
  state: () => ({
    resumen: null as ResumenCaja | null,
    cortes: [] as CorteCaja[],
    loading: false,
  }),
  actions: {
    async fetchResumen(fecha?: string) {
      this.loading = true
      try {
        const params = fecha ? { fecha } : {}
        const { data } = await api.get('/cortes/resumen', { params })
        this.resumen = data
      } finally {
        this.loading = false
      }
    },
    async cerrarCaja(fecha?: string) {
      const params = fecha ? { fecha } : {}
      const { data } = await api.post('/cortes/cerrar', {}, { params })
      this.resumen = data
      return data
    },
    async fetchCortes() {
      this.loading = true
      try {
        const { data } = await api.get('/cortes')
        this.cortes = data
      } finally {
        this.loading = false
      }
    },
  },
})
