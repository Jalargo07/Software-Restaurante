<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { AlertTriangle, RefreshCw } from '@lucide/vue';

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((err) => {
  hasError.value = true;
  errorMessage.value = err.message || 'Ocurrió un error inesperado';

  console.error('[ErrorBoundary]', err);

  return false;
});

const handleRetry = () => {
  hasError.value = false;
  errorMessage.value = '';
  window.location.reload();
};
</script>

<template>
  <div v-if="hasError" class="min-h-[200px] flex items-center justify-center p-8">
    <div class="text-center">
      <AlertTriangle class="w-16 h-16 mx-auto text-warning mb-4" />
      <h3 class="text-xl font-bold mb-2">Algo salió mal</h3>
      <p class="text-base-content/70 mb-4">{{ errorMessage }}</p>
      <button @click="handleRetry" class="btn btn-primary">
        <RefreshCw class="w-4 h-4 mr-2" />
        Reintentar
      </button>
    </div>
  </div>
  <slot v-else />
</template>
