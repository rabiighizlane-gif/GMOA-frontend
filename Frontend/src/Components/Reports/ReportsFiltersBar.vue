<template>
  <section class="filters-bar">
    <select :value="filters.period" @change="updateFilter('period', $event.target.value)">
      <option value="">Toutes les périodes</option><option>Juillet 2026</option><option>T2 2026</option><option>Année 2026</option>
    </select>
    <select :value="filters.line" @change="updateFilter('line', $event.target.value)">
      <option value="">Toutes les lignes</option><option>Ligne Production 1</option><option>Ligne Production 2</option><option>Ligne Conditionnement</option><option>Ligne Utilités</option>
    </select>
    <select :value="filters.machine" @change="updateFilter('machine', $event.target.value)">
      <option value="">Toutes les machines</option><option>M-102</option><option>M-215</option><option>M-309</option><option>M-412</option>
    </select>
    <select :value="filters.technician" @change="updateFilter('technician', $event.target.value)">
      <option value="">Tous les techniciens</option><option>Nabil</option><option>Ahmed</option><option>Sara</option><option>Youssef</option>
    </select>
    <select :value="filters.maintenanceType" @change="updateFilter('maintenanceType', $event.target.value)">
      <option value="">Tous les types</option><option>Corrective</option><option>Préventive</option><option>Amélioration</option>
    </select>
    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">Tous les statuts</option><option>Terminée</option><option>En cours</option><option>En attente</option>
    </select>
    <select :value="filters.priority" @change="updateFilter('priority', $event.target.value)">
      <option value="">Toutes les priorités</option><option>Critique</option><option>Haute</option><option>Moyenne</option><option>Faible</option>
    </select>
    <button type="button" class="primary-button" @click="$emit('apply')">Appliquer</button>
    <button type="button" class="reset-button" @click="$emit('reset')">Réinitialiser</button>
  </section>
</template>

<script setup>
defineProps({ filters: { type: Object, required: true } })
const emit = defineEmits(['update-filter', 'apply', 'reset'])
const updateFilter = (key, value) => emit('update-filter', { key, value })
</script>

<style scoped>
.filters-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; padding: 16px; background: white; border: 1px solid #edf0e8; border-radius: 18px; }
select, button { width: 100%; height: 44px; min-width: 0; padding: 0 12px; border-radius: 12px; font: inherit; font-size: 13px; font-weight: 800; }
select { background: white; border: 1px solid #e8ecdf; color: #4a0a0a; }
button { cursor: pointer; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
.reset-button { background: white; border: 1px solid #e8ecdf; color: #64748b; }
</style>
