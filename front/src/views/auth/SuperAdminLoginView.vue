<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSuperAdminAuthStore } from '../../stores/superAdminAuth'

const authStore = useSuperAdminAuthStore()
const router = useRouter()
const email = ref('super@biteops.app')
const password = ref('')
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  const ok = await authStore.login(email.value, password.value)
  if (ok) router.push('/super-admin')
  else errorMsg.value = authStore.error || 'Credenciales inválidas'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-950">
    <div class="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔐</div>
        <h3 class="text-2xl font-semibold text-white mb-2">Panel Super Admin</h3>
        <p class="text-sm text-gray-400">Acceso restringido</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" required autocomplete="email">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
          <input v-model="password" type="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" required autocomplete="current-password">
        </div>
        <p v-if="errorMsg" class="text-red-400 text-sm text-center">{{ errorMsg }}</p>
        <button type="submit" class="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all">Ingresar</button>
      </form>
      <div class="mt-4 text-center">
        <RouterLink to="/" class="text-sm text-gray-500 hover:text-gray-300">← Volver al inicio</RouterLink>
      </div>
    </div>
  </div>
</template>
