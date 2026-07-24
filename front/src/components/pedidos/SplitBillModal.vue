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
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="fw-bold">Total a Pagar: ${{ Number(venta.total).toFixed(2) }}</span>
        <span class="badge" :class="esValido ? 'bg-success' : 'bg-warning text-dark'">
          Suma pagos: ${{ sumaPagos.toFixed(2) }}
        </span>
      </div>

      <!-- Selector de Modo -->
      <div class="btn-group w-100 mb-3" role="group">
        <input type="radio" class="btn-check" id="modoIguales" value="iguales" v-model="modo" autocomplete="off">
        <label class="btn btn-outline-primary" for="modoIguales">Partes Iguales</label>

        <input type="radio" class="btn-check" id="modoPersonalizado" value="personalizado" v-model="modo" autocomplete="off">
        <label class="btn btn-outline-primary" for="modoPersonalizado">Montos Personalizados</label>
      </div>

      <!-- Modo Partes Iguales -->
      <div v-if="modo === 'iguales'" class="mb-3">
        <div class="row g-2 align-items-center mb-3">
          <div class="col-auto">
            <label class="col-form-label">Número de personas:</label>
          </div>
          <div class="col">
            <input type="number" min="2" max="50" v-model.number="numeroPersonas" class="form-control">
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Método de Pago (para todas las partes):</label>
          <select v-model="metodoIguales" class="form-select">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div class="card bg-light p-2 mb-2">
          <p class="mb-1 fw-semibold">Desglose ({{ Math.max(2, numeroPersonas) }} partes):</p>
          <ul class="list-group list-group-flush small">
            <li v-for="(p, index) in pagosActuales" :key="index" class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
              <span>Persona #{{ index + 1 }} ({{ p.metodo }})</span>
              <span class="fw-bold">${{ p.monto.toFixed(2) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Modo Personalizado -->
      <div v-else class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-semibold small">Asignar montos por parte:</span>
          <button class="btn btn-sm btn-outline-primary" @click="agregarFila">+ Agregar Parte</button>
        </div>

        <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
          <table class="table table-sm align-middle mb-2">
            <thead>
              <tr>
                <th>Monto ($)</th>
                <th>Método</th>
                <th style="width: 40px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, index) in filasPersonalizadas" :key="fila.id">
                <td>
                  <input type="number" step="0.01" min="0" v-model.number="fila.monto" class="form-control form-control-sm">
                </td>
                <td>
                  <select v-model="fila.metodo" class="form-select form-select-sm">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" :disabled="filasPersonalizadas.length <= 1" @click="eliminarFila(index)">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Validación visual en tiempo real -->
      <div class="alert mt-3 py-2 px-3 mb-3 text-center small" :class="esValido ? 'alert-success' : diferencia > 0 ? 'alert-warning' : 'alert-danger'">
        <span v-if="esValido" class="fw-bold">¡Los pagos coinciden exactamente con el total!</span>
        <span v-else-if="diferencia > 0">Falta por cubrir: <strong>${{ diferencia.toFixed(2) }}</strong></span>
        <span v-else>Excede el total por: <strong>${{ Math.abs(diferencia).toFixed(2) }}</strong></span>
      </div>

      <!-- Botón Cobrar -->
      <button class="btn btn-success w-100" :disabled="!esValido || cargando" @click="confirmarCobroDividido">
        <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
        Confirmar Cobro Dividido (${{ sumaPagos.toFixed(2) }})
      </button>
    </div>
  </ModalBase>
</template>

<style scoped>
[data-theme="dark"] .card.bg-light {
  background-color: #27272a !important;
  color: #e4e4e7;
}
[data-theme="dark"] .list-group-item {
  background-color: transparent !important;
  color: #e4e4e7;
  border-color: #3f3f46;
}
</style>
