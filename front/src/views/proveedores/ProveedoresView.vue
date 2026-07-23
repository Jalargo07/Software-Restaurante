<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProveedorStore } from '../../stores/proveedores'
import { useToastStore } from '../../stores/toast'
import ModalBase from '../../components/common/ModalBase.vue'
import ProveedorFormModal from '../../components/proveedores/ProveedorFormModal.vue'

const proveedorStore = useProveedorStore()
const toast = useToastStore()
const modalAbierto = ref(false)
const editando = ref<any>(null)

onMounted(() => {
  proveedorStore.fetchProveedores()
})

function abrirModal(proveedor?: any) {
  editando.value = proveedor ?? null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  editando.value = null
}

async function eliminar(id: number) {
  if (confirm('Desactivar este proveedor?')) {
    try {
      await proveedorStore.desactivarProveedor(id)
      toast.success('Proveedor desactivado')
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

    <div v-if="proveedorStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <table v-else class="table table-striped mt-3">
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
            <button class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(p)">Editar</button>
            <button class="btn btn-sm btn-outline-danger" @click="eliminar(p.id)">X</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalBase v-if="modalAbierto" id="proveedorModal" :titulo="editando ? 'Editar Proveedor' : 'Nuevo Proveedor'" @cerrar="cerrarModal">
      <ProveedorFormModal :proveedor="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="proveedorStore.fetchProveedores()" />
    </ModalBase>
  </div>
</template>
