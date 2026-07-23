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
  proveedores.value = data
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
    <input v-model="busqueda" class="form-control mb-2" placeholder="Buscar proveedor...">
    <div style="max-height: 200px; overflow-y: auto;">
      <button
        v-for="p in filtrados" :key="p.id"
        class="btn btn-outline-secondary btn-sm d-block w-100 mb-1 text-start"
        @click="emit('seleccionar', p)"
      >
        {{ p.nombre }} - {{ p.telefono || 'Sin teléfono' }}
      </button>
      <p v-if="!filtrados.length" class="text-muted small">Sin resultados</p>
    </div>
  </div>
</template>
