import { defineStore } from 'pinia'
import api from '../services/api'
import type { AxiosError } from 'axios'
import type { Usuario } from '../types'

export const useSuperAdminAuthStore = defineStore('superAdminAuth', {
  state: () => ({
    token: localStorage.getItem('sa_token') || null,
    user: JSON.parse(localStorage.getItem('sa_user') || 'null') as Usuario | null,
    tempToken: null as string | null,
    error: null as string | null,
    refreshAttempts: 0,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    twoFactorRequired: (state) => !!state.tempToken,
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const { data } = await api.post('/super-admin/login', { email, password })
        if (data.twoFactorRequired) {
          this.tempToken = data.tempToken
          this.error = null
          return { twoFactorRequired: true }
        }
        this.token = data.token
        this.user = data.usuario
        this.tempToken = null
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
    async login2fa(code: string) {
      try {
        const { data } = await api.post('/super-admin/login-2fa', { tempToken: this.tempToken, code })
        this.token = data.token
        this.user = data.usuario
        this.tempToken = null
        localStorage.setItem('sa_token', data.token)
        localStorage.setItem('sa_user', JSON.stringify(data.usuario))
        this.error = null
        return true
      } catch (err) {
        const axiosError = err as AxiosError<{ error: string }>
        this.error = axiosError.response?.data?.error || 'Código inválido'
        return false
      }
    },
    async setup2fa() {
      const { data } = await api.post('/super-admin/setup-2fa')
      return data
    },
    async verify2fa(secret: string, code: string) {
      const { data } = await api.post('/super-admin/verify-2fa', { secret, code })
      return data
    },
    async disable2fa() {
      const { data } = await api.post('/super-admin/disable-2fa')
      return data
    },
    async refresh2fa(code: string) {
      try {
        const expiredToken = localStorage.getItem('sa_token')
        if (!expiredToken) throw new Error('No token')
        const { data } = await api.post('/super-admin/refresh-2fa', { expiredToken, code })
        this.token = data.token
        this.user = data.usuario
        localStorage.setItem('sa_token', data.token)
        localStorage.setItem('sa_user', JSON.stringify(data.usuario))
        this.refreshAttempts = 0
        this.error = null
        return true
      } catch (err) {
        this.refreshAttempts++
        const axiosError = err as AxiosError<{ error: string }>
        this.error = axiosError.response?.data?.error || 'Código inválido'
        if (this.refreshAttempts >= 3) {
          this.logout()
          localStorage.removeItem('sa_refresh_redirect')
        }
        return false
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.tempToken = null
      localStorage.removeItem('sa_token')
      localStorage.removeItem('sa_user')
    },
  },
})
