<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Venta, MetodoPago } from '../../types'
import { usePedidoStore } from '../../stores/pedidos'
import { useToastStore } from '../../stores/toast'
import ModalBase from '../common/ModalBase.vue'

const props = defineProps<{
  venta: Venta
}>()

const emit = defineEmits<{
  cerrar: []
  cobrado: []
}>()

const pedidoStore = usePedidoStore()
const toast = useToastStore()

const modo = ref<'iguales' | 'personalizado'>('iguales')
const numeroPersonas = ref<number>(2)
const metodoIguales = ref<MetodoPago>('efectivo')

interface FilaPersonalizada {
  id: number
  monto: number
  metodo: MetodoPago
}

const filasPersonalizadas = ref<FilaPersonalizada[]>([
  { id: 1, monto: Number((props.venta.total / 2).toFixed(2)), metodo: 'efectivo' },
  { id: 2, monto: Number((props.venta.total - Number((props.venta.total / 2).toFixed(2))).toFixed(2)), metodo: 'tarjeta' },
])

let nextId = 3

function agregarFila() {
  filasPersonalizadas.value.push({
    id: nextId++,
    monto: 0,
    metodo: 'efectivo',
  })
}

function eliminarFila(index: number) {
  if (filasPersonalizadas.value.length <= 1) return
  filasPersonalizadas.value.splice(index, 1)
}

const pagosActuales = computed<{ metodo: MetodoPago; monto: number }[]>(() => {
  if (modo.value === 'iguales') {
    const total = Number(props.venta.total)
    const personas = Math.max(2, numeroPersonas.value)
    const montoBase = Math.floor((total / personas) * 100) / 100
    const pagos: { metodo: MetodoPago; monto: number }[] = []
    
    let acumulado = 0
    for (let i = 0; i < personas; i++) {
      let monto = montoBase
      if (i === personas - 1) {
        monto = Number((total - acumulado).toFixed(2))
      }
      pagos.push({
        metodo: metodoIguales.value,
        monto: Number(monto.toFixed(2)),
      })
      acumulado += monto
    }
    return pagos
  } else {
    return filasPersonalizadas.value.map((f) => ({
      metodo: f.metodo,
      monto: Number(f.monto) || 0,
    }))
  }
})

const sumaPagos = computed(() => {
  return Number(pagosActuales.value.reduce((s, p) => s + p.monto, 0).toFixed(2))
})

const totalVenta = computed(() => Number(props.venta.total))

const diferencia = computed(() => {
  return Number((totalVenta.value - sumaPagos.value).toFixed(2))
})

const esValido = computed(() => {
  return Math.abs(sumaPagos.value - totalVenta.value) < 0.01
})

const cargando = ref(false)

async function confirmarCobroDividido() {
  if (!esValido.value) return
  cargando.value = true
  try {
    await pedidoStore.cobrarVentaDividida(props.venta.id, pagosActuales.value)
    toast.success('Cuenta dividida y cobrada con éxito')
    emit('cobrado')
    emit('cerrar')
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Error al cobrar cuenta dividida')
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <ModalBase id="splitBillModal" titulo="Dividir Cuenta (Split Bill)" @cerrar="emit('cerrar')">
    <div class="mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-gray-900 dark:text-gray-100">Total a Pagar: ${{ Number(venta.total).toFixed(2) }}</span>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="esValido ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'">
          Suma pagos: ${{ sumaPagos.toFixed(2) }}
        </span>
      </div>

      <!-- Selector de Modo -->
      <div class="flex w-full mb-3 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <label class="flex-1 cursor-pointer">
          <input type="radio" class="sr-only" id="modoIguales" value="iguales" v-model="modo" autocomplete="off">
          <span class="block text-center px-4 py-2 text-sm font-medium transition-colors" :class="modo === 'iguales' ? 'bg-[var(--color-primario)] text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'">Partes Iguales</span>
        </label>
        <label class="flex-1 cursor-pointer">
          <input type="radio" class="sr-only" id="modoPersonalizado" value="personalizado" v-model="modo" autocomplete="off">
          <span class="block text-center px-4 py-2 text-sm font-medium transition-colors" :class="modo === 'personalizado' ? 'bg-[var(--color-primario)] text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'">Montos Personalizados</span>
        </label>
      </div>

      <!-- Modo Partes Iguales -->
      <div v-if="modo === 'iguales'" class="mb-3">
        <div class="grid grid-cols-12 gap-2 items-center mb-3">
          <div class="col-auto">
            <label class="text-sm text-gray-700 dark:text-gray-300">Número de personas:</label>
          </div>
          <div class="col">
            <input type="number" min="2" max="50" v-model.number="numeroPersonas" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500">
          </div>
        </div>

        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago (para todas las partes):</label>
          <select v-model="metodoIguales" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mb-2">
          <p class="mb-1 font-semibold text-sm text-gray-900 dark:text-gray-100">Desglose ({{ Math.max(2, numeroPersonas) }} partes):</p>
          <ul class="divide-y divide-gray-200 dark:divide-gray-600 text-sm">
            <li v-for="(p, index) in pagosActuales" :key="index" class="flex items-center justify-between py-1.5 bg-transparent text-gray-900 dark:text-gray-100">
              <span>Persona #{{ index + 1 }} ({{ p.metodo }})</span>
              <span class="font-bold">${{ p.monto.toFixed(2) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Modo Personalizado -->
      <div v-else class="mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-xs text-gray-700 dark:text-gray-300">Asignar montos por parte:</span>
          <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white rounded-lg transition-colors" @click="agregarFila">+ Agregar Parte</button>
        </div>

        <div class="overflow-x-auto" style="max-height: 200px; overflow-y: auto;">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto ($)</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th class="px-4 py-3" style="width: 40px;"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(fila, index) in filasPersonalizadas" :key="fila.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <input type="number" step="0.01" min="0" v-model.number="fila.monto" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500">
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <select v-model="fila.metodo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" :disabled="filasPersonalizadas.length <= 1" @click="eliminarFila(index)">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Validación visual en tiempo real -->
      <div class="mt-3 py-2 px-3 mb-3 text-center text-sm rounded-lg" :class="esValido ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : diferencia > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
        <span v-if="esValido" class="font-bold">¡Los pagos coinciden exactamente con el total!</span>
        <span v-else-if="diferencia > 0">Falta por cubrir: <strong>${{ diferencia.toFixed(2) }}</strong></span>
        <span v-else>Excede el total por: <strong>${{ Math.abs(diferencia).toFixed(2) }}</strong></span>
      </div>

      <!-- Botón Cobrar -->
      <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors w-full" :disabled="!esValido || cargando" @click="confirmarCobroDividido">
        <span v-if="cargando" class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
        Confirmar Cobro Dividido (${{ sumaPagos.toFixed(2) }})
      </button>
    </div>
  </ModalBase>
</template>
