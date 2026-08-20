import { defineStore } from 'pinia';
import api from '../services/api';

interface OnboardingState {
  stepCompleted: number;
  totalSteps: number;
  loading: boolean;
  error: string | null;
}

export const useOnboardingStore = defineStore('onboarding', {
  state: (): OnboardingState => ({
    stepCompleted: 0,
    totalSteps: 3,
    loading: false,
    error: null
  }),

  actions: {
    async fetchProgress() {
      this.loading = true;
      try {
        const { data } = await api.get('/onboarding');
        this.stepCompleted = data.stepCompleted;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async completarStep1(mesas: Array<{ numero: number; capacidad: number }>) {
      const { data } = await api.post('/onboarding/step1', { mesas });
      this.stepCompleted = data.stepCompleted;
    },

    async completarStep2(productos: Array<{ nombre: string; categoria: string; precioVenta: number }>) {
      const { data } = await api.post('/onboarding/step2', { productos });
      this.stepCompleted = data.stepCompleted;
    },

    async completarStep3(usuarios: Array<{ nombre: string; email: string; password: string; rol: string }>) {
      const { data } = await api.post('/onboarding/step3', { usuarios });
      this.stepCompleted = data.stepCompleted;
    }
  }
});