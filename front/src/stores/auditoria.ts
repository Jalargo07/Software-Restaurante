import { defineStore } from 'pinia'
import api from '../services/api'
import { useToastStore } from './toast'
import type { Auditoria, AuditoriaFiltros, PaginatedResponse } from '../types'

export const useAuditoriaStore = defineStore('auditoria', {
  state: () => ({
    logs: [] as Auditoria[],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    filtros: {} as AuditoriaFiltros,
  }),
  actions: {
    async fetchLogs(filtros?: AuditoriaFiltros) {
      if (filtros) this.filtros = filtros
      this.loading = true
      try {
        const params: Record<string, string | number> = { page: this.page, limit: 20 }
        if (this.filtros.usuario) params.usuario = this.filtros.usuario
        if (this.filtros.entidad) params.entidad = this.filtros.entidad
        if (this.filtros.desde) params.desde = this.filtros.desde
        if (this.filtros.hasta) params.hasta = this.filtros.hasta
        const { data } = await api.get<PaginatedResponse<Auditoria>>('/auditoria', { params })
        this.logs = data.logs
        this.total = data.total
        this.page = data.page
        this.totalPages = data.totalPages
      } catch (error) {
        const toast = useToastStore()
        toast.error('Error al cargar logs de auditoría')
      } finally {
        this.loading = false
      }
    },
    async fetchNextPage() {
      if (this.page < this.totalPages) {
        this.page++
        await this.fetchLogs()
      }
    },
    async fetchPrevPage() {
      if (this.page > 1) {
        this.page--
        await this.fetchLogs()
      }
    },
  },
})
