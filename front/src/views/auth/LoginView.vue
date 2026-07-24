<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useBrandingStore } from '../../stores/branding'

const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const router = useRouter()
const route = useRoute()
const email = ref('admin@restaurant.com')
const password = ref('')
const errorMsg = ref('')

const branding = ref(brandingStore.publicBranding)

watch(() => brandingStore.publicBranding, (val) => {
  branding.value = val
  if (val?.branding) applyBranding(val.branding)
})

function applyBranding(config: { colorPrimario: string; colorSecundario: string; colorAcento: string; fontPrincipal: string }) {
  const root = document.documentElement
  root.style.setProperty('--bs-primary', config.colorPrimario)
  root.style.setProperty('--bs-primary-rgb', hexToRgb(config.colorPrimario))
  root.style.setProperty('--color-branding-primario', config.colorPrimario)
  root.style.setProperty('--color-branding-secundario', config.colorSecundario)
  root.style.setProperty('--color-branding-acento', config.colorAcento)
  if (config.fontPrincipal) {
    root.style.setProperty('--font-branding', config.fontPrincipal)
    document.body.style.fontFamily = config.fontPrincipal
  }
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

onMounted(() => {
  const slug = (route.query.tenant as string) || 'restaurante-principal'
  brandingStore.fetchPublicBranding(slug)
})

async function handleLogin() {
  errorMsg.value = ''
  const ok = await authStore.login(email.value, password.value)
  if (ok) {
    router.push('/')
  } else {
    errorMsg.value = authStore.error || 'Credenciales invalidas'
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4"
    :style="{ backgroundColor: branding?.branding?.colorSecundario || '' }"
    :class="{ 'dark:bg-gray-900': !branding?.branding?.colorSecundario }"
  >
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div v-if="branding?.branding" class="text-center mb-6">
        <img
          v-if="branding.branding.logo"
          :src="branding.branding.logo"
          :alt="branding.branding.nombreCompleto || 'Logo'"
          class="max-w-[160px] max-h-20 object-contain mx-auto mb-4"
        >
        <h3
          class="text-2xl font-semibold mb-4"
          :style="{ color: branding.branding.colorPrimario, fontFamily: branding.branding.fontPrincipal }"
        >
          {{ branding.branding.nombreCompleto || 'Iniciar Sesion' }}
        </h3>
      </div>
      <h3 v-else class="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">Iniciar Sesion</h3>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required autocomplete="email">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input v-model="password" type="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required autocomplete="current-password">
        </div>
        <p v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</p>
        <button
          type="submit"
          class="w-full py-2.5 px-4 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          :style="branding?.branding ? { backgroundColor: branding.branding.colorPrimario, borderColor: branding.branding.colorPrimario } : { backgroundColor: '#2563eb' }"
        >
          Ingresar
        </button>
      </form>
    </div>
  </div>
</template>
