<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <span>&#8981;</span>
      <input :value="filters.search" type="search" :placeholder="content.search" @input="updateFilter('search', $event.target.value)" />
    </div>
    <select :value="filters.line" @change="updateFilter('line', $event.target.value)">
      <option value="">{{ content.allLines }}</option>
      <option v-for="line in lines" :key="line" :value="line">{{ displayLine(line) }}</option>
    </select>
    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">{{ content.allStatuses }}</option>
      <option value="En service">{{ content.statuses.service }}</option>
      <option value="En maintenance">{{ content.statuses.maintenance }}</option>
      <option value="En panne">{{ content.statuses.breakdown }}</option>
      <option value="Hors service">{{ content.statuses.offline }}</option>
    </select>
    <select :value="filters.category" @change="updateFilter('category', $event.target.value)">
      <option value="">{{ content.allCategories }}</option>
      <option v-for="category in categories" :key="category" :value="category">{{ displayCategory(category) }}</option>
    </select>
    <select :value="filters.criticality" @change="updateFilter('criticality', $event.target.value)">
      <option value="">{{ content.allCriticalities }}</option>
      <option value="Critique">{{ content.criticalities.critical }}</option>
      <option value="Haute">{{ content.criticalities.high }}</option>
      <option value="Moyenne">{{ content.criticalities.medium }}</option>
      <option value="Faible">{{ content.criticalities.low }}</option>
    </select>
    <button type="button" class="reset-button" @click="$emit('reset')">{{ content.reset }}</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  filters: { type: Object, required: true },
  lines: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  content: { type: Object, required: true },
})

const emit = defineEmits(['update-filter', 'reset'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translatedValues = {
  EN: {
    categories: { Mecanique: 'Mechanical', Hydraulique: 'Hydraulic', Conditionnement: 'Packaging', Pneumatique: 'Pneumatic', Electrique: 'Electrical' },
    lines: { 'Ligne Production 1': 'Production Line 1', 'Ligne Production 2': 'Production Line 2', 'Ligne Conditionnement': 'Packaging Line', 'Ligne Utilites': 'Utilities Line' },
  },
  AR: {
    categories: {
      Mecanique: '\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a\u0629',
      Hydraulique: '\u0647\u064a\u062f\u0631\u0648\u0644\u064a\u0643\u064a\u0629',
      Conditionnement: '\u0627\u0644\u062a\u0639\u0628\u0626\u0629',
      Pneumatique: '\u0647\u0648\u0627\u0626\u064a\u0629',
      Electrique: '\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629',
    },
    lines: {
      'Ligne Production 1': '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c 1',
      'Ligne Production 2': '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c 2',
      'Ligne Conditionnement': '\u062e\u0637 \u0627\u0644\u062a\u0639\u0628\u0626\u0629',
      'Ligne Utilites': '\u062e\u0637 \u0627\u0644\u0645\u0631\u0627\u0641\u0642',
    },
  },
}

const updateFilter = (key, value) => emit('update-filter', { key, value })
const displayCategory = (category) => translatedValues[language.value]?.categories?.[category] || category
const displayLine = (line) => translatedValues[language.value]?.lines?.[line] || line
</script>

<style scoped>
.filters-bar {
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) repeat(4, minmax(170px, 1fr)) auto;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 18px;
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: #fafbf7;
  border: 1px solid #e8ecdf;
  border-radius: 12px;
}
.search-wrapper input { width: 100%; height: 42px; background: transparent; border: 0; outline: none; color: #111827; }
select, button {
  width: 100%;
  height: 44px;
  min-width: 0;
  padding: 0 12px;
  border-radius: 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}
select { background: white; border: 1px solid #e8ecdf; color: #4a0a0a; }
.reset-button { background: white; border: 1px solid #e8ecdf; color: #64748b; cursor: pointer; }
@media (max-width: 1300px) { .filters-bar { grid-template-columns: repeat(3, minmax(0, 1fr)); } .search-wrapper { grid-column: span 3; } }
@media (max-width: 760px) { .filters-bar { grid-template-columns: 1fr; } .search-wrapper { grid-column: auto; } }
</style>
