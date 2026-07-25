import { defineStore } from 'pinia'
import api from '../services/api'
import type { AxiosError } from 'axios'
import type { Usuario } from '../types'

export const useSuperAdminAuthStore = defineStore('superAdminAuth', {
  state: () => ({
    token: localStorage.getItem('sa_token') || null,
    user: JSON.parse(localStorage.getItem('sa_user') || 'null') as Usuario | null,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const { data } = await api.post('/super-admin/login', { email, password })
        this.token = data.token
        this.user = data.usuario
        localStorage.setItem('sa_token', data.token)
        localStorage.setItem('sa_user', JSON.stringify(data.usuario))
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
      localStorage.removeItem('sa_token')
      localStorage.removeItem('sa_user')
    },
  },
})
