<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  <div class="max-w-7xl mx-auto px-4 pt-4">
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Configuración de Branding</h2>

    <div v-if="brandingStore.loading" class="text-center mt-4">
      <span class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full text-[var(--color-primario)]"></span>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-7">
        <form @submit.prevent="guardar" class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
            <input
              type="file"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
              accept="image/*"
              @change="onLogoChange"
            >
            <div v-if="logoPreview" class="mt-2 text-center">
              <img
                :src="logoPreview"
                alt="Logo preview"
                class="rounded-lg max-w-[140px] max-h-[140px] object-contain mx-auto"
              >
            </div>
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner</label>
            <input
              type="file"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
              accept="image/*"
              @change="onBannerChange"
            >
            <div v-if="bannerPreview" class="mt-2 text-center">
              <img
                :src="bannerPreview"
                alt="Banner preview"
                class="rounded-lg w-full max-h-[120px] object-cover"
              >
            </div>
          </div>

          <hr class="border-gray-200 dark:border-gray-700 my-4">

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Primario</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.colorPrimario"
                  type="color"
                  class="w-11 h-[38px] p-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                >
                <input
                  v-model="form.colorPrimario"
                  type="text"
                  class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
                  placeholder="#000000"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Secundario</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.colorSecundario"
                  type="color"
                  class="w-11 h-[38px] p-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                >
                <input
                  v-model="form.colorSecundario"
                  type="text"
                  class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
                  placeholder="#000000"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color de Acento</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.colorAcento"
                  type="color"
                  class="w-11 h-[38px] p-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                >
                <input
                  v-model="form.colorAcento"
                  type="text"
                  class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
                  placeholder="#000000"
                >
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
            <input
              v-model="form.nombreCompleto"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500"
              placeholder="Nombre del restaurante"
            >
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuente Principal</label>
            <select v-model="form.fontPrincipal" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primario)] focus:border-blue-500">
              <option v-for="f in fuentes" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primario)] hover:brightness-90 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-[var(--color-primario)] focus:outline-none"
            :disabled="guardando"
          >
            <span v-if="guardando" class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
            {{ guardando ? 'Guardando...' : 'Guardar Branding' }}
          </button>
        </form>
      </div>

      <div class="lg:col-span-5">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h5 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Vista Previa</h5>
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
            :style="previewEstilo"
          >
            <div class="flex items-center gap-2.5 px-4 py-3.5" :style="{ background: form.colorPrimario }">
              <div
                v-if="logoPreview"
                class="shrink-0"
              >
                <img :src="logoPreview" alt="Logo" class="h-7 w-auto object-contain rounded">
              </div>
              <span class="font-semibold text-sm" :style="{ color: '#fff' }">
                {{ form.nombreCompleto || 'Tu Restaurante' }}
              </span>
            </div>
            <div class="p-4 flex flex-col gap-3">
              <div class="px-3.5 py-2.5 rounded-lg text-sm" :style="{ background: form.colorSecundario + '22', border: `1px solid ${form.colorSecundario}44` }">
                <span :style="{ color: form.colorSecundario }">Elemento secundario</span>
              </div>
              <button
                class="px-4 py-2 rounded-lg font-medium text-sm cursor-default"
                :style="{ background: form.colorAcento, color: '#fff' }"
              >
                Boton de Acento
              </button>
            </div>
            <div
              v-if="bannerPreview"
            >
              <img :src="bannerPreview" alt="Banner" class="w-full h-20 object-cover">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
