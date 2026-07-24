<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProveedorStore } from '../../stores/proveedores'

const props = defineProps<{
  proveedor?: any
  abierto: boolean
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const store = useProveedorStore()
const guardando = ref(false)
const form = ref({
  nombre: '', telefono: '', email: '', direccion: '',
})

watch(() => props.abierto, (val) => {
  if (val && props.proveedor) {
    form.value = { ...props.proveedor }
  } else if (val) {
    form.value = {
      nombre: '', telefono: '', email: '', direccion: '',
    }
  }
})

async function guardar() {
  guardando.value = true
  try {
    if (props.proveedor) {
      await store.updateProveedor(props.proveedor.id, form.value)
    } else {
      await store.createProveedor(form.value)
    }
    emit('guardado')
    emit('cerrar')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
      <input v-model="form.nombre" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
      <input v-model="form.telefono" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
      <input v-model="form.email" type="email" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
    </div>
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
      <input v-model="form.direccion" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
    </div>
    <button type="submit" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full mt-2" :disabled="guardando">
      <span v-if="guardando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
      {{ guardando ? 'Guardando...' : (proveedor ? 'Actualizar' : 'Crear') + ' Proveedor' }}
    </button>
  </form>
</template>
