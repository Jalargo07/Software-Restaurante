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

const getFormattedDate = (date: Date) => date.toISOString().slice(0, 10)

const cambiarPeriodo = (periodo: 'hoy' | '7dias' | '30dias' | 'mes' | 'personalizado') => {
  reporteStore.filtroPeriodo = periodo
  const hoyObj = new Date()
  const hoyStr = getFormattedDate(hoyObj)

  if (periodo === 'hoy') {
    reporteStore.fechaDesde = hoyStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: hoyStr, fechaHasta: hoyStr, dias: 1 })
  } else if (periodo === '7dias') {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    const desdeStr = getFormattedDate(d)
    reporteStore.fechaDesde = desdeStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: desdeStr, fechaHasta: hoyStr, dias: 7 })
  } else if (periodo === '30dias') {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    const desdeStr = getFormattedDate(d)
    reporteStore.fechaDesde = desdeStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: desdeStr, fechaHasta: hoyStr, dias: 30 })
  } else if (periodo === 'mes') {
    const primerDia = new Date(hoyObj.getFullYear(), hoyObj.getMonth(), 1)
    const desdeStr = getFormattedDate(primerDia)
    reporteStore.fechaDesde = desdeStr
    reporteStore.fechaHasta = hoyStr
    reporteStore.fetchAll({ fechaDesde: desdeStr, fechaHasta: hoyStr })
  }
}

const aplicarFiltroPersonalizado = () => {
  if (!reporteStore.fechaDesde || !reporteStore.fechaHasta) {
    toast.warning('Seleccione fecha desde y hasta')
    return
  }
  reporteStore.fetchAll({
    fechaDesde: reporteStore.fechaDesde,
    fechaHasta: reporteStore.fechaHasta,
  })
}

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

  if (!reporteStore.filtroPeriodo || reporteStore.filtroPeriodo !== 'personalizado') {
    cambiarPeriodo(reporteStore.filtroPeriodo || 'hoy')
  } else if (reporteStore.fechaDesde && reporteStore.fechaHasta) {
    reporteStore.fetchAll({ fechaDesde: reporteStore.fechaDesde, fechaHasta: reporteStore.fechaHasta })
  } else {
    cambiarPeriodo('hoy')
  }
})

async function exportarReporteExcel() {
  try {
    await reporteStore.exportarVentasExcel(reporteStore.fechaDesde, reporteStore.fechaHasta)
    toast.success('Reporte de ventas exportado exitosamente')
  } catch {
    toast.error('Error al exportar reporte')
  }
}
</script>

