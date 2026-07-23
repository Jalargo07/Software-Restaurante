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
  if (props.proveedor) {
    await store.updateProveedor(props.proveedor.id, form.value)
  } else {
    await store.createProveedor(form.value)
  }
  emit('guardado')
  emit('cerrar')
}
</script>

<template>
  <form @submit.prevent="guardar">
    <div class="mb-2">
      <label class="form-label">Nombre</label>
      <input v-model="form.nombre" class="form-control" required>
    </div>
    <div class="mb-2">
      <label class="form-label">Teléfono</label>
      <input v-model="form.telefono" class="form-control">
    </div>
    <div class="mb-2">
      <label class="form-label">Email</label>
      <input v-model="form.email" type="email" class="form-control">
    </div>
    <div class="mb-2">
      <label class="form-label">Dirección</label>
      <input v-model="form.direccion" class="form-control">
    </div>
    <button type="submit" class="btn btn-primary w-100 mt-2">{{ proveedor ? 'Actualizar' : 'Crear' }} Proveedor</button>
  </form>
</template>
