import { defineStore } from 'pinia'
import api from '../services/api'
import type { AxiosError } from 'axios'
import type { Usuario } from '../types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null') as Usuario | null,
    error: null as string | null,
    licenseWarning: localStorage.getItem('licenseWarning') || null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.rol === 'admin',
    isMesero: (state) => state.user?.rol === 'mesero',
    isCajero: (state) => state.user?.rol === 'cajero',
    isCocinero: (state) => state.user?.rol === 'cocinero',
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const { data } = await api.post('/usuarios/login', { email, password })
        this.token = data.accessToken
        this.user = data.usuario
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.usuario))
        this.licenseWarning = (data as any).licenseWarning || null
        if (this.licenseWarning) {
          localStorage.setItem('licenseWarning', this.licenseWarning)
        } else {
          localStorage.removeItem('licenseWarning')
        }
        this.error = null
        return true
      } catch (err) {
        const axiosError = err as AxiosError<{ error: string }>
        this.error = axiosError.response?.data?.error || 'Error al iniciar sesión'
        return false
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.licenseWarning = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('licenseWarning')
    },
  },
})
