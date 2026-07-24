<script setup lang="ts">
defineProps<{
  iconColor: 'blue' | 'cyan' | 'amber'
  titulo: string
  descripcion: string
}>()

const iconColorClasses: Record<string, string> = {
  blue: 'text-[var(--color-primario)] dark:text-[var(--color-primario)]',
  cyan: 'text-cyan-500 dark:text-cyan-400',
  amber: 'text-amber-500 dark:text-amber-400',
}
</script>

<template>
  <div>
    <h5 class="font-bold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
      <span :class="iconColorClasses[iconColor]"><slot name="icon" /></span> {{ titulo }}
    </h5>
    <p class="text-gray-500 dark:text-gray-400 text-sm">{{ descripcion }}</p>
  </div>
</template>
