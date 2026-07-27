<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '../../services/api'
import { useToastStore } from '../../stores/toast'
import type { ContactoMensaje } from '../../types'

const toast = useToastStore()
const mensajes = ref<ContactoMensaje[]>([])
const loading = ref(true)
const error = ref('')
const filtro = ref<'todos' | 'no_leidos'>('todos')
const pagina = ref(1)
const porPagina = 20

const mensajesFiltrados = computed(() => {
  let lista = mensajes.value
  if (filtro.value === 'no_leidos') lista = lista.filter(m => !m.leido)
  return lista
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(mensajesFiltrados.value.length / porPagina)))

const mensajesPaginados = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  return mensajesFiltrados.value.slice(inicio, inicio + porPagina)
})

function cambiarFiltro(f: 'todos' | 'no_leidos') {
  filtro.value = f
  pagina.value = 1
}

async function cargarMensajes() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/contacto')
    mensajes.value = res.data.data
  } catch {
    error.value = 'Error al cargar mensajes'
  } finally {
    loading.value = false
  }
}

async function marcarLeido(id: number) {
  try {
    await api.put('/contacto/' + id + '/leer')
    toast.success('Mensaje marcado como leído')
    await cargarMensajes()
  } catch {
    toast.error('Error al marcar como leído')
  }
}

function truncar(texto: string, max: number) {
  return texto.length > max ? texto.slice(0, max) + '...' : texto
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(cargarMensajes)
</script>

<template>
  <div class="px-4 py-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mensajes</h2>
    </div>

    <div class="flex gap-2 mb-4">
      <button @click="cambiarFiltro('todos')"
        class="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
        :class="filtro === 'todos' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'">
        Todos
      </button>
      <button @click="cambiarFiltro('no_leidos')"
        class="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
        :class="filtro === 'no_leidos' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'">
        No leídos
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-600 dark:text-red-400">{{ error }}</div>

    <div v-else-if="mensajesFiltrados.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
      No hay mensajes aún
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-12">Leído</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Fecha</th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="m in mensajesPaginados" :key="m.id" :class="!m.leido ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''">
            <td class="px-4 py-3 text-center">
              <span v-if="m.leido" class="text-green-600 dark:text-green-400 text-lg">&#10003;</span>
              <span v-else class="text-gray-400 dark:text-gray-600 text-lg">&#10007;</span>
            </td>
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ m.nombre }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ m.email }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
              <span :title="m.mensaje">{{ truncar(m.mensaje, 100) }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm hidden md:table-cell">{{ formatearFecha(m.createdAt) }}</td>
            <td class="px-4 py-3 text-center">
              <button v-if="!m.leido" @click="marcarLeido(m.id)"
                class="text-xs px-3 py-1.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors">
                Marcar como leído
              </button>
              <span v-else class="text-xs text-gray-400 dark:text-gray-500">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPaginas > 1" class="flex justify-center items-center gap-2 mt-4">
      <button @click="pagina = Math.max(1, pagina - 1)" :disabled="pagina === 1"
        class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-30 text-gray-700 dark:text-gray-300">
        Anterior
      </button>
      <span class="text-sm text-gray-600 dark:text-gray-400">Página {{ pagina }} de {{ totalPaginas }}</span>
      <button @click="pagina = Math.min(totalPaginas, pagina + 1)" :disabled="pagina === totalPaginas"
        class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-30 text-gray-700 dark:text-gray-300">
        Siguiente
      </button>
    </div>
  </div>
</template>
