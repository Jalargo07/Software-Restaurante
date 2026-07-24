<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  activo: boolean
  icono: Component
  texto: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
    :class="activo
      ? 'bg-[var(--color-primario)] dark:bg-[var(--color-primario)] text-white shadow-sm'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
    @click="$emit('click')"
  >
    <component :is="icono" :size="14" /> {{ texto }}
  </button>
</template>
