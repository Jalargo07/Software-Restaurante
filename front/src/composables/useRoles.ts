import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useRoles() {
  const authStore = useAuthStore()

  const userRole = computed(() => authStore.user?.rol || '')

  const isAdmin = computed(() => authStore.isAdmin)
  const isMesero = computed(() => authStore.isMesero)
  const isCajero = computed(() => authStore.isCajero)
  const isCocinero = computed(() => authStore.isCocinero)

  const canCreate = computed(() => authStore.isAdmin)
  const canEdit = computed(() => authStore.isAdmin)
  const canDelete = computed(() => authStore.isAdmin)

  function canAccess(roles: string[]) {
    return authStore.user ? roles.includes(authStore.user.rol) : false
  }

  return {
    userRole,
    isAdmin,
    isMesero,
    isCajero,
    isCocinero,
    canCreate,
    canEdit,
    canDelete,
    canAccess,
  }
}