<template>
  <div class="container py-4">
    <!-- Header principal -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h1 class="h3 fw-bold mb-1 text-dark">Dashboard General</h1>
        <p class="text-muted small mb-0">Resumen operativo y métricas financieras en tiempo real</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-success btn-sm px-3 shadow-sm" @click="exportarReporteExcel" :disabled="reporteStore.exportando">
          <span v-if="reporteStore.exportando" class="spinner-border spinner-border-sm me-1"></span>
          <i class="bi bi-file-earmark-excel me-1"></i> Exportar Excel
        </button>
      </div>
    </div>

    <!-- Barra de Filtros Superior (Píldoras / Pestañas) -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div class="d-flex flex-wrap gap-2">
          <button
            class="btn btn-sm px-3 rounded-pill fw-medium transition-all"
            :class="reporteStore.filtroPeriodo === 'hoy' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'"
            @click="cambiarPeriodo('hoy')"
          >
            <i class="bi bi-calendar-day me-1"></i> Hoy
          </button>
          <button
            class="btn btn-sm px-3 rounded-pill fw-medium transition-all"
            :class="reporteStore.filtroPeriodo === '7dias' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'"
            @click="cambiarPeriodo('7dias')"
          >
            <i class="bi bi-calendar-week me-1"></i> Últimos 7 días
          </button>
          <button
            class="btn btn-sm px-3 rounded-pill fw-medium transition-all"
            :class="reporteStore.filtroPeriodo === '30dias' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'"
            @click="cambiarPeriodo('30dias')"
          >
            <i class="bi bi-calendar-range me-1"></i> Últimos 30 días
          </button>
          <button
            class="btn btn-sm px-3 rounded-pill fw-medium transition-all"
            :class="reporteStore.filtroPeriodo === 'mes' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'"
            @click="cambiarPeriodo('mes')"
          >
            <i class="bi bi-calendar-month me-1"></i> Este Mes
          </button>
          <button
            class="btn btn-sm px-3 rounded-pill fw-medium transition-all"
            :class="reporteStore.filtroPeriodo === 'personalizado' ? 'btn-primary shadow-sm' : 'btn-light text-secondary'"
            @click="reporteStore.filtroPeriodo = 'personalizado'"
          >
            <i class="bi bi-sliders me-1"></i> Personalizado
          </button>
        </div>

        <!-- Inputs de fecha para filtro personalizado -->
        <div v-if="reporteStore.filtroPeriodo === 'personalizado'" class="d-flex align-items-center gap-2 animate-fade-in">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light text-muted">Desde</span>
            <input type="date" class="form-control" v-model="reporteStore.fechaDesde" />
          </div>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light text-muted">Hasta</span>
            <input type="date" class="form-control" v-model="reporteStore.fechaHasta" />
          </div>
          <button class="btn btn-primary btn-sm px-3 text-nowrap shadow-sm" @click="aplicarFiltroPersonalizado">
            <i class="bi bi-check2 me-1"></i> Aplicar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="reporteStore.loading && stats.pedidosActivos === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="text-muted mt-3 fw-medium">Actualizando métricas...</p>
    </div>

    <!-- Contenido Principal -->
    <template v-else>
      <!-- Tarjetas de KPIs (Metrics Cards) - Fila 1 -->
      <div class="row g-4 mb-4">
        <!-- Ventas del Período -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-gradient-success text-white overflow-hidden position-relative">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="p-3 bg-white bg-opacity-25 rounded-3">
                  <i class="bi bi-cash-coin fs-3"></i>
                </div>
                <span class="badge bg-white bg-opacity-25 text-white fw-normal px-2 py-1">
                  <i class="bi bi-arrow-up-short"></i> {{ reporteStore.ventasHoy.cantidad }} transacciones
                </span>
              </div>
              <div class="text-white-50 small fw-semibold text-uppercase tracking-wider">Ventas Totales</div>
              <div class="fs-2 fw-extrabold mb-0">${{ Number(reporteStore.ventasHoy.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}</div>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0 pb-3 px-4 text-white-50 small">
              Período seleccionado
            </div>
          </div>
        </div>

        <!-- Compras del Período -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-white overflow-hidden position-relative">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="p-3 bg-purple bg-opacity-10 text-purple rounded-3" style="background-color: rgba(111, 66, 193, 0.1); color: #6f42c1;">
                  <i class="bi bi-bag-check fs-3"></i>
                </div>
                <span class="badge bg-light text-secondary fw-normal px-2 py-1">
                  {{ reporteStore.comprasMes.cantidad }} compras
                </span>
              </div>
              <div class="text-muted small fw-semibold text-uppercase tracking-wider">Compras Insumos</div>
              <div class="fs-2 fw-extrabold text-dark mb-0">${{ Number(reporteStore.comprasMes.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}</div>
            </div>
            <div class="card-footer bg-light bg-opacity-50 border-0 py-2 px-4 text-muted small">
              Gastos en inventario
            </div>
          </div>
        </div>

        <!-- Estado de Mesas -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-white overflow-hidden position-relative">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="p-3 bg-info bg-opacity-10 text-info rounded-3">
                  <i class="bi bi-shop fs-3"></i>
                </div>
                <span class="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-1">
                  {{ stats.mesasDisponibles }} libres
                </span>
              </div>
              <div class="text-muted small fw-semibold text-uppercase tracking-wider">Mesas Ocupadas</div>
              <div class="fs-2 fw-extrabold text-dark mb-0">{{ stats.mesasOcupadas }} <span class="fs-6 text-muted fw-normal">/ {{ stats.mesasDisponibles + stats.mesasOcupadas }}</span></div>
            </div>
            <div class="card-footer bg-light bg-opacity-50 border-0 py-2 px-4 text-muted small">
              Salón activo
            </div>
          </div>
        </div>

        <!-- Pedidos Activos -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-white overflow-hidden position-relative">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
                  <i class="bi bi-receipt fs-3"></i>
                </div>
                <span class="badge bg-warning bg-opacity-10 text-warning fw-semibold px-2 py-1">
                  En proceso
                </span>
              </div>
              <div class="text-muted small fw-semibold text-uppercase tracking-wider">Pedidos Abiertos</div>
              <div class="fs-2 fw-extrabold text-dark mb-0">{{ stats.pedidosActivos }}</div>
            </div>
            <div class="card-footer bg-light bg-opacity-50 border-0 py-2 px-4 text-muted small">
              Ventas en curso
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjetas de KPIs Secundarios - Fila 2 -->
      <div class="row g-4 mb-4">
        <!-- Stock Bajo -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-white">
            <div class="card-body d-flex align-items-center p-3">
              <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-3 me-3">
                <i class="bi bi-exclamation-triangle fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold">Productos con Stock Bajo</div>
                <div class="fs-4 fw-bold text-danger mb-0">{{ stats.productosBajoStock }} <span class="fs-6 text-muted fw-normal">items</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Producto -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-white">
            <div class="card-body d-flex align-items-center p-3">
              <div class="p-3 bg-primary bg-opacity-10 text-primary rounded-3 me-3">
                <i class="bi bi-star fs-4"></i>
              </div>
              <div class="text-truncate">
                <div class="text-muted small fw-semibold">Producto Estrella</div>
                <div class="fs-5 fw-bold text-dark text-truncate mb-0">{{ reporteStore.productosMasVendidos[0]?.nombre || 'Sin datos' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Promedio / Tendencia -->
        <div class="col-12 col-sm-12 col-md-4">
          <div class="card metric-card border-0 rounded-4 shadow-sm h-100 bg-white">
            <div class="card-body d-flex align-items-center p-3">
              <div class="p-3 bg-success bg-opacity-10 text-success rounded-3 me-3">
                <i class="bi bi-graph-up-arrow fs-4"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold">Ticket Promedio Estimado</div>
                <div class="fs-5 fw-bold text-success mb-0">
                  ${{ reporteStore.ventasHoy.cantidad > 0 ? (reporteStore.ventasHoy.total / reporteStore.ventasHoy.cantidad).toFixed(0) : 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos Interactivos -->
      <div class="row g-4">
        <!-- Ventas por Día -->
        <div class="col-12 col-xl-8">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 class="fw-bold mb-1 text-dark"><i class="bi bi-bar-chart-line text-primary me-2"></i> Evolución de Ventas</h5>
                <p class="text-muted small mb-0">Comportamiento financiero en el rango seleccionado</p>
              </div>
            </div>
            <div class="card-body px-4 pb-4">
              <div style="height: 320px;">
                <VentasPorDiaChart :data="reporteStore.ventasPorDia" />
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Mesas (Donut) -->
        <div class="col-12 col-xl-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div class="card-header bg-transparent border-0 pt-4 px-4">
              <h5 class="fw-bold mb-1 text-dark"><i class="bi bi-pie-chart text-info me-2"></i> Ocupación de Mesas</h5>
              <p class="text-muted small mb-0">Distribución actual del salón</p>
            </div>
            <div class="card-body px-4 pb-4 d-flex flex-column justify-content-center align-items-center">
              <div style="height: 260px; width: 100%;">
                <MesasChart :disponibles="stats.mesasDisponibles" :ocupadas="stats.mesasOcupadas" />
              </div>
            </div>
          </div>
        </div>

        <!-- Top Productos -->
        <div class="col-12">
          <div class="card border-0 shadow-sm rounded-4 bg-white">
            <div class="card-header bg-transparent border-0 pt-4 px-4">
              <h5 class="fw-bold mb-1 text-dark"><i class="bi bi-trophy text-warning me-2"></i> Productos Más Vendidos</h5>
              <p class="text-muted small mb-0">Ranking de platos y bebidas con mayor demanda</p>
            </div>
            <div class="card-body px-4 pb-4">
              <div style="height: 300px;">
                <TopProductosChart :data="reporteStore.productosMasVendidos" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.metric-card {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08) !important;
}

.bg-gradient-success {
  background: linear-gradient(135deg, #198754 0%, #157347 100%);
}

.fw-extrabold {
  font-weight: 800;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
