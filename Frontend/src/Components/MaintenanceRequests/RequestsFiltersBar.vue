<template>
  <section class="filters-bar" :dir="pageDirection">
    <div class="search-wrapper">
      <span></span>
      <input :value="filters.search" type="search" :placeholder="t.search" @input="updateFilter('search', $event.target.value)" />
    </div>

    <select :value="filters.machine" @change="updateFilter('machine', $event.target.value)">
      <option value="">{{ t.allMachines }}</option>
      <option v-for="machine in machines" :key="machine" :value="machine">{{ translate('machines', machine) }}</option>
    </select>

    <select :value="filters.line" @change="updateFilter('line', $event.target.value)">
      <option value="">{{ t.allLines }}</option>
      <option v-for="line in lines" :key="line" :value="line">{{ translate('lines', line) }}</option>
    </select>

    <select :value="filters.priority" @change="updateFilter('priority', $event.target.value)">
      <option value="">{{ t.allPriorities }}</option>
      <option v-for="priority in priorities" :key="priority" :value="priority">{{ translate('priorities', priority) }}</option>
    </select>

    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">{{ t.allStatuses }}</option>
      <option v-for="status in statuses" :key="status" :value="status">{{ translate('statuses', status) }}</option>
    </select>

    <select :value="filters.requester" @change="updateFilter('requester', $event.target.value)">
      <option value="">{{ t.allRequesters }}</option>
      <option v-for="requester in requesters" :key="requester" :value="requester">{{ translate('names', requester) }}</option>
    </select>

    <select :value="filters.period" @change="updateFilter('period', $event.target.value)">
      <option value="">{{ t.allPeriods }}</option>
      <option value="today">{{ t.today }}</option>
      <option value="week">{{ t.week }}</option>
      <option value="month">{{ t.month }}</option>
    </select>

    <button type="button" class="reset-button" @click="$emit('reset')">{{ t.reset }}</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  filters: { type: Object, required: true },
  machines: { type: Array, default: () => [] },
  lines: { type: Array, default: () => [] },
  requesters: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-filter', 'reset'])
const languageStore = useLanguageStore()
const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const priorities = ['Critique', 'Haute', 'Moyenne', 'Faible']
const statuses = ['Brouillon', 'En attente', 'Acceptee', 'Refusee', 'Informations demandees', 'Intervention creee']

const labels = {
  FR: {
    search: 'Rechercher par ID, machine, demandeur...',
    allMachines: 'Toutes les machines',
    allLines: 'Toutes les lignes',
    allPriorities: 'Toutes les priorites',
    allStatuses: 'Tous les statuts',
    allRequesters: 'Tous les demandeurs',
    allPeriods: 'Toutes les periodes',
    today: "Aujourd'hui",
    week: 'Cette semaine',
    month: 'Ce mois',
    reset: 'Reinitialiser',
  },
  EN: {
    search: 'Search by ID, machine, requester...',
    allMachines: 'All machines',
    allLines: 'All lines',
    allPriorities: 'All priorities',
    allStatuses: 'All statuses',
    allRequesters: 'All requesters',
    allPeriods: 'All periods',
    today: 'Today',
    week: 'This week',
    month: 'This month',
    reset: 'Reset',
  },
  AR: {
    search: 'ابحث بالمعرف أو الآلة أو مقدم الطلب...',
    allMachines: 'كل الآلات',
    allLines: 'كل الخطوط',
    allPriorities: 'كل الأولويات',
    allStatuses: 'كل الحالات',
    allRequesters: 'كل مقدمي الطلب',
    allPeriods: 'كل الفترات',
    today: 'اليوم',
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
    reset: 'إعادة ضبط',
  },
}

