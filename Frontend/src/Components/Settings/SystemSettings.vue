<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <div class="system-grid">
      <article v-for="item in items" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong></article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const t = computed(() => ({
  FR: { title: 'Systeme', subtitle: "Etat technique de la plateforme et informations d'exploitation.", labels: ['Version SmartCalyx', 'Version API', 'Base de donnees', 'Serveur', 'Derniere sauvegarde', 'Espace disque', 'Utilisateurs actifs'], disk: '68 % utilise' },
  EN: { title: 'System', subtitle: 'Technical platform status and operating information.', labels: ['SmartCalyx version', 'API version', 'Database', 'Server', 'Last backup', 'Disk space', 'Active users'], disk: '68% used' },
  AR: { title: 'النظام', subtitle: 'الحالة التقنية للمنصة ومعلومات التشغيل.', labels: ['إصدار SmartCalyx', 'إصدار API', 'قاعدة البيانات', 'الخادم', 'آخر نسخة احتياطية', 'مساحة القرص', 'المستخدمون النشطون'], disk: '68 % مستعمل' },
})[languageStore.language] || {})
const items = computed(() => {
  const values = ['1.0.0', 'v1', 'PostgreSQL', 'Production', '18/07/2026 03:00', t.value.disk, '24']
  return t.value.labels.map((label, index) => ({ label, value: values[index] }))
})
</script>

<style scoped>
@import './settings.css';
.system-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.system-grid article { padding: 16px; border: 1px solid #edf0e8; border-radius: 16px; background: #fbfcf8; }
.system-grid span { display: block; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
[dir='rtl'] .system-grid span { text-transform: none; }
.system-grid strong { display: block; margin-top: 8px; color: #4a0a0a; font-size: 17px; font-weight: 950; }
@media (max-width: 900px) { .system-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .system-grid { grid-template-columns: 1fr; } }
</style>
