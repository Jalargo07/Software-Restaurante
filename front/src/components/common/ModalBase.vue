<script setup lang="ts">
defineProps<{
  id: string
  titulo: string
}>()
const emit = defineEmits<{
  cerrar: []
}>()
</script>

<template>
  <div class="modal fade show d-block" :id="id" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ titulo }}</h5>
          <button type="button" class="btn-close" @click="emit('cerrar')"></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" @click="emit('cerrar')"></div>
</template>
