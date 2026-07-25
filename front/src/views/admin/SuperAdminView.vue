<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSuperAdminStore } from '../../stores/superAdmin'
import { useToastStore } from '../../stores/toast'
import type { TenantPlan, TenantEstado } from '../../types'

const superAdminStore = useSuperAdminStore()
const toast = useToastStore()

onMounted(() => {
  superAdminStore.fetchTenants()
  superAdminStore.fetchStats()
})

const badgePlan = (plan: TenantPlan) => {
  const map = { basico: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200', pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200', enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' }
  return map[plan]
}

const badgeEstado = (estado: TenantEstado) => {
  const map = { pendiente_aprobacion: 'bg-yellow-100 text-yellow-700', activo: 'bg-green-100 text-green-700', suspendido: 'bg-red-100 text-red-700' }
  return map[estado]
}

const labelEstado = (estado: TenantEstado) => {
  const map = { pendiente_aprobacion: 'Pendiente', activo: 'Activo', suspendido: 'Suspendido' }
  return map[estado] || estado
}

const labelPlan = (plan: TenantPlan) => {
  const map = { basico: 'Básico', pro: 'Pro', enterprise: 'Enterprise' }
  return map[plan] || plan
}

async function handleCambiarEstado(id: number, estado: TenantEstado) {
  try {
    await superAdminStore.cambiarEstado(id, estado)
    toast.success(`Estado actualizado a ${labelEstado(estado)}`)
    await superAdminStore.fetchStats()
  } catch { toast.error('Error al cambiar estado') }
}

async function handleCambiarPlan(id: number, plan: TenantPlan) {
  try {
    await superAdminStore.cambiarPlan(id, plan)
    toast.success(`Plan actualizado a ${labelPlan(plan)}`)
    await superAdminStore.fetchStats()
  } catch { toast.error('Error al cambiar plan') }
}

function formatPrecio(n: number) {
  return '$' + n.toLocaleString('es-CL')
}
</script>

<template>
  <div class="px-4 py-6 max-w-7xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Super Admin — Dashboard</h2>

    <!-- Stats Cards -->
    <div v-if="superAdminStore.stats" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ superAdminStore.stats.total }}</p>
        <p class="text-xs text-gray-500">Total Tenants</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ superAdminStore.stats.activos }}</p>
        <p class="text-xs text-gray-500">Activos</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ superAdminStore.stats.pendientes }}</p>
        <p class="text-xs text-gray-500">Pendientes</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ superAdminStore.stats.suspendidos }}</p>
        <p class="text-xs text-gray-500">Suspendidos</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center col-span-2 md:col-span-1">
        <p class="text-2xl font-bold text-[var(--color-primario)]">{{ formatPrecio(superAdminStore.stats.ingresosEstimados) }}</p>
        <p class="text-xs text-gray-500">Ingresos Est./mes</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2 mb-4">
      <select v-model="superAdminStore.filtroPlan" @change="superAdminStore.fetchTenants()"
        class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
        <option value="">Todos los planes</option>
        <option value="basico">Básico</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <select v-model="superAdminStore.filtroEstado" @change="superAdminStore.fetchTenants()"
        class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
        <option value="">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="suspendido">Suspendido</option>
        <option value="pendiente_aprobacion">Pendiente</option>
      </select>
    </div>

    <!-- Tabla -->
    <div v-if="superAdminStore.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nombre</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Slug</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Plan</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Estado</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Usuarios</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Productos</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Ventas Hoy</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="t in superAdminStore.tenants" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ t.nombre }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{{ t.slug }}</td>
              <td class="px-4 py-3">
                <select :value="t.plan" @change="handleCambiarPlan(t.id, ($event.target as HTMLSelectElement).value as TenantPlan)"
                  class="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="badgeEstado(t.estado)">{{ labelEstado(t.estado) }}</span>
              </td>
              <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">{{ t.usuariosCount }}</td>
              <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">{{ t.productosCount }}</td>
              <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300 hidden md:table-cell">{{ t.ventasHoyCount }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex gap-1 justify-center">
                  <button v-if="t.estado !== 'activo'" @click="handleCambiarEstado(t.id, 'activo')" class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">Activar</button>
                  <button v-if="t.estado === 'activo'" @click="handleCambiarEstado(t.id, 'suspendido')" class="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">Suspender</button>
                  <button v-if="t.estado === 'pendiente_aprobacion'" @click="handleCambiarEstado(t.id, 'activo')" class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Aprobar</button>
                </div>
              </td>
            </tr>
            <tr v-if="superAdminStore.tenants.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No hay tenants registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
