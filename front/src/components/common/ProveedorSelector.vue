<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

const emit = defineEmits<{
  seleccionar: [proveedor: any]
}>()

const proveedores = ref<any[]>([])
const busqueda = ref('')

onMounted(async () => {
  const { data } = await api.get('/proveedores')
  proveedores.value = data.data
})

const filtrados = computed(() => {
  if (!busqueda.value) return proveedores.value
  const q = busqueda.value.toLowerCase()
  return proveedores.value.filter((p: any) =>
    p.nombre.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div>
    <input v-model="busqueda" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" placeholder="Buscar proveedor...">
    <div class="max-h-[200px] overflow-y-auto">
      <button
        v-for="p in filtrados" :key="p.id"
        class="w-full text-left px-3 py-2 mb-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        @click="emit('seleccionar', p)"
      >
        {{ p.nombre }} - {{ p.telefono || 'Sin teléfono' }}
      </button>
      <p v-if="!filtrados.length" class="text-gray-400 text-xs">Sin resultados</p>
    </div>
  </div>
</template>
