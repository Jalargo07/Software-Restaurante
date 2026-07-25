<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { LandingData } from '../../types'
import api from '../../services/api'
import PublicHeader from '../../components/public/PublicHeader.vue'
import HeroSection from '../../components/landing/HeroSection.vue'
import ProblemSection from '../../components/landing/ProblemSection.vue'
import SolutionSection from '../../components/landing/SolutionSection.vue'
import DifferentiatorsSection from '../../components/landing/DifferentiatorsSection.vue'
import PricingSection from '../../components/landing/PricingSection.vue'
import TestimonialsSection from '../../components/landing/TestimonialsSection.vue'
import CtaSection from '../../components/landing/CtaSection.vue'
import FooterSection from '../../components/landing/FooterSection.vue'
import { useScrollAnimation } from '../../composables/useScrollAnimation'

const data = ref<LandingData | null>(null)
const loading = ref(true)

useScrollAnimation()

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', 'light')
  try {
    const resp = await api.get('/public/landing')
    if (resp.data?.hero) {
      data.value = resp.data as LandingData
    }
  } catch {
    console.error('Error al cargar landing data')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 scroll-smooth">
    <PublicHeader />
    <main v-if="data">
      <HeroSection :data="data.hero" />
      <ProblemSection :data="data.problem" />
      <SolutionSection :data="data.solution" />
      <DifferentiatorsSection :data="data.differentiators" />
      <PricingSection :data="data.pricing" />
      <TestimonialsSection :data="data.testimonials" />
      <CtaSection :data="data.cta" />
    </main>
    <main v-else-if="!loading">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DifferentiatorsSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
    <FooterSection :data="data?.footer" />
  </div>
</template>
