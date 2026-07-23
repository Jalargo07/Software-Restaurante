<script setup lang="ts">
import { useToastStore } from '../../stores/toast'
const toastStore = useToastStore()
</script>

<template>
  <div class="toast-container">
    <div
      v-for="t in toastStore.toasts"
      :key="t.id"
      class="toast-item"
      :class="`toast-${t.type}`"
      @click="toastStore.remove(t.id)"
    >
      {{ t.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 380px;
}
.toast-item {
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  animation: slideIn 0.3s ease;
  backdrop-filter: blur(8px);
}
.toast-success { background: #065f46; color: #d1fae5; border: 1px solid #059669; }
.toast-error { background: #7f1d1d; color: #fee2e2; border: 1px solid #dc2626; }
.toast-info { background: #1e3a5f; color: #dbeafe; border: 1px solid #2563eb; }
.toast-warning { background: #713f12; color: #fef9c3; border: 1px solid #d97706; }
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
