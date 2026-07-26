<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <span>&#8981;</span>
      <input :value="filters.search" type="search" :placeholder="content.search" @input="updateFilter('search', $event.target.value)" />
    </div>
    <select :value="filters.site" @change="updateFilter('site', $event.target.value)">
      <option value="">{{ content.allSites }}</option>
      <option v-for="site in sites" :key="site" :value="site">{{ displayValue(site) }}</option>
    </select>
    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">{{ content.allStatuses }}</option>
      <option value="OPERATIONAL">{{ content.statuses.OPERATIONAL }}</option>
      <option value="IN_MAINTENANCE">{{ content.statuses.IN_MAINTENANCE }}</option>
      <option value="OUT_OF_SERVICE">{{ content.statuses.OUT_OF_SERVICE }}</option>
      <option value="OFFLINE">{{ content.statuses.OFFLINE }}</option>
    </select>
    <select :value="filters.periodicity" @change="updateFilter('periodicity', $event.target.value)">
      <option value="">{{ content.allPeriodicities }}</option>
      <option v-for="periodicity in periodicities" :key="periodicity" :value="periodicity">{{ displayPeriodicity(periodicity) }}</option>
    </select>
    <select :value="filters.zone" @change="updateFilter('zone', $event.target.value)">
      <option value="">{{ content.allZones }}</option>
      <option v-for="zone in zones" :key="zone" :value="zone">{{ displayValue(zone) }}</option>
    </select>
    <button type="button" class="reset-button" @click="$emit('reset')">{{ content.reset }}</button>
  </section>
</template>

<script setup>
defineProps({
  filters: { type: Object, required: true },
  sites: { type: Array, default: () => [] },
  periodicities: { type: Array, default: () => [] },
  zones: { type: Array, default: () => [] },
  content: { type: Object, required: true },
})

const emit = defineEmits(['update-filter', 'reset'])
const periodicityLabels = {
  HEBDOMADAIRE: 'Hebdomadaire',
  MENSUELLE: 'Mensuelle',
  BIMESTRIELLE: 'Tous les 2 mois',
  TRIMESTRIELLE: 'Tous les 3 mois',
}

const updateFilter = (key, value) => emit('update-filter', { key, value })
const displayPeriodicity = (periodicity) => periodicityLabels[periodicity] || periodicity
const displayValue = (value) => value
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
