<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useUsuarioStore } from '../../stores/usuarios'
import { useToastStore } from '../../stores/toast'
import { useRoles } from '../../composables/useRoles'
import ModalBase from '../../components/common/ModalBase.vue'

const usuarioStore = useUsuarioStore()
const toast = useToastStore()
const { canCreate, canEdit, canDelete } = useRoles()
const modalAbierto = ref(false)
const usuarioEditando = ref<any>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'mesero',
})

const esEdicion = computed(() => !!usuarioEditando.value)

onMounted(() => {
  usuarioStore.fetchUsuarios()
})

function abrirCrear() {
  usuarioEditando.value = null
  form.value = { nombre: '', email: '', password: '', rol: 'mesero' }
  modalAbierto.value = true
}

function abrirEditar(usuario: any) {
  usuarioEditando.value = usuario
  form.value = {
    nombre: usuario.nombre,
    email: usuario.email,
    password: '',
    rol: usuario.rol,
  }
  modalAbierto.value = true
}

async function guardar() {
  guardando.value = true
  try {
    if (esEdicion.value) {
      const datos: any = {
        nombre: form.value.nombre,
        email: form.value.email,
        rol: form.value.rol,
      }
      if (form.value.password) datos.password = form.value.password
      await usuarioStore.updateUsuario(usuarioEditando.value.id, datos)
      toast.success('Usuario actualizado')
    } else {
      await usuarioStore.createUsuario(form.value)
      toast.success('Usuario creado')
    }
    modalAbierto.value = false
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Error al guardar usuario')
  } finally {
    guardando.value = false
  }
}

async function toggleActivo(usuario: any) {
  try {
    if (usuario.activo) {
      await usuarioStore.deleteUsuario(usuario.id)
      toast.success('Usuario desactivado')
    } else {
      await usuarioStore.updateUsuario(usuario.id, { activo: true } as any)
      toast.success('Usuario activado')
    }
  } catch {
    toast.error('Error al cambiar estado')
  }
}

function rolBadgeClasses(rol: string): string {
  const map: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    mesero: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cajero: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cocinero: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[rol] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Usuarios</h2>
      <button v-if="canCreate" class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="abrirCrear">+ Nuevo Usuario</button>
    </div>

    <div v-if="usuarioStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-blue-600"></span>
    </div>

    <div v-else class="overflow-x-auto mt-3">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 [&_tr:nth-child(odd)]:bg-gray-50 dark:[&_tr:nth-child(odd)]:bg-gray-800/50">
            <tr v-for="u in usuarioStore.usuarios" :key="u.id" class="hover:bg-gray-100 dark:hover:bg-gray-700/50">
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ u.id }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ u.nombre }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ u.email }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', rolBadgeClasses(u.rol)]">{{ u.rol }}</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', u.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200']">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <button v-if="canEdit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none mr-1" @click="abrirEditar(u)">Editar</button>
              <button v-if="canDelete" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" @click="toggleActivo(u)">
                {{ u.activo ? 'Desactivar' : 'Activar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalBase v-if="modalAbierto" id="usuarioModal" :titulo="esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'" @cerrar="modalAbierto = false">
      <form @submit.prevent="guardar">
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
          <input v-model="form.nombre" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ esEdicion ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}</label>
          <input v-model="form.password" type="password" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :required="!esEdicion">
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
          <select v-model="form.rol" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="admin">Admin</option>
            <option value="mesero">Mesero</option>
            <option value="cajero">Cajero</option>
            <option value="cocinero">Cocinero</option>
          </select>
        </div>
        <button type="submit" class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none" :disabled="guardando">
          <span v-if="guardando" class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
          {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear' }}
        </button>
      </form>
    </ModalBase>
  </div>
</template>
