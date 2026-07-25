<script setup lang="ts">
const productLinks = [
  { label: 'Funciones', href: '#features' },
  { label: 'Precios', href: '#pricing' },
  { label: 'Demo', href: 'https://biteops.app/demo' },
]

const companyLinks = [
  { label: 'Sobre nosotros', href: 'https://biteops.app/about' },
  { label: 'Blog', href: 'https://blog.biteops.app' },
  { label: 'Contacto', href: 'mailto:contacto@biteops.app' },
]

const legalLinks = [
  { label: 'Privacidad', href: 'https://biteops.app/privacidad' },
  { label: 'Términos', href: 'https://biteops.app/terminos' },
]
</script>

<template>
  <footer class="bg-gray-900 dark:bg-black text-gray-400 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            BiteOps
          </span>
          <p class="mt-3 text-sm leading-relaxed">
            El sistema operativo de tu restaurante. Gestiona todo desde un solo lugar.
          </p>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Producto</h4>
          <ul class="space-y-2">
            <li v-for="link in productLinks" :key="link.label">
              <a :href="link.href" class="text-sm hover:text-white transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Empresa</h4>
          <ul class="space-y-2">
            <li v-for="link in companyLinks" :key="link.label">
              <a :href="link.href" class="text-sm hover:text-white transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
          <ul class="space-y-2">
            <li v-for="link in legalLinks" :key="link.label">
              <a :href="link.href" class="text-sm hover:text-white transition-colors">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
        <p>&copy; {{ new Date().getFullYear() }} BiteOps. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>
