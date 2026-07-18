<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <span>⌕</span>
      <input :value="filters.search" type="search" placeholder="Rechercher par ID ou nom..." @input="updateFilter('search', $event.target.value)" />
    </div>
    <select :value="filters.line" @change="updateFilter('line', $event.target.value)">
      <option value="">Toutes les lignes</option>
      <option v-for="line in lines" :key="line">{{ line }}</option>
    </select>
    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">Tous les états</option>
      <option>En service</option>
      <option>En maintenance</option>
      <option>En panne</option>
      <option>Hors service</option>
    </select>
    <select :value="filters.category" @change="updateFilter('category', $event.target.value)">
      <option value="">Toutes les catégories</option>
      <option v-for="category in categories" :key="category">{{ category }}</option>
    </select>
    <select :value="filters.criticality" @change="updateFilter('criticality', $event.target.value)">
      <option value="">Toutes les criticités</option>
      <option>Critique</option>
      <option>Haute</option>
      <option>Moyenne</option>
      <option>Faible</option>
    </select>
    <button type="button" class="reset-button" @click="$emit('reset')">Réinitialiser</button>
  </section>
</template>

<script setup>
defineProps({
  filters: { type: Object, required: true },
  lines: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] }
})
const emit = defineEmits(['update-filter', 'reset'])
const updateFilter = (key, value) => emit('update-filter', { key, value })
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
