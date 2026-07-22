<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const email = ref('admin@restaurant.com')
const password = ref('')
const errorMsg = ref('')

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
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Iniciar Sesion</h3>
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
              <button type="submit" class="btn btn-primary w-100">Ingresar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
