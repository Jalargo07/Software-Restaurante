<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useSuperAdminAuthStore } from '../../stores/superAdminAuth'
import { useToastStore } from '../../stores/toast'
import QRCode from 'qrcode'
import api from '../../services/api'

const authStore = useSuperAdminAuthStore()
const toast = useToastStore()

const twofaEnabled = ref(false)
const loading = ref(true)
const setupStep = ref<'idle' | 'qr' | 'verify'>('idle')
const secret = ref('')
const otpauthUrl = ref('')
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const inputs = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

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

onMounted(async () => {
  try {
    const { data } = await api.get('/super-admin/me')
    twofaEnabled.value = data.usuario?.twoFactorEnabled || false
    if (authStore.user) authStore.user.twoFactorEnabled = twofaEnabled.value
  } catch { /* ignore */ }
  finally { loading.value = false }
})

async function iniciarSetup() {
  try {
    const data = await authStore.setup2fa()
    secret.value = data.secret
    otpauthUrl.value = data.otpauthUrl
    setupStep.value = 'qr'
    await nextTick()
    if (qrCanvas.value && otpauthUrl.value) {
      await QRCode.toCanvas(qrCanvas.value, otpauthUrl.value, { width: 200, margin: 2 })
    }
  } catch { toast.error('Error al generar 2FA') }
}

async function verificarCodigo() {
  const code = getCode()
  if (code.length !== 6) return
  try {
    await authStore.verify2fa(secret.value, code)
    twofaEnabled.value = true
    if (authStore.user) authStore.user.twoFactorEnabled = true
    localStorage.setItem('sa_user', JSON.stringify(authStore.user))
    setupStep.value = 'idle'
    toast.success('2FA activado exitosamente')
  } catch { toast.error('Código inválido') }
}

async function deshabilitar2fa() {
  if (!confirm('¿Deshabilitar 2FA? Esto reduce la seguridad de tu cuenta.')) return
  try {
    await authStore.disable2fa()
    twofaEnabled.value = false
    if (authStore.user) authStore.user.twoFactorEnabled = false
    localStorage.setItem('sa_user', JSON.stringify(authStore.user))
    toast.success('2FA deshabilitado')
  } catch { toast.error('Error al deshabilitar 2FA') }
}
</script>

<template>
  <div class="px-4 py-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Seguridad</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Autenticación en dos pasos</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Protegé tu cuenta con Google Authenticator</p>
        </div>
        <span v-if="twofaEnabled" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Activado</span>
        <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Desactivado</span>
      </div>

      <!-- Estado idle -->
      <div v-if="setupStep === 'idle'">
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {{ twofaEnabled ? 'Ya tenés 2FA activado. Cada vez que inicies sesión, necesitarás tu código de autenticación.' : 'Agregá una capa extra de seguridad a tu cuenta usando Google Authenticator o cualquier app compatible con TOTP.' }}
        </p>
        <button v-if="!twofaEnabled" @click="iniciarSetup"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
          Configurar 2FA
        </button>
        <button v-else @click="deshabilitar2fa"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
          Deshabilitar 2FA
        </button>
      </div>

      <!-- Paso QR -->
      <div v-if="setupStep === 'qr'" class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Escané este código QR con tu app de autenticación</p>
        <div class="bg-white p-3 rounded-xl inline-block shadow-sm mb-4">
          <canvas ref="qrCanvas" class="w-48 h-48"></canvas>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">O ingresá manualmente esta clave secreta:</p>
        <code class="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 break-all">{{ secret }}</code>
        <div class="mt-4">
          <button @click="setupStep = 'verify'" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">Ya escaneé el código</button>
        </div>
      </div>

      <!-- Paso verificar -->
      <div v-if="setupStep === 'verify'">
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">Ingresá el código de 6 dígitos que aparece en tu app</p>
        <div class="flex justify-center gap-2 mb-4">
          <input v-for="(_, i) in 6" :key="i"
            :ref="(el: any) => { if (el) inputRefs[i] = el }"
            :value="inputs[i]"
            @input="onInput(i, $event)"
            @keydown="onKeydown(i, $event)"
            @paste="onPaste"
            type="text" inputmode="numeric" maxlength="1"
            class="w-11 h-14 text-center text-xl font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
        </div>
        <button @click="verificarCodigo" :disabled="getCode().length !== 6"
          class="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all">
          Verificar y activar
        </button>
      </div>
    </div>
  </div>
</template>
