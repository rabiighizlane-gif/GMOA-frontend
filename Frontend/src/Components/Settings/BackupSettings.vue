<template>
  <section class="settings-panel">
    <div class="panel-heading"><h2>{{ t.title }}</h2><p>{{ t.subtitle }}</p></div>
    <label class="single-toggle"><span>{{ t.auto }}</span><input checked type="checkbox" /></label>
    <div class="form-grid compact"><label>{{ t.every }}<select><option>{{ t.day }}</option><option>{{ t.week }}</option><option>{{ t.month }}</option></select></label></div>
    <div class="button-row"><button class="primary-action" type="button">{{ t.create }}</button><button type="button">{{ t.download }}</button><button type="button">{{ t.restore }}</button></div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
const languageStore = useLanguageStore()
const t = computed(() => ({
  FR: { title: 'Sauvegardes', subtitle: 'Planification, telechargement et restauration des backups.', auto: 'Sauvegarde automatique', every: 'Tous les', day: 'Jour', week: 'Semaine', month: 'Mois', create: 'Creer sauvegarde', download: 'Telecharger', restore: 'Restaurer' },
  EN: { title: 'Backups', subtitle: 'Backup scheduling, download, and restoration.', auto: 'Automatic backup', every: 'Every', day: 'Day', week: 'Week', month: 'Month', create: 'Create backup', download: 'Download', restore: 'Restore' },
  AR: { title: 'النسخ الاحتياطي', subtitle: 'جدولة النسخ، التحميل والاسترجاع.', auto: 'نسخ احتياطي تلقائي', every: 'كل', day: 'يوم', week: 'أسبوع', month: 'شهر', create: 'إنشاء نسخة', download: 'تحميل', restore: 'استرجاع' },
})[languageStore.language] || {})
</script>

<style scoped>
@import './settings.css';
.single-toggle { display: flex; justify-content: space-between; gap: 12px; padding: 15px; border: 1px solid rgba(126, 146, 170, 0.24); border-radius: 8px; background: rgba(13, 21, 32, 0.82); color: #f4f7fb; font-weight: 900; }
.single-toggle input { width: 18px; height: 18px; accent-color: #83b95c; }
.compact { margin-top: 16px; grid-template-columns: minmax(220px, 360px); }
.button-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.button-row button { min-height: 42px; padding: 0 14px; border: 1px solid rgba(210, 221, 234, 0.28); border-radius: 8px; background: rgba(13, 21, 32, 0.82); color: #f2f6fb; font-weight: 900; cursor: pointer; }
</style>
