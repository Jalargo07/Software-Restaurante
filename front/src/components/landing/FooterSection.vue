<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { LandingFooter } from '../../types'

const props = withDefaults(defineProps<{ data?: LandingFooter }>(), {
  data: () => ({
    marca: 'BiteOps',
    descripcion: 'El sistema operativo inteligente para restaurantes. Gestioná, optimizá y hacé crecer tu negocio.',
    grupos: [
      { titulo: 'Producto', links: [
        { label: 'Demo', href: '/menu/demo' },
        { label: 'Precios', href: '/' },
        { label: 'Sobre nosotros', href: '/sobre-nosotros' },
      ]},
      { titulo: 'Recursos', links: [
        { label: 'Blog', href: 'https://biteops-blush.vercel.app/blog' },
        { label: 'Contacto', href: '/contacto' },
      ]},
      { titulo: 'Legal', links: [
        { label: 'Privacidad', href: '/privacidad' },
        { label: 'Términos', href: '/terminos' },
        { label: 'Admin', href: '/login' },
      ]},
    ],
    copyright: '© 2026 BiteOps. Todos los derechos reservados.',
  }),
})

function esLinkInterno(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}
</script>

<template>
  <footer class="bg-gray-900 dark:bg-black text-gray-400 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            {{ data.marca }}
          </span>
          <p class="mt-3 text-sm leading-relaxed">
            {{ data.descripcion }}
          </p>
        </div>

        <div v-for="grupo in data.grupos" :key="grupo.titulo">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">{{ grupo.titulo }}</h3>
          <ul class="space-y-2">
            <li v-for="link in grupo.links" :key="link.label">
              <RouterLink v-if="esLinkInterno(link.href)" :to="link.href" class="text-sm hover:text-white transition-colors">{{ link.label }}</RouterLink>
              <a v-else :href="link.href" target="_blank" rel="noopener noreferrer" class="text-sm hover:text-white transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
        <p>{{ data.copyright }}</p>
      </div>
    </div>
  </footer>
</template>
