import { defineStore } from 'pinia'
import api from '../services/api'
import type { LandingData } from '../types'

export const useCmsStore = defineStore('cms', {
  state: () => ({
    data: null as LandingData | null,
    loading: false,
  }),
  actions: {
    async fetchLanding() {
      this.loading = true
      try {
        const { data } = await api.get('/landing')
        this.data = data?.data || null
      } catch { /* ignore */ }
      finally { this.loading = false }
    },
    async updateLanding(payload: LandingData) {
      const { data } = await api.put('/landing', { data: payload })
      this.data = data?.data || null
      return data
    },
  },
})
