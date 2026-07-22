<template>
  <section class="filters-bar">
    <div class="search-wrapper">
      <PreventiveIcon name="search" />

      <input
        :value="filters.search"
        type="search"
        :placeholder="content.search"
        @input="updateFilter('search', $event.target.value)"
      />
    </div>

    <select
      :value="filters.machine"
      @change="updateFilter('machine', $event.target.value)"
    >
      <option value="">{{ content.allMachines }}</option>\n      <option v-for="machine in machines" :key="machine.value" :value="machine.value">{{ machine.label }}</option>
    </select>

    <select
      :value="filters.frequency"
      @change="updateFilter('frequency', $event.target.value)"
    >
      <option value="">{{ content.allFrequencies }}</option>\n      <option v-for="frequency in frequencies" :key="frequency.value" :value="frequency.value">{{ frequency.label }}</option>
    </select>

    <select
      :value="filters.status"
      @change="updateFilter('status', $event.target.value)"
    >
      <option value="">{{ content.allStatuses }}</option>\n      <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
    </select>

    <button
      class="reset-button"
      type="button"
      @click="$emit('reset')"
    >
      {{ content.reset }}
    </button>

    <button
      class="add-button"
      type="button"
      @click="$emit('create')"
    >
      <PreventiveIcon name="plus" />
      {{ content.create }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-filter', 'reset', 'create'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: {
    search: 'Rechercher un plan preventif...',
    allMachines: 'Toutes les machines',
    allFrequencies: 'Toutes les frequences',
    allStatuses: 'Tous les statuts',
    reset: 'Reinitialiser',
    create: 'Nouveau plan',
    machines: ['Convoyeur M-309', 'Pasteurisateur P-204', 'Remplisseuse R-118', 'Compresseur M-412'],
    frequencies: ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Annuelle'],
    statuses: ['Planifiee', 'A venir', 'En retard', 'Realisee'],
  },
  EN: {
    search: 'Search preventive plan...',
    allMachines: 'All machines',
    allFrequencies: 'All frequencies',
    allStatuses: 'All statuses',
    reset: 'Reset',
    create: 'New plan',
    machines: ['Conveyor M-309', 'Pasteurizer P-204', 'Filling machine R-118', 'Compressor M-412'],
    frequencies: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
    statuses: ['Planned', 'Upcoming', 'Overdue', 'Completed'],
  },
  AR: {
    search: '\u0627\u0628\u062d\u062b \u0639\u0646 \u062e\u0637\u0629 \u0648\u0642\u0627\u0626\u064a\u0629...',
    allMachines: '\u0643\u0644 \u0627\u0644\u0622\u0644\u0627\u062a',
    allFrequencies: '\u0643\u0644 \u0627\u0644\u062a\u0648\u0627\u062a\u0631\u0627\u062a',
    allStatuses: '\u0643\u0644 \u0627\u0644\u062d\u0627\u0644\u0627\u062a',
    reset: '\u0625\u0639\u0627\u062f\u0629',
    create: '\u062e\u0637\u0629 \u062c\u062f\u064a\u062f\u0629',
    machines: ['\u0646\u0627\u0642\u0644 M-309', '\u0645\u0628\u0633\u062a\u0631 P-204', '\u0622\u0644\u0629 \u062a\u0639\u0628\u0626\u0629 R-118', '\u0636\u0627\u063a\u0637 M-412'],
    frequencies: ['\u064a\u0648\u0645\u064a\u0629', '\u0623\u0633\u0628\u0648\u0639\u064a\u0629', '\u0634\u0647\u0631\u064a\u0629', '\u0631\u0628\u0639 \u0633\u0646\u0648\u064a\u0629', '\u0633\u0646\u0648\u064a\u0629'],
    statuses: ['\u0645\u0628\u0631\u0645\u062c\u0629', '\u0642\u0627\u062f\u0645\u0629', '\u0645\u062a\u0623\u062e\u0631\u0629', '\u0645\u0646\u062c\u0632\u0629'],
  },
}

const rawMachines = ['Convoyeur M-309', 'Pasteurisateur P-204', 'Remplisseuse R-118', 'Compresseur M-412']
const rawFrequencies = ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Annuelle']
const rawStatuses = ['Planifiee', 'A venir', 'En retard', 'Realisee']
const content = computed(() => translations[language.value] || translations.FR)
const machines = computed(() => rawMachines.map((value, index) => ({ value, label: content.value.machines[index] || value })))
const frequencies = computed(() => rawFrequencies.map((value, index) => ({ value, label: content.value.frequencies[index] || value })))
const statuses = computed(() => rawStatuses.map((value, index) => ({ value, label: content.value.statuses[index] || value })))

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
  color: #f4f7fb;
}

.search-wrapper input::placeholder {
  color: #77859a;
}

select {
  height: 44px;
  padding: 0 12px;
  background: #0d1520;
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
  outline: none;
  color: #f4f7fb;
  cursor: pointer;
}

button {
  height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.reset-button {
  background: rgba(13, 21, 32, 0.72);
  border: 1px solid rgba(210, 221, 234, 0.28);
  color: #cbd5e1;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #5f8f2f;
  border: 1px solid rgba(131, 185, 92, 0.44);
  color: #f8fbff;
}

.add-button:hover {
  background: #6fa43c;
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
