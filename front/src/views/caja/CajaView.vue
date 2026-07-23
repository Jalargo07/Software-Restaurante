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
    { label: 'Ventas totales', value: `$${r.ventasTotales ?? 0}`, color: 'primary' },
    { label: 'Efectivo', value: `$${r.efectivo ?? 0}`, color: 'success' },
    { label: 'Tarjeta', value: `$${r.tarjeta ?? 0}`, color: 'info' },
    { label: 'Transferencia', value: `$${r.transferencia ?? 0}`, color: 'warning' },
    { label: 'Canceladas', value: `$${r.canceladas ?? 0}`, color: 'danger' },
    { label: '# Ventas', value: r.numeroVentas ?? 0, color: 'secondary' },
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
  <div class="container mt-4">
    <h2 class="mb-3">Caja</h2>

    <div class="row g-3 mb-4">
      <div class="col-auto">
        <label class="form-label">Fecha</label>
        <input type="date" class="form-control" v-model="fechaSeleccionada" @change="cambiarFecha" />
      </div>
      <div class="col-auto d-flex align-items-end">
        <button class="btn btn-danger" @click="modalConfirmar = true" :disabled="corteStore.loading">
          Cerrar Caja
        </button>
      </div>
    </div>

    <div v-if="corteStore.loading" class="text-center my-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <template v-else>
      <div class="row g-3 mb-4">
        <div v-for="stat in stats" :key="stat.label" class="col-md-4 col-lg-2">
          <div class="card text-center h-100">
            <div class="card-body">
              <div class="text-muted small">{{ stat.label }}</div>
              <div :class="`fw-bold fs-5 text-${stat.color}`">{{ stat.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <h5 class="mt-4">Historial de Cortes</h5>
      <table class="table table-striped mt-2">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Total Ventas</th>
            <th>Efectivo</th>
            <th>Tarjeta</th>
            <th>Transferencia</th>
            <th>Canceladas</th>
            <th># Ventas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in corteStore.cortes" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.fecha }}</td>
            <td>${{ c.ventasTotales ?? 0 }}</td>
            <td>${{ c.efectivo ?? 0 }}</td>
            <td>${{ c.tarjeta ?? 0 }}</td>
            <td>${{ c.transferencia ?? 0 }}</td>
            <td>${{ c.canceladas ?? 0 }}</td>
            <td>{{ c.numeroVentas ?? 0 }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <ModalBase v-if="modalConfirmar" id="confirmarCerrar" titulo="Confirmar cierre de caja" @cerrar="modalConfirmar = false">
      <p>¿Seguro que deseas cerrar la caja del día <strong>{{ fechaSeleccionada }}</strong>?</p>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" @click="modalConfirmar = false">Cancelar</button>
        <button class="btn btn-danger" @click="cerrarCaja">Confirmar cierre</button>
      </div>
    </ModalBase>
  </div>
</template>
