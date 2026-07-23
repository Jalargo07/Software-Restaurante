<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useUsuarioStore } from '../../stores/usuarios'
import { useToastStore } from '../../stores/toast'
import ModalBase from '../../components/common/ModalBase.vue'

const usuarioStore = useUsuarioStore()
const toast = useToastStore()
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

function rolBadge(rol: string) {
  const map: Record<string, string> = {
    admin: 'danger',
    mesero: 'primary',
    cajero: 'success',
    cocinero: 'warning',
  }
  return map[rol] || 'secondary'
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Usuarios</h2>
      <button class="btn btn-primary" @click="abrirCrear">+ Nuevo Usuario</button>
    </div>

    <div v-if="usuarioStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <table v-else class="table table-striped mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarioStore.usuarios" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td><span :class="`badge bg-${rolBadge(u.rol)}`">{{ u.rol }}</span></td>
          <td>
            <span :class="`badge bg-${u.activo ? 'success' : 'secondary'}`">
              {{ u.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" @click="abrirEditar(u)">Editar</button>
            <button class="btn btn-sm btn-outline-danger" @click="toggleActivo(u)">
              {{ u.activo ? 'Desactivar' : 'Activar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalBase v-if="modalAbierto" id="usuarioModal" :titulo="esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'" @cerrar="modalAbierto = false">
      <form @submit.prevent="guardar">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input v-model="form.nombre" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">{{ esEdicion ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}</label>
          <input v-model="form.password" type="password" class="form-control" :required="!esEdicion">
        </div>
        <div class="mb-3">
          <label class="form-label">Rol</label>
          <select v-model="form.rol" class="form-select">
            <option value="admin">Admin</option>
            <option value="mesero">Mesero</option>
            <option value="cajero">Cajero</option>
            <option value="cocinero">Cocinero</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          {{ guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear' }}
        </button>
      </form>
    </ModalBase>
  </div>
</template>
