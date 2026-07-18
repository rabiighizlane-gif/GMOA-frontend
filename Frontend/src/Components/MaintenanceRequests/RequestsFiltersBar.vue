<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <span>⌕</span>
      <input
        :value="filters.search"
        type="search"
        placeholder="Rechercher par ID, machine, demandeur..."
        @input="updateFilter('search', $event.target.value)"
      />
    </div>

    <select :value="filters.machine" @change="updateFilter('machine', $event.target.value)">
      <option value="">Toutes les machines</option>
      <option v-for="machine in machines" :key="machine">{{ machine }}</option>
    </select>

    <select :value="filters.line" @change="updateFilter('line', $event.target.value)">
      <option value="">Toutes les lignes</option>
      <option v-for="line in lines" :key="line">{{ line }}</option>
    </select>

    <select :value="filters.priority" @change="updateFilter('priority', $event.target.value)">
      <option value="">Toutes les priorités</option>
      <option>Critique</option>
      <option>Haute</option>
      <option>Moyenne</option>
      <option>Faible</option>
    </select>

    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">Tous les statuts</option>
      <option>Brouillon</option>
      <option>En attente</option>
      <option>Acceptée</option>
      <option>Refusée</option>
      <option>Informations demandées</option>
      <option>Intervention créée</option>
    </select>

    <select :value="filters.requester" @change="updateFilter('requester', $event.target.value)">
      <option value="">Tous les demandeurs</option>
      <option v-for="requester in requesters" :key="requester">{{ requester }}</option>
    </select>

    <select :value="filters.period" @change="updateFilter('period', $event.target.value)">
      <option value="">Toutes les périodes</option>
      <option value="today">Aujourd’hui</option>
      <option value="week">Cette semaine</option>
      <option value="month">Ce mois</option>
    </select>

    <button type="button" class="reset-button" @click="$emit('reset')">
      Réinitialiser
    </button>
  </section>
</template>

<script setup>
defineProps({
  filters: { type: Object, required: true },
  machines: { type: Array, default: () => [] },
  lines: { type: Array, default: () => [] },
  requesters: { type: Array, default: () => [] }
})

const emit = defineEmits(['update-filter', 'reset'])

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
  color: #4a0a0a;
  font-size: 20px;
  line-height: 1;
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
  .filters-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-wrapper {
    grid-column: span 3;
  }
}

@media (max-width: 760px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }

  .search-wrapper {
    grid-column: auto;
  }
}
</style>
