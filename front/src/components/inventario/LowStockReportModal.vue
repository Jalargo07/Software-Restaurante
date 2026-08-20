<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const downloading = ref(false)

async function downloadPDF() {
  downloading.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiUrl}/reportes/exportar/stock-bajo`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('Error al descargar')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stock-bajo.pdf'
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Reporte de Stock Bajo</h3>
      <p class="py-4">Descarga un PDF con todos los productos que están por debajo de su stock mínimo.</p>

      <div class="modal-action">
        <button @click="emit('close')" class="btn">Cerrar</button>
        <button @click="downloadPDF" class="btn btn-primary" :disabled="downloading">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a1.5 1.5 0 00-1.5-1.5h-5.69a1.5 1.5 0 01-1.06-.44z" /></svg>
          {{ downloading ? 'Descargando...' : 'Descargar PDF' }}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="emit('close')"></div>
  </div>
</template>
