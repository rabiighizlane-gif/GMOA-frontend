<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <div class="choice-row"><button class="active" type="button">{{ t.light }}</button><button type="button">{{ t.dark }}</button></div>
    <div class="form-grid">
      <label>{{ t.primaryColor }}<input type="color" value="#6a9a2a" /></label>
      <label>{{ t.fontSize }}<select><option>{{ t.standard }}</option><option>{{ t.large }}</option><option>{{ t.compact }}</option></select></label>
      <label>{{ t.logo }}<input value="logo-smartcalyx.png" /></label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const t = computed(() => ({
  FR: { title: 'Apparence', subtitle: 'Theme visuel, couleur principale, typographie et logo.', light: 'Mode clair', dark: 'Mode sombre', primaryColor: 'Couleur principale', fontSize: 'Taille police', standard: 'Standard', large: 'Large', compact: 'Compacte', logo: 'Logo' },
  EN: { title: 'Appearance', subtitle: 'Visual theme, primary color, typography, and logo.', light: 'Light mode', dark: 'Dark mode', primaryColor: 'Primary color', fontSize: 'Font size', standard: 'Standard', large: 'Large', compact: 'Compact', logo: 'Logo' },
  AR: { title: 'المظهر', subtitle: 'الثيم البصري، اللون الرئيسي، الخط والشعار.', light: 'الوضع الفاتح', dark: 'الوضع الداكن', primaryColor: 'اللون الرئيسي', fontSize: 'حجم الخط', standard: 'عادي', large: 'كبير', compact: 'مضغوط', logo: 'الشعار' },
})[languageStore.language] || {})
</script>

<style scoped>
@import './settings.css';
.choice-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.choice-row button { min-height: 42px; padding: 0 16px; border-radius: 12px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; }
.choice-row button.active { border-color: #b6c65b; background: #eef5df; color: #6a9a2a; }
input[type='color'] { padding: 5px; }
</style>
