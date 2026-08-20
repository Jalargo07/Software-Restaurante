<script setup lang="ts">
defineProps<{
  iconColor: 'red' | 'blue' | 'green'
  titulo: string
  valor?: string
  loading?: boolean
}>()

const iconColorClasses: Record<string, string> = {
  red: 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400',
}

const valorColorClasses: Record<string, string> = {
  red: 'text-red-500 dark:text-red-400',
  blue: 'text-gray-900 dark:text-gray-100',
  green: 'text-green-600 dark:text-green-400',
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" :class="{ 'shimmer': loading }">
    <div class="flex items-center p-3">
      <div class="p-3 rounded-lg me-3" :class="iconColorClasses[iconColor]">
        <slot name="icon" />
      </div>
      <div class="truncate">
        <div class="text-gray-500 dark:text-gray-400 text-xs font-semibold">{{ titulo }}</div>
        <div class="text-lg font-bold truncate" :class="valorColorClasses[iconColor]">
          <template v-if="!loading">
            <slot name="valor">{{ valor }}</slot>
          </template>
          <div v-else class="h-5 w-16 skeleton rounded"></div>
        </div>
      </div>
    </div>
  </div>
</template>
