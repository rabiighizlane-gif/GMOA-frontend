<template>
  <div class="export-actions">
    <select :value="period" @change="$emit('update:period', $event.target.value)">
      <option v-for="option in periodOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <select :value="reportType" @change="$emit('update:reportType', $event.target.value)">
      <option v-for="type in reportTypes" :key="type.id" :value="type.id">{{ type.label }}</option>
    </select>
    <button type="button" class="secondary-button" @click="$emit('export-pdf')">{{ content.exportPdf }}</button>
    <button type="button" class="secondary-button" @click="$emit('export-excel')">{{ content.exportExcel }}</button>
    <button type="button" class="primary-button" @click="$emit('generate')">{{ content.generate }}</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  period: { type: String, required: true },
  reportType: { type: String, required: true },
  reportTypes: { type: Array, default: () => [] }
})
defineEmits(['update:period', 'update:reportType', 'export-pdf', 'export-excel', 'generate'])

const languageStore = useLanguageStore()
const content = computed(() => ({
  FR: { exportPdf: 'Export PDF', exportExcel: 'Export Excel', generate: 'Generer rapport' },
  EN: { exportPdf: 'Export PDF', exportExcel: 'Export Excel', generate: 'Generate report' },
  AR: { exportPdf: 'تصدير PDF', exportExcel: 'تصدير Excel', generate: 'إنشاء تقرير' },
})[languageStore.language] || {})

const periodOptions = computed(() => {
  const labels = {
    FR: ['Juillet 2026', 'T2 2026', 'Annee 2026'],
    EN: ['July 2026', 'Q2 2026', 'Year 2026'],
    AR: ['يوليوز 2026', 'الربع الثاني 2026', 'سنة 2026'],
  }[languageStore.language] || ['Juillet 2026', 'T2 2026', 'Annee 2026']
  const values = ['Juillet 2026', 'T2 2026', 'Année 2026']

  return values.map((value, index) => ({ value, label: labels[index] }))
})
</script>

<style scoped>
.export-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
select, button { min-height: 44px; padding: 0 14px; border-radius: 12px; font: inherit; font-weight: 900; }
select { min-width: 160px; background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
button { cursor: pointer; }
.secondary-button { background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
[dir='rtl'] .export-actions { justify-content: flex-start; }
@media (max-width: 760px) { .export-actions, select, button { width: 100%; } }
</style>
