<template>
  <section class="filters-bar">
    <label class="field search-field">
      <InterventionIcon name="search" />
      <input
        :value="modelValue.search"
        type="search"
        placeholder="Rechercher une intervention..."
        @input="update('search', $event.target.value)"
      />
    </label>

    <label class="field">
      <span>Date</span>
      <input :value="modelValue.date" type="date" @input="update('date', $event.target.value)" />
    </label>

    <label class="field">
      <span>Technicien</span>
      <select :value="modelValue.technician" @change="update('technician', $event.target.value)">
        <option value="">Tous</option>
        <option v-for="technician in technicians" :key="technician" :value="technician">{{ technician }}</option>
      </select>
    </label>

    <label class="field">
      <span>Statut</span>
      <select :value="modelValue.status" @change="update('status', $event.target.value)">
        <option value="">Tous</option>
        <option value="Terminée">Terminée</option>
        <option value="En cours">En cours</option>
        <option value="En attente">En attente</option>
      </select>
    </label>

    <button class="ghost-button" type="button">
      <InterventionIcon name="download" />
      Export
    </button>

    <button v-if="canCreate" class="primary-button" type="button">
      <InterventionIcon name="plus" />
      Nouvelle intervention
    </button>
  </section>
</template>

<script setup>
import InterventionIcon from './InterventionIcon.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  technicians: {
    type: Array,
    default: () => [],
  },
  canCreate: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  padding: 14px;
  box-shadow: var(--sc-shadow);
}

.field {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--sc-border);
  border-radius: 14px;
  background: var(--sc-bg);
  color: var(--sc-muted);
  padding: 0 13px;
  font-size: 12px;
  font-weight: 900;
}

.search-field {
  flex: 1 1 280px;
  background: var(--sc-surface);
}

.field input,
.field select {
  min-width: 120px;
  border: 0;
  background: transparent;
  color: var(--sc-dark);
  outline: none;
  font-size: 13px;
  font-weight: 850;
}

.search-field input {
  width: 100%;
  min-width: 180px;
}

.ghost-button,
.primary-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.ghost-button {
  border: 1px solid var(--sc-border);
  background: var(--sc-surface);
  color: var(--sc-dark);
}

.primary-button {
  border: 1px solid var(--sc-primary);
  background: var(--sc-primary);
  color: var(--sc-surface);
}

.ghost-button:hover,
.primary-button:hover {
  transform: translateY(-2px);
}

.ghost-button:hover {
  background: var(--sc-soft-primary);
  border-color: rgba(106, 154, 42, 0.28);
}

@media (max-width: 760px) {
  .filters-bar > * {
    width: 100%;
  }

  .field input,
  .field select {
    width: 100%;
  }
}
</style>
