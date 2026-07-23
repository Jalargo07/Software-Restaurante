import { defineStore } from 'pinia'
import type { Toast } from '../types'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
    nextId: 0,
  }),
  actions: {
    add(message: string, type: Toast['type'] = 'info') {
      const id = this.nextId++
      this.toasts.push({ id, message, type })
      setTimeout(() => this.remove(id), 3500)
    },
    remove(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    success(msg: string) { this.add(msg, 'success') },
    error(msg: string) { this.add(msg, 'error') },
    info(msg: string) { this.add(msg, 'info') },
    warning(msg: string) { this.add(msg, 'warning') },
  },
})
