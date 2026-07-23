import { defineStore } from 'pinia'
import api from '../services/api'

export const useRecetaStore = defineStore('recetas', {
  state: () => ({
    recetas: [] as any[],
    loading: false,
  }),
  actions: {
    async fetchRecetas() {
      this.loading = true
      try {
        const { data } = await api.get('/recetas')
        this.recetas = data
      } finally {
        this.loading = false
      }
    },
    async createReceta(receta: any) {
      const { data } = await api.post('/recetas', receta)
      await this.fetchRecetas()
      return data
    },
    async updateReceta(id: number, receta: any) {
      const { data } = await api.put(`/recetas/${id}`, receta)
      await this.fetchRecetas()
      return data
    },
    async deleteReceta(id: number) {
      await api.delete(`/recetas/${id}`)
      this.recetas = this.recetas.filter((r) => r.id !== id)
    },
  },
})
