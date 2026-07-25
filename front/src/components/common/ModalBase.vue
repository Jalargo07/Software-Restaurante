<script setup lang="ts">
import { X } from '@lucide/vue'
defineProps<{
  id: string
  titulo: string
}>()
const emit = defineEmits<{
  cerrar: []
}>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" :id="id" @click="emit('cerrar')">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[60vh] flex flex-col max-md:max-w-full max-md:mx-0 max-md:rounded-none max-md:h-screen max-md:max-h-screen" @click.stop>
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h5 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ titulo }}</h5>
        <button type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" @click="emit('cerrar')">
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="p-6 text-gray-700 dark:text-gray-300 overflow-y-auto flex-1 min-h-0">
        <slot />
      </div>
    </div>
  </div>
</template>
