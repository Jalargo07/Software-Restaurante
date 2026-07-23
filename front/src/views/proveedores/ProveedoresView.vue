<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useProveedorStore } from '../../stores/proveedores'
import { useToastStore } from '../../stores/toast'
import ModalBase from '../../components/common/ModalBase.vue'
import ProveedorFormModal from '../../components/proveedores/ProveedorFormModal.vue'
import ProveedorHistorialModal from '../../components/proveedores/ProveedorHistorialModal.vue'

const proveedorStore = useProveedorStore()
const toast = useToastStore()
const modalAbierto = ref(false)
const editando = ref<any>(null)
const historialProveedor = ref<{ id: number; nombre: string } | null>(null)
const paginaActual = ref(1)
const busqueda = ref('')

onMounted(() => {
  cargarProveedores()
})

function cargarProveedores() {
  proveedorStore.fetchProveedores(paginaActual.value, 10, busqueda.value || undefined)
}

watch(paginaActual, () => {
  cargarProveedores()
})

watch(busqueda, () => {
  paginaActual.value = 1
  cargarProveedores()
})

function abrirModal(proveedor?: any) {
  editando.value = proveedor ?? null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  editando.value = null
}

function abrirHistorial(proveedor: any) {
  historialProveedor.value = { id: proveedor.id, nombre: proveedor.nombre }
}

async function eliminar(id: number) {
  if (confirm('Desactivar este proveedor?')) {
    try {
      await proveedorStore.desactivarProveedor(id)
      toast.success('Proveedor desactivado')
      cargarProveedores()
    } catch {
      toast.error('Error al desactivar proveedor')
    }
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Proveedores</h2>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo Proveedor</button>
    </div>

    <div class="mt-3">
      <input type="text" class="form-control w-auto" v-model="busqueda" placeholder="Buscar por nombre...">
    </div>

    <div v-if="proveedorStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <template v-else>
      <table class="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in proveedorStore.proveedores" :key="p.id">
            <td>{{ p.nombre }}</td>
            <td>{{ p.telefono }}</td>
            <td>{{ p.email }}</td>
            <td>{{ p.direccion }}</td>
            <td>
              <span :class="p.activo ? 'badge bg-success' : 'badge bg-danger'">
                {{ p.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-info me-1" @click="abrirHistorial(p)">Historial</button>
              <button class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(p)">Editar</button>
              <button class="btn btn-sm btn-outline-danger" @click="eliminar(p.id)">X</button>
            </td>
          </tr>
          <tr v-if="proveedorStore.proveedores.length === 0">
            <td colspan="6" class="text-center text-muted py-3">No se encontraron proveedores</td>
          </tr>
        </tbody>
      </table>

      <div v-if="proveedorStore.paginas > 1" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted">Página {{ proveedorStore.pagina }} de {{ proveedorStore.paginas }}</span>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="paginaActual >= proveedorStore.paginas" @click="paginaActual++">
            Siguiente
          </button>
        </div>
      </div>
    </template>

    <ModalBase v-if="modalAbierto" id="proveedorModal" :titulo="editando ? 'Editar Proveedor' : 'Nuevo Proveedor'" @cerrar="cerrarModal">
      <ProveedorFormModal :proveedor="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="cargarProveedores()" />
    </ModalBase>

    <ModalBase v-if="historialProveedor" id="proveedorHistorialModal" :titulo="`Historial - ${historialProveedor.nombre}`" @cerrar="historialProveedor = null">
      <ProveedorHistorialModal :proveedor-id="historialProveedor.id" :proveedor-nombre="historialProveedor.nombre" @cerrar="historialProveedor = null" />
    </ModalBase>
  </div>
</template>
