<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
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

useScrollAnimation()

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'light')
})

onUnmounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 scroll-smooth">
    <PublicHeader />
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DifferentiatorsSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
    <FooterSection />
  </div>
</template>
