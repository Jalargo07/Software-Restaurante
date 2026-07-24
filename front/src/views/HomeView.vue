<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'
import { useReporteStore } from '../stores/reportes'
import { useToastStore } from '../stores/toast'
import VentasPorDiaChart from '../components/common/chart-VentasPorDia.vue'
import MesasChart from '../components/common/chart-Mesas.vue'
import TopProductosChart from '../components/common/chart-TopProductos.vue'

const reporteStore = useReporteStore()
const toast = useToastStore()

const stats = ref({
  mesasDisponibles: 0,
  mesasOcupadas: 0,
  productosBajoStock: 0,
  totalProductos: 0,
  pedidosActivos: 0,
})

onMounted(async () => {
  const [mesas, productos, pedidos] = await Promise.all([
    api.get('/mesas'),
    api.get('/productos'),
    api.get('/ventas?estado=abierta'),
  ])

  const mesasArr = mesas.data.data || mesas.data
  const prodsArr = productos.data.data || productos.data

  stats.value = {
    mesasDisponibles: mesasArr.filter((m: any) => m.estado === 'disponible').length,
    mesasOcupadas: mesasArr.filter((m: any) => m.estado === 'ocupada').length,
    productosBajoStock: prodsArr.filter((p: any) => p.stock <= p.stockMinimo).length,
    totalProductos: prodsArr.length,
    pedidosActivos: Number(pedidos.data.total) || 0,
  }

  reporteStore.fetchAll()
})

async function exportarVentasHoy() {
  try {
    const hoy = new Date().toISOString().slice(0, 10)
    await reporteStore.exportarVentasExcel(hoy, hoy)
    toast.success('Ventas de hoy exportadas')
  } catch {
    toast.error('Error al exportar')
  }
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="mb-4">Dashboard</h1>
      <button class="btn btn-success btn-sm" @click="exportarVentasHoy" :disabled="reporteStore.exportando">
        <span v-if="reporteStore.exportando" class="spinner-border spinner-border-sm me-1"></span>
        Exportar Excel
      </button>
    </div>

    <div v-if="reporteStore.loading && stats.pedidosActivos === 0" class="text-center mt-5">
      <span class="spinner-border text-primary"></span>
    </div>

    <template v-else>
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-1 fw-bold text-success">{{ stats.mesasDisponibles }}</div>
              <div class="text-muted small">Mesas Libres</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-1 fw-bold text-danger">{{ stats.mesasOcupadas }}</div>
              <div class="text-muted small">Mesas Ocupadas</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-1 fw-bold text-primary">${{ Number(reporteStore.ventasHoy.total).toFixed(0) }}</div>
              <div class="text-muted small">Ventas Hoy ({{ reporteStore.ventasHoy.cantidad }})</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-1 fw-bold text-info">{{ stats.pedidosActivos }}</div>
              <div class="text-muted small">Pedidos Activos</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-4 fw-bold text-warning">{{ stats.productosBajoStock }}</div>
              <div class="text-muted small">Stock Bajo</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-4 fw-bold text-secondary">${{ Number(reporteStore.comprasMes.total).toFixed(0) }}</div>
              <div class="text-muted small">Compras Mes ({{ reporteStore.comprasMes.cantidad }})</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-4 fw-bold text-dark">{{ reporteStore.productosMasVendidos[0]?.nombre || '-' }}</div>
              <div class="text-muted small">Top Producto</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fs-4 fw-bold text-success">${{ reporteStore.ventasPorDia[0]?.total || 0 }}</div>
              <div class="text-muted small">Ventas Último Día</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent fw-semibold">Ventas por Día</div>
            <div class="card-body">
              <VentasPorDiaChart :data="reporteStore.ventasPorDia" />
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent fw-semibold">Estado Mesas</div>
            <div class="card-body">
              <MesasChart :disponibles="stats.mesasDisponibles" :ocupadas="stats.mesasOcupadas" />
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent fw-semibold">Top Productos</div>
            <div class="card-body">
              <TopProductosChart :data="reporteStore.productosMasVendidos" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
