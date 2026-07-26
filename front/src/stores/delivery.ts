import { defineStore } from 'pinia'
import api from '../services/api'
import type { DeliveryConfig, DeliveryApp } from '../types'

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({
    configs: [] as DeliveryConfig[],
    loading: false,
  }),
  actions: {
    async fetchConfigs() {
      this.loading = true
      try {
        const { data } = await api.get('/delivery/config')
        this.configs = data
      } finally { this.loading = false }
    },
    async updateConfig(app: DeliveryApp, payload: Partial<DeliveryConfig>) {
      const { data } = await api.put('/delivery/config', { app, ...payload })
      const idx = this.configs.findIndex(c => c.app === app)
      if (idx !== -1) this.configs[idx] = data
      else this.configs.push(data)
      return data
    },
    async simularPedido(payload: { app: DeliveryApp; productos: Array<{ nombre: string; cantidad: number; precio?: number }> }) {
      const { data } = await api.post('/delivery/simular', payload)
      return data
    },
  },
})
