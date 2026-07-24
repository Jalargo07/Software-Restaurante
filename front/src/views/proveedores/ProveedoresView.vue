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
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Proveedores</h2>
      <button class="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors" @click="abrirModal()">+ Nuevo Proveedor</button>
    </div>

    <div class="mt-3">
      <input type="text" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500 w-auto" v-model="busqueda" placeholder="Buscar por nombre...">
    </div>

    <div v-if="proveedorStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <template v-else>
      <div class="overflow-x-auto mt-3">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="p in proveedorStore.proveedores" :key="p.id">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ p.nombre }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ p.telefono }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ p.email }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ p.direccion }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span :class="p.activo ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                  {{ p.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors mr-1" @click="abrirHistorial(p)">Historial</button>
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors mr-1" @click="abrirModal(p)">Editar</button>
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" @click="eliminar(p.id)">X</button>
              </td>
            </tr>
            <tr v-if="proveedorStore.proveedores.length === 0">
              <td colspan="6" class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No se encontraron proveedores</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="proveedorStore.paginas > 1" class="flex items-center justify-between mt-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">Página {{ proveedorStore.pagina }} de {{ proveedorStore.paginas }}</span>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button class="px-3 py-1.5 text-xs border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual <= 1" @click="paginaActual--">
            Anterior
          </button>
          <button class="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" :disabled="paginaActual >= proveedorStore.paginas" @click="paginaActual++">
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
