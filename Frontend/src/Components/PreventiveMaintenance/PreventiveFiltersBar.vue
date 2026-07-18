<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <PreventiveIcon name="search" />

      <input
        :value="filters.search"
        type="search"
        placeholder="Rechercher un plan préventif..."
        @input="updateFilter('search', $event.target.value)"
      />
    </div>

    <select
      :value="filters.machine"
      @change="updateFilter('machine', $event.target.value)"
    >
      <option value="">Toutes les machines</option>
      <option>Convoyeur M-309</option>
      <option>Pasteurisateur P-204</option>
      <option>Remplisseuse R-118</option>
      <option>Compresseur M-412</option>
    </select>

    <select
      :value="filters.frequency"
      @change="updateFilter('frequency', $event.target.value)"
    >
      <option value="">Toutes les fréquences</option>
      <option>Quotidienne</option>
      <option>Hebdomadaire</option>
      <option>Mensuelle</option>
      <option>Trimestrielle</option>
      <option>Annuelle</option>
    </select>

    <select
      :value="filters.status"
      @change="updateFilter('status', $event.target.value)"
    >
      <option value="">Tous les statuts</option>
      <option>Planifiée</option>
      <option>À venir</option>
      <option>En retard</option>
      <option>Réalisée</option>
    </select>

    <button
      class="reset-button"
      type="button"
      @click="$emit('reset')"
    >
      Réinitialiser
    </button>

    <button
      class="add-button"
      type="button"
      @click="$emit('create')"
    >
      <PreventiveIcon name="plus" />
      Nouveau plan
    </button>
  </section>
</template>

<script setup>
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'

defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-filter', 'reset', 'create'])

const updateFilter = (key, value) => {
  emit('update-filter', { key, value })
}
</script>

<style scoped>
.filters-bar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) repeat(3, 190px) auto auto;
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

.search-wrapper svg,
.add-button svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.search-wrapper input {
  width: 100%;
  height: 42px;
  background: transparent;
  border: 0;
  outline: none;
  color: #111827;
}

select {
  height: 44px;
  padding: 0 12px;
  background: white;
  border: 1px solid #e8ecdf;
  border-radius: 12px;
  outline: none;
  color: #4a0a0a;
  cursor: pointer;
}

button {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.reset-button {
  background: white;
  border: 1px solid #e8ecdf;
  color: #64748b;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #6a9a2a;
  border: 1px solid #6a9a2a;
  color: white;
}

.add-button:hover {
  background: #587f24;
  transform: translateY(-1px);
}

@media (max-width: 1250px) {
  .filters-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }
}
</style>
