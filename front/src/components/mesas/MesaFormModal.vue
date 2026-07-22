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
      <label class="form-label">Numero</label>
      <input v-model.number="form.numero" type="number" class="form-control" required min="1">
    </div>
    <div class="mb-3">
      <label class="form-label">Capacidad</label>
      <input v-model.number="form.capacidad" type="number" class="form-control" required min="1">
    </div>
    <div class="mb-3">
      <label class="form-label">Ubicacion</label>
      <input v-model="form.ubicacion" class="form-control" placeholder="Interior, Terraza...">
    </div>
    <div class="mb-3">
      <label class="form-label">Estado</label>
      <select v-model="form.estado" class="form-select">
        <option value="disponible">Disponible</option>
        <option value="ocupada">Ocupada</option>
        <option value="reservada">Reservada</option>
        <option value="mantenimiento">Mantenimiento</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary w-100">{{ mesa ? 'Actualizar' : 'Crear' }} Mesa</button>
  </form>
</template>
