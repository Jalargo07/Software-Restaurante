<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useBrandingStore } from '../../stores/branding'
import api from '../../services/api'

interface TenantOption {
  id: number
  nombre: string
  slug: string
  logo: string | null
}

const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const router = useRouter()
const route = useRoute()
const email = ref('admin@restaurant.com')
const password = ref('')
const errorMsg = ref('')
const tenants = ref<TenantOption[]>([])
const selectedTenant = ref<TenantOption | null>(null)
const loadingTenants = ref(true)

const branding = ref(brandingStore.publicBranding)

const hasSlugInRoute = computed(() => !!route.params.slug)

watch(() => brandingStore.publicBranding, (val) => {
  branding.value = val
  if (val?.branding) applyBranding(val.branding)
})

function applyBranding(config: { colorPrimario: string; colorSecundario: string; colorAcento: string; fontPrincipal: string }) {
  const root = document.documentElement
  root.style.setProperty('--color-branding-primario', config.colorPrimario)
  root.style.setProperty('--color-branding-secundario', config.colorSecundario)
  root.style.setProperty('--color-branding-acento', config.colorAcento)
  if (config.fontPrincipal) {
    root.style.setProperty('--font-branding', config.fontPrincipal)
    document.body.style.fontFamily = config.fontPrincipal
  }
}

async function loadTenants() {
  try {
    loadingTenants.value = true
    const { data } = await api.get('/public/branding/tenants')
    tenants.value = data
    if (data.length > 0) {
      const slugFromRoute = route.params.slug as string
      const slugFromQuery = route.query.tenant as string
      const slug = slugFromRoute || slugFromQuery

      if (slug) {
        const found = data.find((t: TenantOption) => t.slug === slug)
        if (found) {
          selectedTenant.value = found
          brandingStore.fetchPublicBranding(found.slug)
        }
      } else if (data.length === 1) {
        selectedTenant.value = data[0]
        brandingStore.fetchPublicBranding(data[0].slug)
      }
    }
  } catch (error) {
    console.error('Error cargando tenants:', error)
  } finally {
    loadingTenants.value = false
  }
}

function onTenantSelected(tenant: TenantOption) {
  selectedTenant.value = tenant
  brandingStore.fetchPublicBranding(tenant.slug)
}

onMounted(() => {
  loadTenants()
})

onUnmounted(() => {
  document.documentElement.style.removeProperty('--color-primario')
  document.documentElement.style.removeProperty('--color-secundario')
  document.documentElement.style.removeProperty('--color-acento')
  document.documentElement.style.removeProperty('--color-branding-primario')
  document.documentElement.style.removeProperty('--color-branding-secundario')
  document.documentElement.style.removeProperty('--color-branding-acento')
  document.documentElement.style.removeProperty('--font-branding')
  document.body.style.fontFamily = ''
})

async function handleLogin() {
  errorMsg.value = ''
  if (!selectedTenant.value && !hasSlugInRoute.value) {
    errorMsg.value = 'Por favor selecciona un restaurante'
    return
  }
  const ok = await authStore.login(email.value, password.value)
  if (ok) {
    router.push('/dashboard')
  } else {
    errorMsg.value = authStore.error || 'Credenciales inválidas'
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 py-8"
    :style="{ backgroundColor: branding?.branding?.colorSecundario || '' }"
    :class="{ 'bg-gray-100': !branding?.branding?.colorSecundario }"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
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
          {{ branding.branding.nombreCompleto || 'Iniciar Sesión' }}
        </h3>
      </div>
      <h3 v-else class="text-xl font-bold text-center text-gray-900 mb-6">Iniciar Sesión</h3>

      <div v-if="!hasSlugInRoute" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Restaurante</label>
        <div v-if="loadingTenants" class="flex justify-center py-4">
          <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
        <div v-else-if="tenants.length === 0" class="text-center py-4 text-gray-500 text-sm">
          No hay restaurantes disponibles
        </div>
        <div v-else class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          <button
            v-for="tenant in tenants"
            :key="tenant.id"
            type="button"
            @click="onTenantSelected(tenant)"
            class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
            :class="selectedTenant?.id === tenant.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
          >
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="tenant.logo" :src="tenant.logo" :alt="tenant.nombre" class="w-full h-full object-cover">
              <span v-else class="text-lg font-bold text-gray-400">{{ tenant.nombre.charAt(0) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ tenant.nombre }}</div>
              <div class="text-xs text-gray-500 truncate">{{ tenant.slug }}</div>
            </div>
            <svg v-if="selectedTenant?.id === tenant.id" class="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required autocomplete="email">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" type="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" required autocomplete="current-password">
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

      <div class="mt-4 text-center">
        <RouterLink to="/" class="text-sm text-gray-500 hover:text-gray-700">
          ← Volver al inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>
