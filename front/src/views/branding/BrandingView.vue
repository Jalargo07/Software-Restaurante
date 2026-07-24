<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBrandingStore } from '../../stores/branding'
import { useToastStore } from '../../stores/toast'
import api from '../../services/api'

const brandingStore = useBrandingStore()
const toast = useToastStore()

const guardando = ref(false)

const form = ref({
  colorPrimario: '#0d6efd',
  colorSecundario: '#6c757d',
  colorAcento: '#198754',
  nombreCompleto: '',
  fontPrincipal: 'Inter',
})

const logoArchivo = ref<File | null>(null)
const logoPreview = ref('')
const bannerArchivo = ref<File | null>(null)
const bannerPreview = ref('')

const fuentes = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
]

onMounted(async () => {
  await brandingStore.fetchBranding()
  if (brandingStore.branding) {
    const b = brandingStore.branding
    form.value = {
      colorPrimario: b.colorPrimario,
      colorSecundario: b.colorSecundario,
      colorAcento: b.colorAcento,
      nombreCompleto: b.nombreCompleto || '',
      fontPrincipal: b.fontPrincipal,
    }
    logoPreview.value = b.logo || ''
    bannerPreview.value = b.banner || ''
  }
})

function onLogoChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  logoArchivo.value = input.files[0]
  if (logoPreview.value && logoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoPreview.value = URL.createObjectURL(logoArchivo.value)
}

function onBannerChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  bannerArchivo.value = input.files[0]
  if (bannerPreview.value && bannerPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(bannerPreview.value)
  }
  bannerPreview.value = URL.createObjectURL(bannerArchivo.value)
}

async function subirImagen(archivo: File): Promise<string> {
  const fd = new FormData()
  fd.append('imagen', archivo)
  const { data } = await api.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}

const previewEstilo = computed(() => ({
  '--preview-primario': form.value.colorPrimario,
  '--preview-secundario': form.value.colorSecundario,
  '--preview-acento': form.value.colorAcento,
  fontFamily: `'${form.value.fontPrincipal}', sans-serif`,
}))

async function guardar() {
  guardando.value = true
  try {
    const payload: Record<string, unknown> = {
      colorPrimario: form.value.colorPrimario,
      colorSecundario: form.value.colorSecundario,
      colorAcento: form.value.colorAcento,
      nombreCompleto: form.value.nombreCompleto || null,
      fontPrincipal: form.value.fontPrincipal,
    }

    if (logoArchivo.value) {
      payload.logo = await subirImagen(logoArchivo.value)
    }
    if (bannerArchivo.value) {
      payload.banner = await subirImagen(bannerArchivo.value)
    }

    await brandingStore.updateBranding(payload)

    document.documentElement.style.setProperty('--color-primario', form.value.colorPrimario)
    document.documentElement.style.setProperty('--color-secundario', form.value.colorSecundario)
    document.documentElement.style.setProperty('--color-acento', form.value.colorAcento)
    document.documentElement.style.setProperty('--font-principal', `'${form.value.fontPrincipal}', sans-serif`)
    if (form.value.nombreCompleto) {
      document.title = form.value.nombreCompleto
    }

    logoArchivo.value = null
    bannerArchivo.value = null

    toast.success('Branding actualizado')
  } catch {
    toast.error('Error al guardar branding')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-4">Configuracion de Branding</h2>

    <div v-if="brandingStore.loading" class="text-center mt-4">
      <span class="spinner-border text-primary"></span>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-7">
        <form @submit.prevent="guardar" class="card p-4">
          <div class="mb-3">
            <label class="form-label">Logo</label>
            <input
              type="file"
              class="form-control"
              accept="image/*"
              @change="onLogoChange"
            >
            <div v-if="logoPreview" class="mt-2 text-center">
              <img
                :src="logoPreview"
                alt="Logo preview"
                class="rounded"
                style="max-width:140px;max-height:140px;object-fit:contain"
              >
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Banner</label>
            <input
              type="file"
              class="form-control"
              accept="image/*"
              @change="onBannerChange"
            >
            <div v-if="bannerPreview" class="mt-2 text-center">
              <img
                :src="bannerPreview"
                alt="Banner preview"
                class="rounded"
                style="width:100%;max-height:120px;object-fit:cover"
              >
            </div>
          </div>

          <hr>

          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label">Color Primario</label>
              <div class="d-flex align-items-center gap-2">
                <input
                  v-model="form.colorPrimario"
                  type="color"
                  class="form-control form-control-color"
                >
                <input
                  v-model="form.colorPrimario"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="#000000"
                >
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Color Secundario</label>
              <div class="d-flex align-items-center gap-2">
                <input
                  v-model="form.colorSecundario"
                  type="color"
                  class="form-control form-control-color"
                >
                <input
                  v-model="form.colorSecundario"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="#000000"
                >
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Color de Acento</label>
              <div class="d-flex align-items-center gap-2">
                <input
                  v-model="form.colorAcento"
                  type="color"
                  class="form-control form-control-color"
                >
                <input
                  v-model="form.colorAcento"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="#000000"
                >
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Nombre Completo</label>
            <input
              v-model="form.nombreCompleto"
              class="form-control"
              placeholder="Nombre del restaurante"
            >
          </div>

          <div class="mb-3">
            <label class="form-label">Fuente Principal</label>
            <select v-model="form.fontPrincipal" class="form-select">
              <option v-for="f in fuentes" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="guardando"
          >
            <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
            {{ guardando ? 'Guardando...' : 'Guardar Branding' }}
          </button>
        </form>
      </div>

      <div class="col-lg-5">
        <div class="card p-4">
          <h5 class="mb-3">Vista Previa</h5>
          <div
            class="preview-box"
            :style="previewEstilo"
          >
            <div class="preview-header" :style="{ background: form.colorPrimario }">
              <div
                v-if="logoPreview"
                class="preview-logo"
              >
                <img :src="logoPreview" alt="Logo">
              </div>
              <span class="preview-name" :style="{ color: '#fff' }">
                {{ form.nombreCompleto || 'Tu Restaurante' }}
              </span>
            </div>
            <div class="preview-body">
              <div class="preview-surface" :style="{ background: form.colorSecundario + '22', border: `1px solid ${form.colorSecundario}44` }">
                <span :style="{ color: form.colorSecundario }">Elemento secundario</span>
              </div>
              <button
                class="preview-btn"
                :style="{ background: form.colorAcento, color: '#fff' }"
              >
                Boton de Acento
              </button>
            </div>
            <div
              v-if="bannerPreview"
              class="preview-banner"
            >
              <img :src="bannerPreview" alt="Banner">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-control-color {
  width: 44px;
  height: 38px;
  padding: 2px;
  cursor: pointer;
}

.preview-box {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
}

.preview-logo img {
  height: 28px;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
}

.preview-name {
  font-weight: 600;
  font-size: 14px;
}

.preview-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-surface {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.preview-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
  cursor: default;
}

.preview-banner img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}
</style>
