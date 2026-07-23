<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRecetaStore } from '../../stores/recetas'
import { useToastStore } from '../../stores/toast'
import { useRoles } from '../../composables/useRoles'
import ModalBase from '../../components/common/ModalBase.vue'
import RecetaFormModal from '../../components/recetas/RecetaFormModal.vue'

const recetaStore = useRecetaStore()
const toast = useToastStore()
const { canCreate, canEdit, canDelete } = useRoles()
const modalAbierto = ref(false)
const editando = ref<any>(null)

onMounted(() => {
  recetaStore.fetchRecetas()
})

function abrirModal(receta?: any) {
  editando.value = receta ?? null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  editando.value = null
}

async function eliminar(id: number) {
  if (confirm('Eliminar esta receta?')) {
    try {
      await recetaStore.deleteReceta(id)
      toast.success('Receta eliminada')
    } catch {
      toast.error('Error al eliminar receta')
    }
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Recetas</h2>
      <button v-if="canCreate" class="btn btn-primary" @click="abrirModal()">+ Nueva Receta</button>
    </div>

    <div v-if="recetaStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <table v-else class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Producto Compuesto</th>
          <th>Nombre Receta</th>
          <th>Porciones</th>
          <th>Ingredientes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in recetaStore.recetas" :key="r.id">
          <td>{{ r.Producto?.nombre ?? '-' }}</td>
          <td>{{ r.nombre }}</td>
          <td>{{ r.porciones }}</td>
          <td>
            <ul class="mb-0 ps-3">
              <li v-for="d in r.DetalleRecetas" :key="d.id">
                {{ d.insumo?.nombre ?? 'Insumo #' + d.insumoId }}
                — {{ d.cantidad }} {{ d.unidad }}
                <span v-if="d.merma > 0" class="text-muted">(merma {{ d.merma }}%)</span>
              </li>
            </ul>
          </td>
          <td>
            <button v-if="canEdit" class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(r)">Editar</button>
            <button v-if="canDelete" class="btn btn-sm btn-outline-danger" @click="eliminar(r.id)">X</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!recetaStore.loading && recetaStore.recetas.length === 0" class="text-center text-muted mt-4">
      No hay recetas registradas
    </div>

    <ModalBase v-if="modalAbierto" id="recetaModal" :titulo="editando ? 'Editar Receta' : 'Nueva Receta'" @cerrar="cerrarModal">
      <RecetaFormModal :receta="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="recetaStore.fetchRecetas()" />
    </ModalBase>
  </div>
</template>
