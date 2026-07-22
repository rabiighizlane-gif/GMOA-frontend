<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <div class="choice-row">
      <button :class="{ active: currentTheme === 'Clair' }" type="button" @click="setTheme('Clair')">
        {{ t.light }}
      </button>
      <button :class="{ active: currentTheme === 'Sombre' }" type="button" @click="setTheme('Sombre')">
        {{ t.dark }}
      </button>
    </div>
    <div class="form-grid">
      <label>{{ t.primaryColor }}<input type="color" value="#6a9a2a" /></label>
      <label>{{ t.fontSize }}<select><option>{{ t.standard }}</option><option>{{ t.large }}</option><option>{{ t.compact }}</option></select></label>
      <label>{{ t.logo }}<input value="logo-smartcalyx.png" /></label>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const currentTheme = ref(loadTheme())
const t = computed(() => ({
  FR: { title: 'Apparence', subtitle: 'Theme visuel, couleur principale, typographie et logo.', light: 'Mode clair', dark: 'Mode sombre', primaryColor: 'Couleur principale', fontSize: 'Taille police', standard: 'Standard', large: 'Large', compact: 'Compacte', logo: 'Logo' },
  EN: { title: 'Appearance', subtitle: 'Visual theme, primary color, typography, and logo.', light: 'Light mode', dark: 'Dark mode', primaryColor: 'Primary color', fontSize: 'Font size', standard: 'Standard', large: 'Large', compact: 'Compact', logo: 'Logo' },
  AR: { title: 'المظهر', subtitle: 'الثيم البصري، اللون الرئيسي، الخط والشعار.', light: 'الوضع الفاتح', dark: 'الوضع الداكن', primaryColor: 'اللون الرئيسي', fontSize: 'حجم الخط', standard: 'عادي', large: 'كبير', compact: 'مضغوط', logo: 'الشعار' },
})[languageStore.language] || {})

function loadTheme() {
  try {
    const preferences = JSON.parse(localStorage.getItem('profilePreferences') || '{}')
    return preferences.theme === 'Sombre' ? 'Sombre' : 'Clair'
  } catch {
    return 'Clair'
  }
}

function setTheme(theme) {
  currentTheme.value = theme
  let preferences = {}

  try {
    preferences = JSON.parse(localStorage.getItem('profilePreferences') || '{}')
  } catch {
    preferences = {}
  }

  preferences.theme = theme
  localStorage.setItem('profilePreferences', JSON.stringify(preferences))
  document.documentElement.dataset.theme = theme === 'Sombre' ? 'dark' : 'light'
}
</script>

<style scoped>
@import './settings.css';
.choice-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.choice-row button { min-height: 42px; padding: 0 16px; border-radius: 8px; border: 1px solid rgba(210, 221, 234, 0.28); background: rgba(13, 21, 32, 0.82); color: #f2f6fb; font-weight: 900; }
.choice-row button.active { border-color: rgba(131, 185, 92, 0.56); background: rgba(131, 185, 92, 0.18); color: #bce39d; }
input[type='color'] { padding: 5px; }

:global(:root[data-theme='dark']) .choice-row button {
  border-color: #334155;
  background: #0f172a;
  color: #cbd5e1;
}

:global(:root[data-theme='dark']) .choice-row button.active {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}
</style>
