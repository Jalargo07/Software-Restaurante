<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ data: any }>()
const expandido = ref(false)

const jsonFormateado = computed(() => {
  if (!props.data) return ''
  const obj = typeof props.data === 'string' ? JSON.parse(props.data) : props.data
  return JSON.stringify(obj, null, 2)
})

function toggle() {
  expandido.value = !expandido.value
}
</script>

<template>
  <div v-if="data" class="json-viewer">
    <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none" @click="toggle">
      <span class="me-1">{{ expandido ? '▼' : '▶' }}</span>
      <span class="small text-muted">Ver detalles</span>
    </button>
    <pre v-if="expandido" class="mt-1 mb-0 p-2 rounded small json-pre">{{ jsonFormateado }}</pre>
  </div>
  <span v-else class="text-muted">-</span>
</template>

<style scoped>
.json-pre {
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 11px;
}
</style>
