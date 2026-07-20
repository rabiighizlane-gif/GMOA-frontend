<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <div class="choice-row">
      <button :class="{ active: language === 'FR' }" type="button">Français</button>
      <button :class="{ active: language === 'EN' }" type="button">English</button>
      <button :class="{ active: language === 'AR' }" type="button">العربية</button>
    </div>
    <div class="form-grid">
      <label>{{ t.dateFormat }}<select><option>18/07/2026</option><option>2026-07-18</option></select></label>
      <label>{{ t.timeFormat }}<select><option>24h - 20:55</option><option>12h - 08:55 PM</option></select></label>
      <label>{{ t.currencyFormat }}<select><option>{{ t.dhFormat }}</option><option>MAD 48,600</option></select></label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const t = computed(() => ({
  FR: { title: 'Langues & region', subtitle: "Langue d'interface, formats regionaux et presentation des donnees.", dateFormat: 'Format date', timeFormat: 'Format heure', currencyFormat: 'Format devise', dhFormat: '48 600 DH' },
  EN: { title: 'Language & region', subtitle: 'Interface language, regional formats, and data display.', dateFormat: 'Date format', timeFormat: 'Time format', currencyFormat: 'Currency format', dhFormat: '48,600 DH' },
  AR: { title: 'اللغات والمنطقة', subtitle: 'لغة الواجهة، الصيغ الجهوية وطريقة عرض البيانات.', dateFormat: 'صيغة التاريخ', timeFormat: 'صيغة الوقت', currencyFormat: 'صيغة العملة', dhFormat: '48 600 درهم' },
})[language.value] || {})
</script>

<style scoped>
@import './settings.css';
.choice-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
.choice-row button { min-height: 42px; padding: 0 16px; border-radius: 12px; border: 1px solid #dfe5d6; background: white; color: #4a0a0a; font-weight: 900; }
.choice-row button.active { border-color: #b6c65b; background: #eef5df; color: #6a9a2a; }
</style>
