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
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
    <div class="login-card card shadow-sm">
      <div class="card-body p-4">
        <div v-if="branding?.branding" class="text-center mb-3">
          <img
            v-if="branding.branding.logo"
            :src="branding.branding.logo"
            :alt="branding.branding.nombreCompleto || 'Logo'"
            class="login-logo mb-3"
          >
          <h3 class="login-title" :style="{ color: branding.branding.colorPrimario, fontFamily: branding.branding.fontPrincipal }">
            {{ branding.branding.nombreCompleto || 'Iniciar Sesion' }}
          </h3>
        </div>
        <h3 v-else class="card-title text-center mb-4">Iniciar Sesion</h3>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-control" required autocomplete="email">
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" required autocomplete="current-password">
          </div>
          <p v-if="errorMsg" class="text-danger text-center">{{ errorMsg }}</p>
          <button
            type="submit"
            class="btn w-100"
            :style="branding?.branding ? { backgroundColor: branding.branding.colorPrimario, borderColor: branding.branding.colorPrimario, color: '#fff' } : {}"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background-color: var(--color-branding-secundario, #f5f5f5);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-logo {
  max-width: 160px;
  max-height: 80px;
  object-fit: contain;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
