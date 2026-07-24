import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

registerSW({ immediate: true })

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
