<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <div class="toggle-grid">
      <label v-for="item in t.items" :key="item"><span>{{ item }}</span><input checked type="checkbox" /></label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const t = computed(() => ({
  FR: { title: 'Notifications', subtitle: 'Canaux et evenements declencheurs des alertes SmartCalyx.', items: ['Email', 'Application', 'Maintenance prevue', 'Nouvelle panne', 'Demande maintenance', 'Stock faible', 'Intervention terminee'] },
  EN: { title: 'Notifications', subtitle: 'Channels and events that trigger SmartCalyx alerts.', items: ['Email', 'Application', 'Scheduled maintenance', 'New breakdown', 'Maintenance request', 'Low stock', 'Completed intervention'] },
  AR: { title: 'الإشعارات', subtitle: 'القنوات والأحداث التي تطلق تنبيهات SmartCalyx.', items: ['البريد الإلكتروني', 'التطبيق', 'صيانة مبرمجة', 'عطل جديد', 'طلب صيانة', 'مخزون منخفض', 'تدخل منتهي'] },
})[languageStore.language] || {})
</script>

<style scoped>
@import './settings.css';
.toggle-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.toggle-grid label { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px; border: 1px solid #edf0e8; border-radius: 14px; background: #fbfcf8; color: #4a0a0a; font-weight: 900; }
.toggle-grid input { width: 18px; height: 18px; accent-color: #6a9a2a; }
@media (max-width: 760px) { .toggle-grid { grid-template-columns: 1fr; } }
</style>
