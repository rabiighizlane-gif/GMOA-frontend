<template>
  <div class="export-actions">
    <select :value="period" @change="$emit('update:period', $event.target.value)">
      <option value="Juillet 2026">Juillet 2026</option>
      <option value="T2 2026">T2 2026</option>
      <option value="Année 2026">Année 2026</option>
    </select>
    <select :value="reportType" @change="$emit('update:reportType', $event.target.value)">
      <option v-for="type in reportTypes" :key="type.id" :value="type.id">{{ type.label }}</option>
    </select>
    <button type="button" class="secondary-button" @click="$emit('export-pdf')">Export PDF</button>
    <button type="button" class="secondary-button" @click="$emit('export-excel')">Export Excel</button>
    <button type="button" class="primary-button" @click="$emit('generate')">Générer rapport</button>
  </div>
</template>

<script setup>
defineProps({
  period: { type: String, required: true },
  reportType: { type: String, required: true },
  reportTypes: { type: Array, default: () => [] }
})
defineEmits(['update:period', 'update:reportType', 'export-pdf', 'export-excel', 'generate'])
</script>

<style scoped>
.export-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
select, button { min-height: 44px; padding: 0 14px; border-radius: 12px; font: inherit; font-weight: 900; }
select { min-width: 160px; background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
button { cursor: pointer; }
.secondary-button { background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
@media (max-width: 760px) { .export-actions, select, button { width: 100%; } }
</style>
