import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('light');
  const userOverride = ref(false);

  function init() {
    const stored = localStorage.getItem('theme');

    if (stored) {
      theme.value = stored as 'light' | 'dark';
      userOverride.value = true;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme.value = prefersDark ? 'dark' : 'light';

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!userOverride.value) {
          theme.value = e.matches ? 'dark' : 'light';
        }
      });
    }

    applyTheme();
  }

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    userOverride.value = true;
    localStorage.setItem('theme', theme.value);
    applyTheme();
  }

  function applyTheme() {
    if (theme.value === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  return { theme, userOverride, init, toggle };
});
