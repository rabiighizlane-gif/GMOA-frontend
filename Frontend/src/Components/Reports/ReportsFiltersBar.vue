<template>
  <section class="filters-bar">
    <select
      v-for="filter in filterGroups"
      :key="filter.key"
      :value="filters[filter.key]"
      @change="updateFilter(filter.key, $event.target.value)"
    >
      <option v-for="option in filter.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <button type="button" class="primary-button" @click="$emit('apply')">{{ content.apply }}</button>
    <button type="button" class="reset-button" @click="$emit('reset')">{{ content.reset }}</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

defineProps({ filters: { type: Object, required: true } })
const emit = defineEmits(['update-filter', 'apply', 'reset'])

const languageStore = useLanguageStore()
const content = computed(() => ({
  FR: { apply: 'Appliquer', reset: 'Reinitialiser' },
  EN: { apply: 'Apply', reset: 'Reset' },
  AR: { apply: 'تطبيق', reset: 'إعادة ضبط' },
})[languageStore.language] || {})

const labels = computed(() => ({
  FR: {
    period: ['Toutes les periodes', 'Juillet 2026', 'T2 2026', 'Annee 2026'],
    line: ['Toutes les lignes', 'Ligne Production 1', 'Ligne Production 2', 'Ligne Conditionnement', 'Ligne Utilites'],
    machine: ['Toutes les machines', 'M-102', 'M-215', 'M-309', 'M-412'],
    technician: ['Tous les techniciens', 'Nabil', 'Ahmed', 'Sara', 'Youssef'],
    maintenanceType: ['Tous les types', 'Corrective', 'Preventive', 'Amelioration'],
    status: ['Tous les statuts', 'Terminee', 'En cours', 'En attente'],
    priority: ['Toutes les priorites', 'Critique', 'Haute', 'Moyenne', 'Faible'],
  },
  EN: {
    period: ['All periods', 'July 2026', 'Q2 2026', 'Year 2026'],
    line: ['All lines', 'Production line 1', 'Production line 2', 'Conditioning line', 'Utilities line'],
    machine: ['All machines', 'M-102', 'M-215', 'M-309', 'M-412'],
    technician: ['All technicians', 'Nabil', 'Ahmed', 'Sara', 'Youssef'],
    maintenanceType: ['All types', 'Corrective', 'Preventive', 'Improvement'],
    status: ['All statuses', 'Completed', 'In progress', 'Pending'],
    priority: ['All priorities', 'Critical', 'High', 'Medium', 'Low'],
  },
  AR: {
    period: ['كل الفترات', 'يوليوز 2026', 'الربع الثاني 2026', 'سنة 2026'],
    line: ['كل الخطوط', 'خط الإنتاج 1', 'خط الإنتاج 2', 'خط التكييف', 'خط المرافق'],
    machine: ['كل الآلات', 'M-102', 'M-215', 'M-309', 'M-412'],
    technician: ['كل التقنيين', 'نبيل', 'أحمد', 'سارة', 'يوسف'],
    maintenanceType: ['كل الأنواع', 'تصحيحية', 'وقائية', 'تحسين'],
    status: ['كل الحالات', 'منتهية', 'قيد الإنجاز', 'في الانتظار'],
    priority: ['كل الأولويات', 'حرجة', 'عالية', 'متوسطة', 'منخفضة'],
  },
})[languageStore.language] || {})

const rawOptions = {
  period: ['', 'Juillet 2026', 'T2 2026', 'Année 2026'],
  line: ['', 'Ligne Production 1', 'Ligne Production 2', 'Ligne Conditionnement', 'Ligne Utilités'],
  machine: ['', 'M-102', 'M-215', 'M-309', 'M-412'],
  technician: ['', 'Nabil', 'Ahmed', 'Sara', 'Youssef'],
  maintenanceType: ['', 'Corrective', 'Préventive', 'Amélioration'],
  status: ['', 'Terminée', 'En cours', 'En attente'],
  priority: ['', 'Critique', 'Haute', 'Moyenne', 'Faible'],
}

const filterGroups = computed(() =>
  Object.entries(rawOptions).map(([key, values]) => ({
    key,
    options: values.map((value, index) => ({
      value,
      label: labels.value[key]?.[index] || value,
    })),
  })),
)

const updateFilter = (key, value) => emit('update-filter', { key, value })
</script>

<style scoped>
.filters-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; padding: 16px; background: white; border: 1px solid #edf0e8; border-radius: 18px; }
select, button { width: 100%; height: 44px; min-width: 0; padding: 0 12px; border-radius: 12px; font: inherit; font-size: 13px; font-weight: 800; }
select { background: white; border: 1px solid #e8ecdf; color: #4a0a0a; }
button { cursor: pointer; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
.reset-button { background: white; border: 1px solid #e8ecdf; color: #64748b; }
</style>
