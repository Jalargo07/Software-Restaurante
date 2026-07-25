<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSuperAdminAuthStore } from '../../stores/superAdminAuth'

const authStore = useSuperAdminAuthStore()
const router = useRouter()
const code = ref('')
const errorMsg = ref('')

if (!authStore.tempToken) {
  router.push('/admin/login')
}

async function handleVerify() {
  if (code.value.length !== 6) return
  errorMsg.value = ''
  const ok = await authStore.login2fa(code.value)
  if (ok) router.push('/super-admin')
  else errorMsg.value = authStore.error || 'Código inválido'
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement
  code.value = input.value.replace(/\D/g, '').slice(0, 6)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-950">
    <div class="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔐</div>
        <h3 class="text-2xl font-semibold text-white mb-2">Autenticación en dos pasos</h3>
        <p class="text-sm text-gray-400">Ingresá el código de 6 dígitos desde tu app de autenticación</p>
      </div>
      <form @submit.prevent="handleVerify" class="space-y-6">
        <div class="flex justify-center gap-2">
          <input v-for="i in 6" :key="i" :value="code[i-1] || ''"
            class="w-11 h-14 text-center text-xl font-bold rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            :ref="(el: any) => { if (el && i === 1) (window as any)._2faFirst = el }"
            @input="handleInput" maxlength="1" inputmode="numeric" pattern="[0-9]"
            :disabled="!authStore.tempToken" />
        </div>
        <p v-if="errorMsg" class="text-red-400 text-sm text-center">{{ errorMsg }}</p>
        <button type="submit" :disabled="code.length !== 6 || !authStore.tempToken"
          class="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all">
          Verificar
        </button>
      </form>
      <div class="mt-4 text-center">
        <button @click="authStore.logout(); router.push('/admin/login')" class="text-sm text-gray-500 hover:text-gray-300">← Volver al login</button>
      </div>
    </div>
  </div>
</template>
