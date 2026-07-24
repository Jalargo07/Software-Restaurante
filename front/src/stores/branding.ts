import { defineStore } from 'pinia'
import api from '../services/api'
import type { TenantConfig, TenantConfigUpdatePayload, PublicBrandingResponse } from '../types'

export const useBrandingStore = defineStore('branding', {
  state: () => ({
    branding: null as TenantConfig | null,
    publicBranding: null as PublicBrandingResponse | null,
    loading: false,
  }),
  actions: {
    async fetchBranding() {
      this.loading = true
      try {
        const { data } = await api.get('/branding')
        this.branding = data
      } finally {
        this.loading = false
      }
    },
    async updateBranding(payload: TenantConfigUpdatePayload) {
      const { data } = await api.put('/branding', payload)
      this.branding = data
      return data
    },
    async fetchPublicBranding(slug: string) {
      this.loading = true
      try {
        const { data } = await api.get(`/public/branding/${slug}`)
        this.publicBranding = data
      } finally {
        this.loading = false
      }
    },
  },
})
