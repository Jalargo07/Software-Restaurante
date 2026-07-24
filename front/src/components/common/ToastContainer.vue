<script setup lang="ts">
import { useToastStore } from '../../stores/toast'
import { X } from '@lucide/vue'
const toastStore = useToastStore()
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-[380px]">
    <div
      v-for="t in toastStore.toasts"
      :key="t.id"
      class="rounded-lg shadow-lg p-4 text-white text-sm font-medium cursor-pointer backdrop-blur-sm"
      :class="{
        'bg-green-600 border border-green-500': t.type === 'success',
        'bg-red-600 border border-red-500': t.type === 'error',
        'bg-[var(--color-primario)] border border-blue-500': t.type === 'info',
        'bg-yellow-500 border border-yellow-500': t.type === 'warning',
      }"
      @click="toastStore.remove(t.id)"
    >
      <div class="flex items-center justify-between gap-2">
        <span>{{ t.message }}</span>
        <X class="w-4 h-4 shrink-0 opacity-70 hover:opacity-100" />
      </div>
    </div>
  </div>
</template>
