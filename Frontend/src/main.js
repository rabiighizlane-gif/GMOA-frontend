import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import VueApexCharts from 'vue3-apexcharts'

function applyStoredTheme() {
  try {
    const preferences = JSON.parse(localStorage.getItem('profilePreferences') || '{}')
    document.documentElement.dataset.theme = preferences.theme === 'Sombre' ? 'dark' : 'light'
  } catch {
    document.documentElement.dataset.theme = 'light'
  }
}

applyStoredTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)

app.mount('#app')
