<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <span>⌕</span>

      <input
        :value="filters.search"
        type="search"
        placeholder="Rechercher par nom ou référence..."
        @input="updateFilter('search', $event.target.value)"
      />
    </div>

    <select :value="filters.category" @change="updateFilter('category', $event.target.value)">
      <option value="">Toutes les catégories</option>
      <option v-for="category in categories" :key="category">{{ category }}</option>
    </select>

    <select :value="filters.machine" @change="updateFilter('machine', $event.target.value)">
      <option value="">Toutes les machines</option>
      <option v-for="machine in machines" :key="machine">{{ machine }}</option>
    </select>

    <select :value="filters.supplier" @change="updateFilter('supplier', $event.target.value)">
      <option value="">Tous les fournisseurs</option>
      <option v-for="supplier in suppliers" :key="supplier">{{ supplier }}</option>
    </select>

    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">Toutes les disponibilités</option>
      <option>Disponible</option>
      <option>Stock faible</option>
      <option>Rupture</option>
    </select>

    <select :value="filters.location" @change="updateFilter('location', $event.target.value)">
      <option value="">Tous les emplacements</option>
      <option v-for="location in locations" :key="location">{{ location }}</option>
    </select>

    <button type="button" class="reset-button" @click="$emit('reset')">
      Réinitialiser
    </button>

  </section>
</template>

<script setup>
defineProps({
  filters: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  machines: {
    type: Array,
    default: () => []
  },
  suppliers: {
    type: Array,
    default: () => []
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-filter', 'reset'])

const updateFilter = (key, value) => {
  emit('update-filter', { key, value })
}
</script>

<style scoped>
.filters-bar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) repeat(5, minmax(150px, 180px)) auto;
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

.search-wrapper span {
  color: #4a0a0a;
  font-size: 20px;
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
  height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  font: inherit;
  font-weight: 700;
}

select {
  background: white;
  border: 1px solid #e8ecdf;
  color: #4a0a0a;
}

button {
  cursor: pointer;
  transition: 0.2s ease;
}

.reset-button {
  background: white;
  border: 1px solid #e8ecdf;
  color: #64748b;
}

@media (max-width: 1500px) {
  .filters-bar {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 760px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }
}
</style>
