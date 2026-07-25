<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { X, ChevronDown } from '@lucide/vue'

const props = defineProps<{
  options: { id: string | number, label: string }[]
  modelValue: (string | number)[]
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const container = ref<HTMLElement | null>(null)

const selectedLabels = computed(() => {
  return props.options
    .filter(opt => props.modelValue.includes(opt.id))
    .map(opt => opt.label)
})

const toggleOption = (id: string | number) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(id)
  if (index === -1) {
    newValue.push(id)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="container">
    <div
      class="w-full flex items-center justify-between p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-pointer"
      @click="isOpen = !isOpen"
    >
      <div class="flex flex-wrap gap-1">
        <span v-if="selectedLabels.length === 0" class="text-gray-400 text-sm">{{ placeholder || 'Seleccionar...' }}</span>
        <span
          v-else
          v-for="label in selectedLabels"
          :key="label"
          class="bg-[var(--color-primario)] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
        >
          {{ label }}
          <X :size="12" class="cursor-pointer" @click.stop="toggleOption(options.find(o => o.label === label)!.id)" />
        </span>
      </div>
      <ChevronDown :size="16" class="text-gray-400" />
    </div>

    <div
      v-if="isOpen"
      class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="opt in options"
        :key="opt.id"
        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
        @click="toggleOption(opt.id)"
      >
        <input type="checkbox" :checked="modelValue.includes(opt.id)" class="accent-[var(--color-primario)]" />
        {{ opt.label }}
      </div>
    </div>
  </div>
</template>
