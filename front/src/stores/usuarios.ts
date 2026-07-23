import { defineStore } from 'pinia'
import api from '../services/api'
import type { Usuario, UsuarioCreatePayload, UsuarioUpdatePayload } from '../types'

export const useUsuarioStore = defineStore('usuarios', {
  state: () => ({
    usuarios: [] as Usuario[],
    loading: false,
  }),
  actions: {
    async fetchUsuarios() {
      this.loading = true
      try {
        const { data } = await api.get('/usuarios')
        this.usuarios = data
      } finally {
        this.loading = false
      }
    },
    async createUsuario(usuario: UsuarioCreatePayload) {
      const { data } = await api.post('/usuarios', usuario)
      this.usuarios.push(data)
      return data
    },
    async updateUsuario(id: number, usuario: UsuarioUpdatePayload) {
      const { data } = await api.put(`/usuarios/${id}`, usuario)
      const idx = this.usuarios.findIndex((u) => u.id === id)
      if (idx !== -1) this.usuarios[idx] = data
      return data
    },
    async deleteUsuario(id: number) {
      await api.delete(`/usuarios/${id}`)
      const idx = this.usuarios.findIndex((u) => u.id === id)
      if (idx !== -1) this.usuarios[idx].activo = false
    },
  },
})
