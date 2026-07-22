<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMesaStore } from '../../stores/mesas'
import { useVentaStore } from '../../stores/ventas'
import ModalBase from '../../components/common/ModalBase.vue'
import MesaFormModal from '../../components/mesas/MesaFormModal.vue'

const router = useRouter()
const mesaStore = useMesaStore()
const ventaStore = useVentaStore()
const modalAbierto = ref(false)
const editando = ref<any>(null)

onMounted(() => {
  mesaStore.fetchMesas()
})

function abrirModal(mesa?: any) {
  editando.value = mesa ?? null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  editando.value = null
}

async function eliminar(id: number) {
  if (confirm('Eliminar esta mesa?')) {
    await mesaStore.deleteMesa(id)
  }
}

async function ocuparMesa(mesa: any) {
  try {
    await ventaStore.createVenta({ mesaId: mesa.id })
    await mesaStore.fetchMesas()
    router.push('/pedidos')
  } catch (error) {
    console.error('Error al ocupar mesa:', error)
  }
}

function verPedido(mesa: any) {
  router.push('/pedidos')
}

function estadoColor(estado: string) {
  const colors: Record<string, string> = {
    disponible: 'success', ocupada: 'danger', reservada: 'warning', mantenimiento: 'secondary',
  }
  return colors[estado] || 'primary'
}
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center">
      <h2>Gestion de Mesas</h2>
      <button class="btn btn-primary" @click="abrirModal()">+ Nueva Mesa</button>
    </div>

    <div class="row mt-3" v-if="mesaStore.mesas.length">
      <div class="col-md-3 mb-3" v-for="mesa in mesaStore.mesas" :key="mesa.id">
        <div class="card">
          <div class="card-body text-center">
            <h5>Mesa #{{ mesa.numero }}</h5>
            <p>Capacidad: {{ mesa.capacidad }} personas</p>
            <p v-if="mesa.ubicacion" class="text-muted small">{{ mesa.ubicacion }}</p>
            <span :class="`badge bg-${estadoColor(mesa.estado)}`">{{ mesa.estado }}</span>
            <div class="mt-2">
              <button v-if="mesa.estado === 'disponible'" class="btn btn-sm btn-success me-1" @click="ocuparMesa(mesa)">Ocupar</button>
              <button v-if="mesa.estado === 'ocupada'" class="btn btn-sm btn-warning me-1" @click="verPedido(mesa)">Ver Pedido</button>
              <button class="btn btn-sm btn-outline-primary me-1" @click="abrirModal(mesa)">Editar</button>
              <button class="btn btn-sm btn-outline-danger" @click="eliminar(mesa.id)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-4">
      <p>No hay mesas registradas</p>
    </div>

    <ModalBase v-if="modalAbierto" id="mesaModal" :titulo="editando ? 'Editar Mesa' : 'Nueva Mesa'" @cerrar="cerrarModal">
      <MesaFormModal :mesa="editando" :abierto="modalAbierto" @cerrar="cerrarModal" @guardado="mesaStore.fetchMesas()" />
    </ModalBase>
  </div>
</template>
