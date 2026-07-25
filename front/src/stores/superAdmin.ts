import { defineStore } from 'pinia'
import api from '../services/api'
import type { Tenant, TenantPlan, TenantEstado, SuperAdminStats } from '../types'

export const useSuperAdminStore = defineStore('superAdmin', {
  state: () => ({
    tenants: [] as Tenant[],
    loading: false,
    stats: null as SuperAdminStats | null,
    filtroPlan: '',
    filtroEstado: '',
  }),
  actions: {
    async fetchStats() {
      try {
        const { data } = await api.get('/super-admin/stats')
        this.stats = data
      } catch { /* ignore */ }
    },
    async fetchTenants() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.filtroPlan) params.set('plan', this.filtroPlan)
        if (this.filtroEstado) params.set('estado', this.filtroEstado)
        const { data } = await api.get(`/super-admin/tenants?${params}`)
        this.tenants = data
      } finally {
        this.loading = false
      }
    },
    async cambiarEstado(id: number, estado: TenantEstado) {
      const { data } = await api.put(`/super-admin/tenants/${id}/estado`, { estado })
      const idx = this.tenants.findIndex(t => t.id === id)
      if (idx !== -1) this.tenants[idx] = { ...this.tenants[idx], ...data.tenant }
      return data
    },
    async cambiarPlan(id: number, plan: TenantPlan) {
      const { data } = await api.put(`/super-admin/tenants/${id}/plan`, { plan })
      const idx = this.tenants.findIndex(t => t.id === id)
      if (idx !== -1) this.tenants[idx] = { ...this.tenants[idx], ...data.tenant }
      return data
    },
  },
})
