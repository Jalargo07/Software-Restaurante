import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('sa_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError = !error.response
    const isOffline = !window.navigator.onLine

    if (isNetworkError || isOffline) {
      const method = error.config?.method?.toUpperCase() || 'GET'
      const url = error.config?.url || ''
      const data = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : error.config?.data

      try {
        const { useSyncQueueStore } = await import('../stores/syncQueue')
        const syncStore = useSyncQueueStore()
        syncStore.addToQueue(method, url, data)
      } catch {
        // store no disponible aun
      }
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      const saToken = localStorage.getItem('sa_token')
      if (saToken) {
        const currentPath = window.location.pathname
        localStorage.setItem('sa_refresh_redirect', currentPath)
        window.location.href = '/admin/refresh-2fa'
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
