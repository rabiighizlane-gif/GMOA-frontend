<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <span>⌕</span>
      <input
        :value="filters.search"
        type="search"
        :placeholder="content.search"
        @input="updateFilter('search', $event.target.value)"
      />
    </div>

    <select :value="filters.category" @change="updateFilter('category', $event.target.value)">
      <option value="">{{ content.allCategories }}</option>
      <option v-for="category in categories" :key="category" :value="category">{{ categoryLabel(category) }}</option>
    </select>

    <select :value="filters.machine" @change="updateFilter('machine', $event.target.value)">
      <option value="">{{ content.allMachines }}</option>
      <option v-for="machine in machines" :key="machine" :value="machine">{{ machineLabel(machine) }}</option>
    </select>

    <select :value="filters.supplier" @change="updateFilter('supplier', $event.target.value)">
      <option value="">{{ content.allSuppliers }}</option>
      <option v-for="supplier in suppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
    </select>

    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">{{ content.allStatuses }}</option>
      <option value="Disponible">{{ statusLabel('Disponible') }}</option>
      <option value="Stock faible">{{ statusLabel('Stock faible') }}</option>
      <option value="Rupture">{{ statusLabel('Rupture') }}</option>
    </select>

    <select :value="filters.location" @change="updateFilter('location', $event.target.value)">
      <option value="">{{ content.allLocations }}</option>
      <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
    </select>

    <button type="button" class="reset-button" @click="$emit('reset')">
      {{ content.reset }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  filters: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  machines: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
  locations: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-filter', 'reset'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: {
    search: 'Rechercher par nom ou reference...',
    allCategories: 'Toutes les categories',
    allMachines: 'Toutes les machines',
    allSuppliers: 'Tous les fournisseurs',
    allStatuses: 'Toutes les disponibilites',
    allLocations: 'Tous les emplacements',
    reset: 'Reinitialiser',
    statuses: { Disponible: 'Disponible', 'Stock faible': 'Stock faible', Rupture: 'Rupture' },
    categories: { Mécanique: 'Mecanique', Électrique: 'Electrique' },
    machines: { 'Convoyeur M-309': 'Convoyeur M-309', 'Compresseur M-412': 'Compresseur M-412', 'Pasteurisateur P-204': 'Pasteurisateur P-204', 'Remplisseuse R-118': 'Remplisseuse R-118', 'Machines multiples': 'Machines multiples' },
  },
  EN: {
    search: 'Search by name or reference...',
    allCategories: 'All categories',
    allMachines: 'All machines',
    allSuppliers: 'All suppliers',
    allStatuses: 'All availability',
    allLocations: 'All locations',
    reset: 'Reset',
    statuses: { Disponible: 'Available', 'Stock faible': 'Low stock', Rupture: 'Out of stock' },
    categories: { Mécanique: 'Mechanical', Électrique: 'Electrical', Pneumatique: 'Pneumatic', Hydraulique: 'Hydraulic', Lubrification: 'Lubrication', Filtration: 'Filtration', Transmission: 'Transmission' },
    machines: { 'Convoyeur M-309': 'Conveyor M-309', 'Compresseur M-412': 'Compressor M-412', 'Pasteurisateur P-204': 'Pasteurizer P-204', 'Remplisseuse R-118': 'Filling machine R-118', 'Machines multiples': 'Multiple machines' },
  },
  AR: {
    search: 'بحث بالاسم أو المرجع...',
    allCategories: 'كل الفئات',
    allMachines: 'كل الآلات',
    allSuppliers: 'كل الموردين',
    allStatuses: 'كل حالات التوفر',
    allLocations: 'كل المواقع',
    reset: 'إعادة ضبط',
    statuses: { Disponible: 'متوفر', 'Stock faible': 'مخزون منخفض', Rupture: 'نفاد المخزون' },
    categories: { Mécanique: 'ميكانيكية', Électrique: 'كهربائية', Pneumatique: 'هوائية', Hydraulique: 'هيدروليكية', Lubrification: 'تشحيم', Filtration: 'ترشيح', Transmission: 'نقل الحركة' },
    machines: { 'Convoyeur M-309': 'ناقل M-309', 'Compresseur M-412': 'ضاغط M-412', 'Pasteurisateur P-204': 'مبستر P-204', 'Remplisseuse R-118': 'آلة تعبئة R-118', 'Machines multiples': 'آلات متعددة' },
  },
}

const content = computed(() => translations[language.value] || translations.FR)
const categoryLabel = (value) => content.value.categories[value] || value
const machineLabel = (value) => content.value.machines[value] || value
const statusLabel = (value) => content.value.statuses[value] || value

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
  background: rgba(17, 27, 38, 0.9);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.22);
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: #0d1520;
  border: 1px solid rgba(126, 146, 170, 0.28);
  border-radius: 8px;
}

.search-wrapper span { color: #fdba74; font-size: 20px; }
.search-wrapper input {
  width: 100%;
  height: 42px;
  background: transparent;
  border: 0;
  outline: none;
  color: #f4f7fb;
}

.search-wrapper input::placeholder {
  color: #6f7e91;
}

select,
button {
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
}

select {
  background: #0d1520;
  border: 1px solid rgba(126, 146, 170, 0.28);
  color: #f4f7fb;
}

button { cursor: pointer; }
.reset-button {
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(210, 221, 234, 0.28);
  color: #d7e0ec;
}

@media (max-width: 1500px) {
  .filters-bar { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 760px) {
  .filters-bar { grid-template-columns: 1fr; }
}
</style>
