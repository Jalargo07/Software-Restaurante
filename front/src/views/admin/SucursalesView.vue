<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSucursalStore } from '../../stores/sucursales'
import { useToastStore } from '../../stores/toast'

const store = useSucursalStore()
const toast = useToastStore()
const editando = ref<any>(null)
const form = ref({ nombre: '', direccion: '', telefono: '' })

onMounted(() => store.fetchSucursales())

function abrirModal(s?: any) {
  editando.value = s || null
  form.value = s ? { nombre: s.nombre, direccion: s.direccion || '', telefono: s.telefono || '' } : { nombre: '', direccion: '', telefono: '' }
}

async function guardar() {
  if (!form.value.nombre) return
  try {
    if (editando.value) {
      await store.actualizar(editando.value.id, form.value)
      toast.success('Sucursal actualizada')
    } else {
      await store.crear(form.value)
      toast.success('Sucursal creada')
    }
    editando.value = undefined
  } catch { toast.error('Error al guardar') }
}

async function eliminar(id: number) {
  if (!confirm('¿Desactivar esta sucursal?')) return
  try {
    await store.eliminar(id)
    toast.success('Sucursal desactivada')
  } catch { toast.error('Error al eliminar') }
}
</script>

<template>
  <div class="px-4 py-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sucursales</h2>
      <button @click="abrirModal()" class="px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors">+ Nueva Sucursal</button>
    </div>

    <div v-if="store.loading" class="flex justify-center py-8"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" /></div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Dirección</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Teléfono</th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="s in store.sucursales" :key="s.id">
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ s.nombre }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{{ s.direccion || '—' }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{{ s.telefono || '—' }}</td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium" :class="s.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ s.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button @click="abrirModal(s)" class="text-xs px-3 py-1.5 border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors mr-1">Editar</button>
              <button v-if="s.activo" @click="eliminar(s.id)" class="text-xs px-3 py-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors">X</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="editando !== undefined" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="editando = undefined">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ editando ? 'Editar Sucursal' : 'Nueva Sucursal' }}</h3>
        <form @submit.prevent="guardar" class="space-y-3">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label><input v-model="form.nombre" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label><input v-model="form.direccion" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label><input v-model="form.telefono" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" @click="editando = undefined" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm rounded-lg">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
