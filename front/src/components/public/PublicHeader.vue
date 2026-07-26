<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const mobileOpen = ref(false)

function scrollTo(selector: string) {
  const el = document.querySelector(selector)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  mobileOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center gap-2">
          <img src="/banner-biteops.webp" alt="BiteOps" width="179" height="56" loading="eager" class="h-8 w-auto">
        </RouterLink>

        <nav class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" @click.prevent="scrollTo('#features')">Funciones</a>
          <a href="#pricing" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" @click.prevent="scrollTo('#pricing')">Precios</a>
          <RouterLink to="/login" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
            Iniciar Sesión
          </RouterLink>
        </nav>

        <button class="md:hidden p-2 text-gray-600 dark:text-gray-300" aria-label="Menú de navegación" @click="mobileOpen = !mobileOpen">
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="mobileOpen" class="md:hidden pb-4 space-y-2">
          <a href="#features" class="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" @click.prevent="scrollTo('#features'); mobileOpen = false">Funciones</a>
          <a href="#pricing" class="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" @click.prevent="scrollTo('#pricing'); mobileOpen = false">Precios</a>
          <RouterLink to="/login" class="block px-3 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-center transition-colors" @click="mobileOpen = false">
            Iniciar Sesión
          </RouterLink>
      </div>
    </div>
  </header>
</template>
