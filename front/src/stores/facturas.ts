import { defineStore } from 'pinia'
import api from '../services/api'
import type { DocumentoFiscal } from '../types'

export const useFacturaStore = defineStore('facturas', {
  state: () => ({
    facturas: [] as DocumentoFiscal[],
    documento: null as DocumentoFiscal | null,
    loading: false,
  }),
  actions: {
    async fetchFacturas() {
      this.loading = true
      try {
        const { data } = await api.get('/facturas')
        this.facturas = data
      } finally {
        this.loading = false
      }
    },
    async fetchDocumento(ventaId: number) {
      this.loading = true
      try {
        const { data } = await api.get(`/facturas/${ventaId}`)
        this.documento = data
      } finally {
        this.loading = false
      }
    },
    async timbrar(ventaId: number) {
      const { data } = await api.post(`/facturas/${ventaId}/timbrar`)
      return data
    },
    async reintentar(id: number) {
      const { data } = await api.post(`/facturas/${id}/reintentar`)
      return data
    },
  },
})
