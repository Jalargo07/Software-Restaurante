<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCorteStore } from '../../stores/cortes'
import { useToastStore } from '../../stores/toast'
import ModalBase from '../../components/common/ModalBase.vue'

const corteStore = useCorteStore()
const toast = useToastStore()

const hoy = new Date().toISOString().split('T')[0]
const fechaSeleccionada = ref(hoy)
const modalConfirmar = ref(false)

const stats = computed(() => {
  const r = corteStore.resumen
  if (!r) return []
  return [
    { label: 'Ventas totales', value: `$${r.totalGeneral ?? 0}`, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Efectivo', value: `$${r.totalEfectivo ?? 0}`, color: 'text-green-600 dark:text-green-400' },
    { label: 'Tarjeta', value: `$${r.totalTarjeta ?? 0}`, color: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Transferencia', value: `$${r.totalTransferencia ?? 0}`, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Canceladas', value: `$${r.montoCanceladas ?? 0}`, color: 'text-red-600 dark:text-red-400' },
    { label: '# Ventas', value: r.cantidadVentas ?? 0, color: 'text-gray-600 dark:text-gray-400' },
  ]
})

onMounted(() => {
  cargarDatos()
})

function cargarDatos() {
  corteStore.fetchResumen(fechaSeleccionada.value)
  corteStore.fetchCortes()
}

function cambiarFecha() {
  corteStore.fetchResumen(fechaSeleccionada.value)
}

async function cerrarCaja() {
  try {
    await corteStore.cerrarCaja(fechaSeleccionada.value)
    toast.success('Caja cerrada exitosamente')
    modalConfirmar.value = false
    cargarDatos()
  } catch {
    toast.error('Error al cerrar la caja')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Caja</h2>

    <div class="flex flex-wrap items-end gap-3 mt-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
        <input type="date" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" v-model="fechaSeleccionada" @change="cambiarFecha" />
      </div>
      <div>
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="modalConfirmar = true" :disabled="corteStore.loading">
          Cerrar Caja
        </button>
      </div>
    </div>

    <div v-if="corteStore.loading" class="text-center my-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600"></span>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        <div v-for="stat in stats" :key="stat.label" class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</div>
          <div :class="['text-lg font-bold', stat.color]">{{ stat.value }}</div>
        </div>
      </div>

      <h5 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6">Historial de Cortes</h5>
      <div class="overflow-x-auto mt-2">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ventas</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efectivo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarjeta</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transferencia</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canceladas</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Ventas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="c in corteStore.cortes" :key="c.id" class="hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ c.id }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ c.fecha }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ c.totalGeneral ?? 0 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ c.totalEfectivo ?? 0 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ c.totalTarjeta ?? 0 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ c.totalTransferencia ?? 0 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ c.montoCanceladas ?? 0 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ c.cantidadVentas ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <ModalBase v-if="modalConfirmar" id="confirmarCerrar" titulo="Confirmar cierre de caja" @cerrar="modalConfirmar = false">
      <p class="text-gray-700 dark:text-gray-300">¿Seguro que deseas cerrar la caja del día <strong>{{ fechaSeleccionada }}</strong>?</p>
      <div class="flex justify-end gap-2 mt-4">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="modalConfirmar = false">Cancelar</button>
        <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="cerrarCaja">Confirmar cierre</button>
      </div>
    </ModalBase>
  </div>
</template>
