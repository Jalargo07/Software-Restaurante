import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export interface QueuedRequest {
  id: string
  tenantId?: number
  method: string
  url: string
  data?: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'offline_sync_queue'
const MAX_RETRIES = 3

export const useSyncQueueStore = defineStore('syncQueue', () => {
  const queue = ref<QueuedRequest[]>([])
  const isSyncing = ref(false)
  const currentTenantId = ref<number | null>(null)

  const pendingCount = computed(() => {
    if (currentTenantId.value === null) return queue.value.length
    return queue.value.filter(r => r.tenantId === currentTenantId.value).length
  })

  const hasPending = computed(() => pendingCount.value > 0)

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        queue.value = JSON.parse(stored)
      }
    } catch {
      queue.value = []
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
  }

  function setTenant(tenantId: number | null) {
    currentTenantId.value = tenantId
  }

  function generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  function addToQueue(method: string, url: string, data?: any): string {
    const id = generateId()
    queue.value.push({
      id,
      tenantId: currentTenantId.value ?? undefined,
      method,
      url,
      data,
      timestamp: Date.now(),
      retries: 0,
    })
    saveToStorage()
    return id
  }

  function removeFromQueue(id: string) {
    queue.value = queue.value.filter((r) => r.id !== id)
    saveToStorage()
  }

  function getQueueForCurrentTenant(): QueuedRequest[] {
    if (currentTenantId.value === null) return queue.value
    return queue.value.filter(r => r.tenantId === currentTenantId.value)
  }

  async function syncQueue() {
    if (isSyncing.value || pendingCount.value === 0) return

    isSyncing.value = true
    const toast = await import('./toast')

    const itemsToSync = [...getQueueForCurrentTenant()]
    const failedIds: string[] = []

    for (const item of itemsToSync) {
      try {
        const config: any = {
          method: item.method,
          url: item.url,
        }
        if (item.data) {
          config.data = item.data
        }
        await api(config)
        removeFromQueue(item.id)
      } catch (error: any) {
        const isNetworkError = !error.response
        if (isNetworkError) {
          item.retries++
          if (item.retries >= MAX_RETRIES) {
            failedIds.push(item.id)
            removeFromQueue(item.id)
            continue
          }
          queue.value = queue.value.map((r) =>
            r.id === item.id ? { ...r, retries: item.retries } : r
          )
        } else {
          removeFromQueue(item.id)
        }
      }
    }

    saveToStorage()
    isSyncing.value = false

    if (failedIds.length > 0) {
      toast.useToastStore().error(`${failedIds.length} solicitud(es) fallaron tras ${MAX_RETRIES} intentos`)
    }
  }

  function clearQueue() {
    if (currentTenantId.value === null) {
      queue.value = []
    } else {
      queue.value = queue.value.filter(r => r.tenantId !== currentTenantId.value)
    }
    saveToStorage()
  }

  loadFromStorage()

  return {
    queue,
    isSyncing,
    currentTenantId,
    pendingCount,
    hasPending,
    setTenant,
    addToQueue,
    removeFromQueue,
    syncQueue,
    clearQueue,
    loadFromStorage,
  }
})
