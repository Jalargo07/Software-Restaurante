import { defineStore } from 'pinia'
import api from '../services/api'

export interface DetalleComanda {
  id: number
  cantidad: number
  precioUnitario: number
  subtotal: number
  estadoComanda: 'pendiente' | 'en_preparacion' | 'listo'
  Producto?: { id: number; nombre: string }
  VentaId: number
}

export interface ComandaVenta {
  id: number
  total: number
  cliente?: string
  createdAt: string
  Mesa?: { id: number; numero: number }
  DetalleVentas?: DetalleComanda[]
  DetalleVenta?: DetalleComanda[]
}

export const useComandaStore = defineStore('comandas', {
  state: () => ({
    comandas: [] as ComandaVenta[],
    loading: false,
  }),
  actions: {
    async fetchComandas() {
      this.loading = true
      try {
        const { data } = await api.get('/comandas')
        this.comandas = data
      } finally {
        this.loading = false
      }
    },
    agregarComanda(venta: any) {
      const existe = this.comandas.find(c => c.id === venta.id)
      if (!existe) this.comandas.unshift(venta)
    },
    actualizarComandaLocal(venta: any) {
      const index = this.comandas.findIndex(c => c.id === venta.id)
      if (index !== -1) {
        const detalles = venta.DetalleVentas || venta.DetalleVenta || []
        if (detalles.length > 0) {
          this.comandas[index] = venta
        } else {
          this.comandas.splice(index, 1)
        }
      }
    },
    removerComandaPorVentaId(ventaId: number) {
      this.comandas = this.comandas.filter(c => c.id !== ventaId)
    },
    async actualizarEstado(detalleId: number, estado: 'pendiente' | 'en_preparacion' | 'listo') {
      const { data } = await api.put(`/comandas/${detalleId}/estado`, { estadoComanda: estado })
      const index = this.comandas.findIndex((c) => c.id === data.id)
      if (index !== -1) {
        const detalles = data.DetalleVentas || data.DetalleVenta || []
        if (detalles.length > 0) {
          this.comandas[index] = data
        } else {
          this.comandas.splice(index, 1)
        }
      }
      return data
    },
  },
})
