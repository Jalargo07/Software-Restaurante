<script setup lang="ts">
import type { DocumentoFiscal } from '../../types'

defineProps<{ documento: DocumentoFiscal | null }>()
const emit = defineEmits<{ cerrar: [] }>()

const badgeEstado = (estado: string) => {
  const map: Record<string, string> = { pendiente: 'bg-yellow-100 text-yellow-700', timbrado: 'bg-green-100 text-green-700', rechazado: 'bg-red-100 text-red-700' }
  return map[estado] || 'bg-gray-100 text-gray-700'
}
const labelEstado = (estado: string) => {
  const map: Record<string, string> = { pendiente: 'Pendiente', timbrado: 'Timbrado', rechazado: 'Rechazado' }
  return map[estado] || estado
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('cerrar')">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto p-6 max-md:max-w-full max-md:mx-0 max-md:rounded-none max-md:h-screen max-md:max-h-screen">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Documento Fiscal</h3>
        <button @click="emit('cerrar')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>

      <div v-if="!documento" class="text-center py-8 text-gray-500">Cargando...</div>

      <div v-else class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="badgeEstado(documento.estado)">{{ labelEstado(documento.estado) }}</span>
          <span class="text-xs text-gray-500">{{ documento.tipo === 'boleta' ? 'Boleta' : 'Factura' }}</span>
        </div>

        <div v-if="documento.folio" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p class="text-xs text-gray-500">Folio</p>
          <p class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ documento.folio }}</p>
        </div>

        <div v-if="documento.timbre" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p class="text-xs text-gray-500">Timbre</p>
          <p class="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">{{ documento.timbre }}</p>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p class="text-xs text-gray-500">Neto</p>
            <p class="font-semibold text-gray-900 dark:text-white">${{ Number(documento.montoNeto).toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p class="text-xs text-gray-500">IVA</p>
            <p class="font-semibold text-gray-900 dark:text-white">${{ Number(documento.iva).toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p class="text-xs text-gray-500">Total</p>
            <p class="font-semibold text-gray-900 dark:text-white">${{ Number(documento.montoTotal).toLocaleString() }}</p>
          </div>
        </div>

        <div v-if="documento.rutCliente || documento.razonSocial" class="border-t border-gray-200 dark:border-gray-600 pt-3">
          <p class="text-xs font-semibold text-gray-500 mb-2">Cliente</p>
          <p v-if="documento.razonSocial" class="text-sm text-gray-900 dark:text-white">{{ documento.razonSocial }}</p>
          <p v-if="documento.rutCliente" class="text-xs text-gray-500">{{ documento.rutCliente }}</p>
        </div>

        <div v-if="documento.xml" class="border-t border-gray-200 dark:border-gray-600 pt-3">
          <p class="text-xs font-semibold text-gray-500 mb-2">XML</p>
          <pre class="text-[10px] bg-gray-100 dark:bg-gray-900 rounded p-2 max-h-32 overflow-auto text-gray-700 dark:text-gray-300">{{ documento.xml.substring(0, 300) }}...</pre>
        </div>

        <div v-if="documento.fechaTimbre" class="text-xs text-gray-400 text-center pt-2">
          Timbrado: {{ new Date(documento.fechaTimbre).toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>
