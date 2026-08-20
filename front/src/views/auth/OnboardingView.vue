<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '../../stores/onboarding';

const store = useOnboardingStore();
const router = useRouter();

const step = computed(() => store.stepCompleted);
const isLoading = computed(() => store.loading);

const mesas = ref<Array<{ numero: number; capacidad: number }>>([]);
const agregarMesa = () => {
  mesas.value.push({ numero: mesas.value.length + 1, capacidad: 4 });
};

const productos = ref<Array<{ nombre: string; categoria: string; precioVenta: number }>>([]);
const categorias = ['Entradas', 'Platos Principales', 'Bebidas', 'Postres', 'Extras'];
const agregarProducto = () => {
  productos.value.push({ nombre: '', categoria: 'Platos Principales', precioVenta: 0 });
};

const usuarios = ref<Array<{ nombre: string; email: string; password: string; rol: string }>>([]);
const roles = ['mesero', 'cajero', 'cocinero'];
const agregarUsuario = () => {
  usuarios.value.push({ nombre: '', email: '', password: '', rol: 'mesero' });
};

const completarStep = async () => {
  try {
    if (step.value === 0) {
      await store.completarStep1(mesas.value);
    } else if (step.value === 1) {
      await store.completarStep2(productos.value);
    } else if (step.value === 2) {
      await store.completarStep3(usuarios.value);
      localStorage.setItem('onboardingCompleted', 'true');
      router.push('/dashboard');
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  store.fetchProgress();
});
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card bg-base-100 shadow-xl w-full max-w-2xl">
      <div class="card-body">
        <div class="flex justify-between mb-8">
          <div v-for="i in 3" :key="i" class="flex items-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold"
              :class="i <= step + 1 ? 'bg-primary text-primary-content' : 'bg-base-300'"
            >
              {{ i }}
            </div>
            <div v-if="i < 3" class="w-16 h-1 mx-2" :class="i <= step ? 'bg-primary' : 'bg-base-300'" />
          </div>
        </div>

        <div v-if="step === 0">
          <h2 class="text-2xl font-bold mb-4">Configura tus Mesas</h2>
          <p class="text-base-content/70 mb-4">Agrega las mesas de tu restaurante</p>

          <div v-for="(mesa, index) in mesas" :key="index" class="flex gap-2 mb-2">
            <input v-model="mesa.numero" type="number" placeholder="Número" class="input input-bordered flex-1" />
            <input v-model="mesa.capacidad" type="number" placeholder="Capacidad" class="input input-bordered w-24" />
          </div>

          <button @click="agregarMesa" class="btn btn-outline mt-2">+ Agregar Mesa</button>
        </div>

        <div v-if="step === 1">
          <h2 class="text-2xl font-bold mb-4">Carga tus Productos</h2>
          <p class="text-base-content/70 mb-4">Agrega los productos que vendés</p>

          <div v-for="(producto, index) in productos" :key="index" class="flex gap-2 mb-2">
            <input v-model="producto.nombre" placeholder="Nombre" class="input input-bordered flex-1" />
            <select v-model="producto.categoria" class="select select-bordered w-40">
              <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input v-model.number="producto.precioVenta" type="number" placeholder="Precio" class="input input-bordered w-28" />
          </div>

          <button @click="agregarProducto" class="btn btn-outline mt-2">+ Agregar Producto</button>
        </div>

        <div v-if="step === 2">
          <h2 class="text-2xl font-bold mb-4">Invita a tu Staff</h2>
          <p class="text-base-content/70 mb-4">Crea cuentas para tus empleados</p>

          <div v-for="(usuario, index) in usuarios" :key="index" class="flex gap-2 mb-2">
            <input v-model="usuario.nombre" placeholder="Nombre" class="input input-bordered flex-1" />
            <input v-model="usuario.email" type="email" placeholder="Email" class="input input-bordered flex-1" />
            <input v-model="usuario.password" type="password" placeholder="Contraseña" class="input input-bordered w-32" />
            <select v-model="usuario.rol" class="select select-bordered w-28">
              <option v-for="rol in roles" :key="rol" :value="rol">{{ rol }}</option>
            </select>
          </div>

          <button @click="agregarUsuario" class="btn btn-outline mt-2">+ Agregar Usuario</button>
        </div>

        <div class="flex justify-between mt-8">
          <button @click="router.push('/dashboard')" class="btn btn-ghost">Saltar</button>
          <button @click="completarStep" class="btn btn-primary" :disabled="isLoading">
            {{ step === 2 ? 'Finalizar' : 'Siguiente' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>