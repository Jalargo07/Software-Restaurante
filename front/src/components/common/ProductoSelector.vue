<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

const props = withDefaults(defineProps<{
  soloVentas?: boolean
}>(), {
  soloVentas: false
})

const emit = defineEmits<{
  seleccionar: [producto: any]
}>()

const productos = ref<any[]>([])
const busqueda = ref('')

onMounted(async () => {
  const { data } = await api.get('/productos')
  productos.value = data
})

const filtrados = computed(() => {
  let resultado = productos.value
  if (props.soloVentas) {
    resultado = resultado.filter((p: any) => p.tipo !== 'insumo')
  }
  if (!busqueda.value) return resultado
  const q = busqueda.value.toLowerCase()
  return resultado.filter((p: any) =>
    p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div>
    <input v-model="busqueda" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" placeholder="Buscar producto...">
    <div class="max-h-[200px] overflow-y-auto">
      <button
        v-for="p in filtrados" :key="p.id"
        class="w-full text-left px-3 py-2 mb-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        @click="emit('seleccionar', p)"
      >
        {{ p.nombre }} - ${{ p.precioCompra }} ({{ p.stock }} {{ p.unidad }})<span v-if="p.merma > 0" class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">merma {{ p.merma }}%</span>
      </button>
      <p v-if="!filtrados.length" class="text-gray-400 text-xs">Sin resultados</p>
    </div>
  </div>
</template>

