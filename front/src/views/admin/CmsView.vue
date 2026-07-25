<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCmsStore } from '../../stores/cms'
import { useToastStore } from '../../stores/toast'
import type { LandingData } from '../../types'

const cmsStore = useCmsStore()
const toast = useToastStore()

const data = ref<LandingData | null>(null)
const seccionActiva = ref('hero')
const guardando = ref(false)

onMounted(async () => {
  await cmsStore.fetchLanding()
  if (cmsStore.data) {
    data.value = JSON.parse(JSON.stringify(cmsStore.data))
  }
})

async function guardar() {
  if (!data.value) return
  guardando.value = true
  try {
    await cmsStore.updateLanding(data.value)
    toast.success('Contenido guardado exitosamente')
  } catch {
    toast.error('Error al guardar contenido')
  } finally { guardando.value = false }
}
</script>

<template>
  <div class="flex h-[calc(100vh-73px)] bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar secciones -->
    <aside class="w-20 lg:w-24 bg-[#047857] flex flex-col items-center py-4 gap-1 overflow-y-auto flex-shrink-0">
      <button v-for="s in [ 'hero', 'problem', 'solution', 'diff', 'pricing', 'testimonials', 'cta', 'footer' ]" :key="s"
        @click="seccionActiva = s"
        class="w-16 lg:w-20 py-3 rounded-xl text-center text-xs font-medium transition-all"
        :class="seccionActiva === s ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'">
        <div class="text-xl mb-0.5">
          {{ { hero: '🏠', problem: '⚠️', solution: '✅', diff: '⚖️', pricing: '💰', testimonials: '⭐', cta: '📣', footer: '🔗' }[s] }}
        </div>
        <span class="text-[10px] leading-tight">{{ { hero: 'Hero', problem: 'Problemas', solution: 'Solución', diff: 'Diferenciadores', pricing: 'Precios', testimonials: 'Testimonios', cta: 'CTA', footer: 'Footer' }[s] }}</span>
      </button>
    </aside>

    <!-- Contenido -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">CMS — Landing Page</h2>
        <button @click="guardar" :disabled="guardando || !data"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          <span v-if="guardando" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      <!-- HERO -->
      <div v-if="data && seccionActiva === 'hero'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Hero Section</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
            <input v-model="data.hero.logo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div class="flex items-end">
            <img v-if="data.hero.logo" :src="data.hero.logo" class="h-10 object-contain rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input v-model="data.hero.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Palabra destacada (gradiente)</label>
            <input v-model="data.hero.tituloGradiente" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label>
            <textarea v-model="data.hero.subtitulo" rows="2" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Principal — Texto</label>
            <input v-model="data.hero.ctaPrincipal.texto" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Principal — Link</label>
            <input v-model="data.hero.ctaPrincipal.link" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Secundario — Texto</label>
            <input v-model="data.hero.ctaSecundario.texto" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Secundario — Link</label>
            <input v-model="data.hero.ctaSecundario.link" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <!-- PROBLEM -->
      <div v-if="data && seccionActiva === 'problem'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Sección Problemas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input v-model="data.problem.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label>
            <input v-model="data.problem.subtitulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
          </div>
        </div>
        <div v-for="(item, i) in data.problem.items" :key="i" class="flex gap-3 items-start mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div class="w-10 text-center text-xl">{{ item.icon }}</div>
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input v-model="item.titulo" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Título" />
            <input v-model="item.icon" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm w-20" placeholder="icono" />
            <div class="md:col-span-2">
              <textarea v-model="item.descripcion" rows="2" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Descripción"></textarea>
            </div>
          </div>
          <button @click="data.problem.items.splice(i, 1)" class="text-red-500 hover:text-red-700 text-lg">&times;</button>
        </div>
        <button @click="data.problem.items.push({ icon: '✨', titulo: '', descripcion: '' })" class="text-sm text-[#059669] hover:text-[#047857] font-medium">+ Agregar item</button>
      </div>

      <!-- SOLUTION -->
      <div v-if="data && seccionActiva === 'solution'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Sección Solución</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label><input v-model="data.solution.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label><input v-model="data.solution.subtitulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
        </div>
        <div v-for="(item, i) in data.solution.items" :key="i" class="flex gap-3 items-start mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div class="w-10 text-center text-xl">{{ item.icon }}</div>
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input v-model="item.titulo" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Título" />
            <input v-model="item.icon" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm w-20" placeholder="icono" />
            <div class="md:col-span-2"><textarea v-model="item.descripcion" rows="2" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Descripción"></textarea></div>
          </div>
          <button @click="data.solution.items.splice(i, 1)" class="text-red-500 hover:text-red-700 text-lg">&times;</button>
        </div>
        <button @click="data.solution.items.push({ icon: '✨', titulo: '', descripcion: '' })" class="text-sm text-[#059669] hover:text-[#047857] font-medium">+ Agregar item</button>
      </div>

      <!-- DIFFERENTIATORS -->
      <div v-if="data && seccionActiva === 'diff'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Diferenciadores</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label><input v-model="data.differentiators.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label><input v-model="data.differentiators.subtitulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
        </div>
        <div class="space-y-2">
          <div v-for="(item, i) in data.differentiators.items" :key="i" class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <input v-model="item.feature" class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            <label class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><input type="checkbox" v-model="item.biteops" class="rounded" /> BiteOps</label>
            <label class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"><input type="checkbox" v-model="item.competencia" class="rounded" /> Otros</label>
            <button @click="data.differentiators.items.splice(i, 1)" class="text-red-500 hover:text-red-700">&times;</button>
          </div>
          <button @click="data.differentiators.items.push({ feature: '', biteops: true, competencia: false })" class="text-sm text-[#059669] hover:text-[#047857] font-medium">+ Agregar feature</button>
        </div>
      </div>

      <!-- PRICING -->
      <div v-if="data && seccionActiva === 'pricing'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Planes y Precios</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label><input v-model="data.pricing.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label><input v-model="data.pricing.subtitulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
        </div>
        <div v-for="(plan, i) in data.pricing.planes" :key="i" class="border border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-gray-900 dark:text-white">{{ plan.nombre }}</h4>
            <label class="flex items-center gap-1 text-xs"><input type="checkbox" v-model="plan.destacado" class="rounded" /> Destacado</label>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div><label class="text-xs text-gray-500">Precio/mes</label><input v-model="plan.precio" type="number" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
            <div><label class="text-xs text-gray-500">Comisión</label><input v-model="plan.comision" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
            <div><label class="text-xs text-gray-500">Plan ID</label><input v-model="plan.planId" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          </div>
          <div><label class="text-xs text-gray-500">Descripción</label><textarea v-model="plan.descripcion" rows="2" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm mb-3"></textarea></div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">Features</label>
            <div v-for="(f, fi) in plan.features" :key="fi" class="flex items-center gap-2 mb-1">
              <input v-model="plan.features[fi]" class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs" />
              <button @click="plan.features.splice(fi, 1)" class="text-red-500 text-xs">&times;</button>
            </div>
            <button @click="plan.features.push('')" class="text-xs text-[#059669] hover:text-[#047857] mt-1">+ Feature</button>
          </div>
        </div>
      </div>

      <!-- TESTIMONIALS -->
      <div v-if="data && seccionActiva === 'testimonials'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Testimonios</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label><input v-model="data.testimonials.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label><input v-model="data.testimonials.subtitulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
        </div>
        <div v-for="(item, i) in data.testimonials.items" :key="i" class="flex gap-3 items-start mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input v-model="item.nombre" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Nombre" />
            <input v-model="item.cargo" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Cargo" />
            <div class="md:col-span-2"><textarea v-model="item.texto" rows="2" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Testimonio"></textarea></div>
            <div><label class="text-xs text-gray-500">Iniciales</label><input v-model="item.iniciales" class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm w-16" /></div>
          </div>
          <button @click="data.testimonials.items.splice(i, 1)" class="text-red-500 hover:text-red-700 text-lg">&times;</button>
        </div>
        <button @click="data.testimonials.items.push({ nombre: '', cargo: '', texto: '', iniciales: '' })" class="text-sm text-[#059669] hover:text-[#047857] font-medium">+ Agregar testimonio</button>
      </div>

      <!-- CTA -->
      <div v-if="data && seccionActiva === 'cta'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">CTA Section</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label><input v-model="data.cta.titulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label><input v-model="data.cta.subtitulo" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Botón — Texto</label><input v-model="data.cta.boton.texto" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Botón — Link</label><input v-model="data.cta.boton.link" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
        </div>
      </div>

      <!-- FOOTER -->
      <div v-if="data && seccionActiva === 'footer'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Footer</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label><input v-model="data.footer.marca" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label><input v-model="data.footer.descripcion" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
          <div class="md:col-span-3"><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright</label><input v-model="data.footer.copyright" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" /></div>
        </div>
        <div v-for="(grupo, gi) in data.footer.grupos" :key="gi" class="border border-gray-200 dark:border-gray-600 rounded-xl p-3 mb-3">
          <div class="flex items-center gap-3 mb-2">
            <input v-model="grupo.titulo" class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" placeholder="Título del grupo" />
            <button @click="data.footer.grupos.splice(gi, 1)" class="text-red-500 text-sm">&times;</button>
          </div>
          <div v-for="(link, li) in grupo.links" :key="li" class="flex items-center gap-2 mb-1 ml-4">
            <input v-model="link.label" class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs" placeholder="Label" />
            <input v-model="link.href" class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs" placeholder="URL" />
            <button @click="grupo.links.splice(li, 1)" class="text-red-500 text-xs">&times;</button>
          </div>
          <button @click="grupo.links.push({ label: '', href: '' })" class="text-xs text-[#059669] hover:text-[#047857] mt-1 ml-4">+ Link</button>
        </div>
        <button @click="data.footer.grupos.push({ titulo: '', links: [] })" class="text-sm text-[#059669] hover:text-[#047857] font-medium">+ Agregar grupo</button>
      </div>

      <p v-if="!data" class="text-center text-gray-500 py-12">Cargando contenido...</p>
    </div>
  </div>
</template>