const dictionaries = {
  FR: {
    machines: {},
    lines: {},
    names: {},
    priorities: { Critique: 'Critique', Haute: 'Haute', Moyenne: 'Moyenne', Faible: 'Faible' },
    statuses: { Brouillon: 'Brouillon', 'En attente': 'En attente', Acceptee: 'Acceptee', Refusee: 'Refusee', 'Informations demandees': 'Informations demandees', 'Intervention creee': 'Intervention creee' },
  },
  EN: {
    machines: { 'Convoyeur M-309': 'Conveyor M-309', 'Pasteurisateur P-204': 'Pasteurizer P-204', 'Compresseur M-412': 'Compressor M-412', 'Remplisseuse R-118': 'Filling machine R-118', "Tour d'usinage M-102": 'Machining lathe M-102' },
    lines: { 'Ligne Conditionnement': 'Packaging line', 'Ligne Production 1': 'Production line 1', 'Ligne Utilites': 'Utilities line' },
    names: {},
    priorities: { Critique: 'Critical', Haute: 'High', Moyenne: 'Medium', Faible: 'Low' },
    statuses: { Brouillon: 'Draft', 'En attente': 'Pending', Acceptee: 'Accepted', Refusee: 'Rejected', 'Informations demandees': 'Information requested', 'Intervention creee': 'Intervention created' },
  },
  AR: {
    machines: { 'Convoyeur M-309': 'ناقل M-309', 'Pasteurisateur P-204': 'مبستر P-204', 'Compresseur M-412': 'ضاغط M-412', 'Remplisseuse R-118': 'آلة تعبئة R-118', "Tour d'usinage M-102": 'مخرطة تصنيع M-102' },
    lines: { 'Ligne Conditionnement': 'خط التكييف', 'Ligne Production 1': 'خط الإنتاج 1', 'Ligne Utilites': 'خط المرافق' },
    names: { 'Ahmed El Mansouri': 'أحمد المنصوري', 'Sara El Idrissi': 'سارة الإدريسي', 'Youssef Berrada': 'يوسف برادة', 'Nabil Amrani': 'نبيل العمراني', 'Karim El Fassi': 'كريم الفاسي' },
    priorities: { Critique: 'حرجة', Haute: 'عالية', Moyenne: 'متوسطة', Faible: 'منخفضة' },
    statuses: { Brouillon: 'مسودة', 'En attente': 'في الانتظار', Acceptee: 'مقبولة', Refusee: 'مرفوضة', 'Informations demandees': 'معلومات مطلوبة', 'Intervention creee': 'تم إنشاء تدخل' },
  },
}

const t = computed(() => labels[languageStore.language] || labels.FR)
const dictionary = computed(() => dictionaries[languageStore.language] || dictionaries.FR)

function translate(group, value) {
  return dictionary.value[group]?.[value] || value
}

const updateFilter = (key, value) => emit('update-filter', { key, value })
</script>

<style scoped>
.filters-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 18px;
}
.search-wrapper {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: #fafbf7;
  border: 1px solid #e8ecdf;
  border-radius: 12px;
}
.search-wrapper span {
  width: 16px;
  height: 16px;
  border: 2px solid #4a0a0a;
  border-radius: 50%;
  position: relative;
}
.search-wrapper span::after {
  content: '';
  position: absolute;
  width: 7px;
  height: 2px;
  right: -5px;
  bottom: -3px;
  background: #4a0a0a;
  transform: rotate(-45deg);
}
.search-wrapper input {
  width: 100%;
  height: 42px;
  background: transparent;
  border: 0;
  outline: none;
  color: #111827;
}
select,
button {
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}
select {
  background: white;
  border: 1px solid #e8ecdf;
  color: #4a0a0a;
  text-overflow: ellipsis;
}
.reset-button {
  background: white;
  border: 1px solid #e8ecdf;
  color: #64748b;
  cursor: pointer;
}
@media (max-width: 1500px) {
  .filters-bar { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .search-wrapper { grid-column: span 3; }
}
@media (max-width: 760px) {
  .filters-bar { grid-template-columns: 1fr; }
  .search-wrapper { grid-column: auto; }
}
</style>
