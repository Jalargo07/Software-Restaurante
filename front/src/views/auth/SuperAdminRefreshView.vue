<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-950">
    <div class="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">⏱️</div>
        <h3 class="text-2xl font-semibold text-white mb-2">Sesión expirada</h3>
        <p class="text-sm text-gray-400">Ingresá tu código de autenticación para renovar la sesión</p>
        <p class="text-xs text-gray-500 mt-1">Intento {{ authStore.refreshAttempts + 1 }} de 3</p>
      </div>
      <form @submit.prevent="handleVerify" class="space-y-6">
        <div class="flex justify-center gap-2">
          <input v-for="(_, i) in 6" :key="i"
            :ref="(el: any) => { if (el) inputRefs[i] = el }"
            :value="inputs[i]"
            @input="onInput(i, $event)"
            @keydown="onKeydown(i, $event)"
            @paste="onPaste"
            type="text" inputmode="numeric" maxlength="1"
            class="w-11 h-14 text-center text-xl font-bold rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
        </div>
        <p v-if="errorMsg" class="text-red-400 text-sm text-center">{{ errorMsg }}</p>
        <button type="submit" :disabled="getCode().length !== 6"
          class="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all">
          Renovar sesión
        </button>
      </form>
      <div class="mt-4 text-center">
        <button @click="authStore.logout(); router.push('/admin/login')" class="text-sm text-gray-500 hover:text-gray-300">← Volver al login</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSuperAdminAuthStore } from '../../stores/superAdminAuth'

const authStore = useSuperAdminAuthStore()
const router = useRouter()
const errorMsg = ref('')
const inputs = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

onMounted(() => {
  const token = localStorage.getItem('sa_token')
  if (!token) router.push('/admin/login')
  else setTimeout(() => inputRefs.value[0]?.focus(), 100)
})

function onInput(i: number, e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '').slice(0, 1)
  inputs.value[i] = val
  if (val && i < 5) inputRefs.value[i + 1]?.focus()
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !inputs.value[i] && i > 0) {
    inputs.value[i - 1] = ''
    inputRefs.value[i - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || ''
  if (!text) return
  e.preventDefault()
  for (let j = 0; j < 6; j++) inputs.value[j] = text[j] || ''
  inputRefs.value[Math.min(text.length, 5)]?.focus()
}

function getCode() { return inputs.value.join('') }

async function handleVerify() {
  const code = getCode()
  if (code.length !== 6) return
  errorMsg.value = ''
  const ok = await authStore.refresh2fa(code)
  if (ok) {
    const redirect = localStorage.getItem('sa_refresh_redirect') || '/super-admin'
    localStorage.removeItem('sa_refresh_redirect')
    router.push(redirect)
  } else {
    if (authStore.refreshAttempts >= 3) {
      errorMsg.value = 'Demasiados intentos. Redirigiendo al login...'
      setTimeout(() => router.push('/admin/login'), 1500)
    } else {
      errorMsg.value = authStore.error || 'Código inválido'
      inputs.value = ['', '', '', '', '', '']
      inputRefs.value[0]?.focus()
    }
  }
}
</script>
