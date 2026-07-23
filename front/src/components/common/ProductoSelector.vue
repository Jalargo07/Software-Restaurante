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
    <input v-model="busqueda" class="form-control mb-2" placeholder="Buscar producto...">
    <div style="max-height: 200px; overflow-y: auto;">
      <button
        v-for="p in filtrados" :key="p.id"
        class="btn btn-outline-secondary btn-sm d-block w-100 mb-1 text-start"
        @click="emit('seleccionar', p)"
      >
        {{ p.nombre }} - ${{ p.precioCompra }} ({{ p.stock }} {{ p.unidad }})
      </button>
      <p v-if="!filtrados.length" class="text-muted small">Sin resultados</p>
    </div>
  </div>
</template>

