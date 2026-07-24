<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMesaStore } from '../../stores/mesas'

const props = defineProps<{
  mesa?: any
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const mesaStore = useMesaStore()
const form = ref({ numero: 1, capacidad: 4, ubicacion: '', estado: 'disponible' })

watch(() => props.abierto, (val) => {
  if (val) {
    form.value = {
      numero: props.mesa?.numero ?? 1,
      capacidad: props.mesa?.capacidad ?? 4,
      ubicacion: props.mesa?.ubicacion ?? '',
      estado: props.mesa?.estado ?? 'disponible',
    }
  }
})

async function guardar() {
  if (props.mesa) {
    await mesaStore.updateMesa(props.mesa.id, form.value)
  } else {
    await mesaStore.createMesa(form.value)
  }
  emit('guardado')
  emit('cerrar')
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-3">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numero</label>
      <input v-model.number="form.numero" type="number" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" required min="1">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidad</label>
      <input v-model.number="form.capacidad" type="number" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" required min="1">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicacion</label>
      <input v-model="form.ubicacion" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500" placeholder="Interior, Terraza...">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
      <select v-model="form.estado" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
        <option value="disponible">Disponible</option>
        <option value="ocupada">Ocupada</option>
        <option value="reservada">Reservada</option>
        <option value="mantenimiento">Mantenimiento</option>
      </select>
    </div>
    <button type="submit" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors w-full">{{ mesa ? 'Actualizar' : 'Crear' }} Mesa</button>
  </form>
</template>
