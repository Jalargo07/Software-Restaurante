import { defineStore } from 'pinia'
import api from '../services/api'
import type { AxiosError } from 'axios'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null') as Usuario | null,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.rol === 'admin',
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const { data } = await api.post('/usuarios/login', { email, password })
        this.token = data.token
        this.user = data.usuario
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.usuario))
        this.error = null
        return true
      } catch (err) {
        const axiosError = err as AxiosError<{ error: string }>
        this.error = axiosError.response?.data?.error || 'Error al iniciar sesion'
        return false
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
