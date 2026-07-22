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
  background: rgba(17, 27, 38, 0.9);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: rgba(13, 21, 32, 0.72);
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
}
.search-wrapper span { color: #8fcaff; }
.search-wrapper input { width: 100%; height: 42px; background: transparent; border: 0; outline: none; color: #f4f7fb; }
.search-wrapper input::placeholder { color: #77859a; }
select, button {
  width: 100%;
  height: 44px;
  min-width: 0;
  padding: 0 12px;
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}
select { background: #0d1520; border: 1px solid rgba(126, 146, 170, 0.26); color: #f4f7fb; }
.reset-button { background: rgba(13, 21, 32, 0.72); border: 1px solid rgba(210, 221, 234, 0.28); color: #cbd5e1; cursor: pointer; }
.reset-button:hover { border-color: rgba(91, 155, 215, 0.72); color: #cfe9ff; }
@media (max-width: 1300px) { .filters-bar { grid-template-columns: repeat(3, minmax(0, 1fr)); } .search-wrapper { grid-column: span 3; } }
@media (max-width: 760px) { .filters-bar { grid-template-columns: 1fr; } .search-wrapper { grid-column: auto; } }
</style>
