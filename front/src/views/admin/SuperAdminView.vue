<script setup lang="ts">
import { onMounted } from 'vue'
import { useSuperAdminStore } from '../../stores/superAdmin'
import { useToastStore } from '../../stores/toast'
import type { TenantPlan, TenantEstado } from '../../types'

const store = useSuperAdminStore()
const toast = useToastStore()

onMounted(() => {
  store.fetchTenants()
})

async function cambiarPlan(tenantId: number, plan: TenantPlan) {
  try {
    const res = await store.cambiarPlan(tenantId, plan)
    toast.success(res.message || 'Plan actualizado')
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Error al cambiar plan')
  }
}

async function cambiarEstado(tenantId: number, estado: TenantEstado) {
  try {
    const res = await store.cambiarEstado(tenantId, estado)
    toast.success(res.message || 'Estado actualizado')
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Error al cambiar estado')
  }
}

function planBadge(plan: TenantPlan): string {
  const map: Record<TenantPlan, string> = {
    basico: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  }
  return map[plan]
}

function estadoBadge(estado: TenantEstado): string {
  const map: Record<TenantEstado, string> = {
    pendiente_aprobacion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    suspendido: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return map[estado]
}

function formatoFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function labelPlan(plan: TenantPlan): string {
  const map: Record<TenantPlan, string> = { basico: 'Básico', pro: 'Pro', enterprise: 'Enterprise' }
  return map[plan]
}

function labelEstado(estado: TenantEstado): string {
  const map: Record<TenantEstado, string> = { pendiente_aprobacion: 'Pendiente', activo: 'Activo', suspendido: 'Suspendido' }
  return map[estado]
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Super Admin — Tenants</h2>

    <div v-if="store.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Hoy</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
          <tr v-for="t in store.tenants" :key="t.id" class="hover:bg-gray-100 dark:hover:bg-gray-700/50">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ t.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ t.slug }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', planBadge(t.plan)]">{{ labelPlan(t.plan) }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', estadoBadge(t.estado)]">{{ labelEstado(t.estado) }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ t.usuariosCount }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ t.productosCount }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ t.ventasHoyCount }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ formatoFecha(t.createdAt) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm space-y-1">
              <div class="flex items-center gap-1">
                <label class="text-xs text-gray-500 dark:text-gray-400">Plan:</label>
                <select
                  :value="t.plan"
                  @change="cambiarPlan(t.id, ($event.target as HTMLSelectElement).value as TenantPlan)"
                  class="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-1 py-0.5 focus:ring-2 focus:ring-[var(--color-primario)]"
                >
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div class="flex items-center gap-1">
                <button
                  v-if="t.estado === 'pendiente_aprobacion'"
                  class="inline-flex items-center px-2 py-1 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded transition-colors"
                  @click="cambiarEstado(t.id, 'activo')"
                >Aprobar</button>
                <button
                  v-if="t.estado === 'activo'"
                  class="inline-flex items-center px-2 py-1 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors"
                  @click="cambiarEstado(t.id, 'suspendido')"
                >Suspender</button>
                <button
                  v-if="t.estado === 'suspendido'"
                  class="inline-flex items-center px-2 py-1 text-xs border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded transition-colors"
                  @click="cambiarEstado(t.id, 'activo')"
                >Activar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
