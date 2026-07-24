<script setup lang="ts">
defineProps<{
  iconColor: 'purple' | 'blue' | 'amber'
  badge: string
  titulo: string
  valor: string
  footer: string
  variante?: 'gradient' | 'default'
}>()

const iconColorClasses: Record<string, string> = {
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400',
  green: 'bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400',
}
</script>

<template>
  <div
    :class="variante === 'gradient'
      ? 'bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-sm h-full overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
      : 'bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'"
  >
    <div class="p-4">
      <div class="flex justify-between items-start mb-3">
        <div :class="variante === 'gradient' ? 'p-3 bg-white/25 rounded-lg' : `p-3 rounded-lg ${iconColorClasses[iconColor]}`">
          <slot name="icon" />
        </div>
        <span
          :class="variante === 'gradient'
            ? 'bg-white/25 text-white text-xs px-2 py-1 rounded-full inline-flex items-center gap-1'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full'"
        >
          <slot name="badge-icon" /> {{ badge }}
        </span>
      </div>
      <div :class="variante === 'gradient' ? 'text-white/70 text-xs font-semibold uppercase tracking-wider' : 'text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider'">{{ titulo }}</div>
      <div :class="variante === 'gradient' ? 'text-2xl font-extrabold text-white' : 'text-2xl font-extrabold text-gray-900 dark:text-gray-100'">
        <slot name="valor">{{ valor }}</slot>
      </div>
    </div>
    <div :class="variante === 'gradient' ? 'pt-0 pb-3 px-4 text-white/70 text-xs' : 'bg-gray-50 dark:bg-gray-700/50 py-2 px-4 text-gray-500 dark:text-gray-400 text-xs'">
      {{ footer }}
    </div>
  </div>
</template>
