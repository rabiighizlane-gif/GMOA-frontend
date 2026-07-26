<template>
  <section class="filters-bar" :class="{ 'advanced-open': advancedOpen }">
    <label class="field search-field">
      <InterventionIcon name="search" />
      <input
        :value="modelValue.search"
        type="search"
        :placeholder="content.search"
        @input="update('search', $event.target.value)"
      />
      <button
        v-if="modelValue.search"
        class="clear-search"
        type="button"
        :aria-label="content.clearSearch"
        @click="update('search', '')"
      >
        <InterventionIcon name="x" />
      </button>
    </label>

    <label class="field">
      <span>{{ content.status }}</span>
      <select :value="modelValue.status" @change="update('status', $event.target.value)">
        <option value="">{{ content.all }}</option>
        <option value="pending">En attente</option>
        <option value="planned">Planifiee</option>
        <option value="in_progress">En cours</option>
        <option value="completed">Terminee</option>
        <option value="closed">Fermee</option>
        <option value="cancelled">Annulee</option>
      </select>
    </label>

    <label class="field">
      <span>{{ content.type }}</span>
      <select :value="modelValue.type" @change="update('type', $event.target.value)">
        <option value="">{{ content.all }}</option>
        <option value="corrective">Corrective</option>
        <option value="preventive">Preventive</option>
        <option value="improvement">Amelioration</option>
        <option value="inspection">Inspection</option>
      </select>
    </label>

    <label class="field">
      <span>{{ content.priority }}</span>
      <select :value="modelValue.priority" @change="update('priority', $event.target.value)">
        <option value="">{{ content.all }}</option>
        <option value="critical">Critique</option>
        <option value="high">Haute</option>
        <option value="medium">Moyenne</option>
        <option value="low">Basse</option>
      </select>
    </label>

    <button class="advanced-toggle" type="button" :aria-expanded="advancedOpen" @click="advancedOpen = !advancedOpen">
      <InterventionIcon name="filter" />
      {{ content.advanced }}
    </button>

    <button v-if="hasActiveFilters" class="reset-button" type="button" @click="$emit('reset')">
      {{ content.reset }}
    </button>

    <span class="results-counter">{{ content.found(resultsCount) }}</span>

    <button class="refresh-button" type="button" :aria-label="content.refresh" :title="content.refresh" :disabled="loading" @click="$emit('refresh')">
      <InterventionIcon name="refresh" :class="{ spinning: loading }" />
    </button>

    <div class="advanced-fields">
      <label class="field">
        <span>{{ content.line }}</span>
        <select :value="modelValue.production_line_id" @change="updateLine($event.target.value)">
          <option value="">{{ content.all }}</option>
          <option v-for="line in lineOptions" :key="line.id" :value="line.id">
            {{ displayNamedOption(line) }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>{{ content.zone }}</span>
        <select :value="modelValue.production_zone_id" @change="update('production_zone_id', $event.target.value)">
          <option value="">{{ content.all }}</option>
          <option v-for="zone in zoneOptions" :key="zone.id" :value="zone.id">
            {{ displayNamedOption(zone) }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>{{ content.equipment }}</span>
        <select :value="modelValue.equipment_id" @change="update('equipment_id', $event.target.value)">
          <option value="">{{ content.all }}</option>
          <option v-for="equipment in equipmentOptions" :key="equipment.id" :value="equipment.id">
            {{ displayNamedOption(equipment) }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>{{ content.technician }}</span>
        <select :value="modelValue.technician_id" @change="update('technician_id', $event.target.value)">
          <option value="">{{ content.all }}</option>
          <option v-for="technician in technicians" :key="technician.id" :value="technician.id">
            {{ displayUser(technician) }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>{{ content.date }}</span>
        <input :value="modelValue.date" type="date" @input="update('date', $event.target.value)" />
      </label>
    </div>

    <label class="field">
      <span>{{ content.sort }}</span>
      <select :value="sortValue" @change="updateSort($event.target.value)">
        <option value="created_at:desc">Date recente</option>
        <option value="created_at:asc">Date ancienne</option>
        <option value="priority:desc">Priorite haute</option>
        <option value="status:asc">Statut</option>
        <option value="equipment:asc">Machine A-Z</option>
      </select>
    </label>

    <button class="ghost-button" type="button" @click="$emit('export')">
      <InterventionIcon name="download" />
      {{ content.export }}
    </button>

    <button v-if="canCreate" class="primary-button" type="button" @click="$emit('create')">
      <InterventionIcon name="plus" />
      {{ content.create }}
    </button>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
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
  equipmentOptions: {
    type: Array,
    default: () => [],
  },
  lineOptions: {
    type: Array,
    default: () => [],
  },
  zoneOptions: {
    type: Array,
    default: () => [],
  },
  canCreate: {
    type: Boolean,
    default: true,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  resultsCount: {
    type: Number,
    default: 0,
  },
  content: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['create', 'export', 'refresh', 'reset', 'update:modelValue'])
const advancedOpen = ref(false)
const sortValue = computed(() => `${props.modelValue.sort_by || 'created_at'}:${props.modelValue.sort_order || 'desc'}`)

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updateLine(value) {
  emit('update:modelValue', {
    ...props.modelValue,
    production_line_id: value,
    production_zone_id: '',
  })
}

function updateSort(value) {
  const [sortBy, sortOrder] = value.split(':')
  emit('update:modelValue', {
    ...props.modelValue,
    sort_by: sortBy,
    sort_order: sortOrder,
  })
}

function displayNamedOption(item) {
  return [item.code, item.name].filter(Boolean).join(' - ') || item.display_name || item.label || String(item.id)
}

function displayUser(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || String(user.id)
}
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background: rgba(17, 27, 38, 0.9);
  padding: 14px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
}

.field {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.72);
  color: #aeb9c8;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 900;
}

.search-field {
  position: relative;
  flex: 1 1 300px;
  background: rgba(13, 21, 32, 0.72);
}

.advanced-fields {
  display: contents;
}

.advanced-toggle,
.clear-search,
.reset-button,
.refresh-button,
.results-counter {
  display: none;
}

.field input,
.field select {
  min-width: 130px;
  border: 0;
  background: transparent;
  color: #f4f7fb;
  outline: none;
  font-size: 13px;
  font-weight: 850;
}

.search-field input {
  width: 100%;
  min-width: 220px;
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
  border: 1px solid rgba(210, 221, 234, 0.28);
  background: rgba(13, 21, 32, 0.82);
  color: #f2f6fb;
}

.primary-button {
  border: 1px solid rgba(131, 185, 92, 0.44);
  background: #5f8f2f;
  color: #f8fbff;
}

.ghost-button:hover,
.primary-button:hover {
  transform: translateY(-2px);
}

.ghost-button:hover {
  background: rgba(24, 38, 53, 0.92);
  border-color: rgba(91, 155, 215, 0.72);
}

:global(html[data-theme='light']) .filters-bar {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 180px 180px auto auto auto auto;
  align-items: end;
  gap: 12px;
  border-color: #edf0e8;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.06);
  padding: 16px;
}

:global(html[data-theme='light']) .filters-bar .field {
  min-height: auto;
  display: grid;
  gap: 7px;
  border: 0;
  background: transparent;
  color: #53667f;
  padding: 0;
}

:global(html[data-theme='light']) .filters-bar .field input,
:global(html[data-theme='light']) .filters-bar .field select {
  width: 100%;
  min-width: 0;
  height: 44px;
  border: 1px solid #dfe5d6;
  border-radius: 8px;
  background: #f7f9f3;
  color: #4a0a0a;
  padding: 0 12px;
}

:global(html[data-theme='light']) .filters-bar .search-field input {
  padding-left: 40px;
  padding-right: 38px;
}

:global(html[data-theme='light']) .filters-bar .search-field > svg {
  position: absolute;
  left: 13px;
  bottom: 13px;
  color: #6a9a2a;
}

:global(html[data-theme='light']) .filters-bar .clear-search,
:global(html[data-theme='light']) .filters-bar .advanced-toggle,
:global(html[data-theme='light']) .filters-bar .reset-button,
:global(html[data-theme='light']) .filters-bar .refresh-button,
:global(html[data-theme='light']) .filters-bar .results-counter {
  display: inline-flex;
}

:global(html[data-theme='light']) .filters-bar .clear-search {
  position: absolute;
  right: 9px;
  bottom: 10px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #53667f;
  cursor: pointer;
}

:global(html[data-theme='light']) .filters-bar .advanced-toggle,
:global(html[data-theme='light']) .filters-bar .reset-button,
:global(html[data-theme='light']) .filters-bar .refresh-button {
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #dfe5d6;
  border-radius: 8px;
  background: #ffffff;
  color: #4a0a0a;
  padding: 0 13px;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
}

:global(html[data-theme='light']) .filters-bar .refresh-button {
  width: 44px;
  padding: 0;
  color: #6a9a2a;
}

:global(html[data-theme='light']) .filters-bar .results-counter {
  min-height: 44px;
  align-items: center;
  border-radius: 999px;
  background: #f7f9f3;
  color: #53667f;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

:global(html[data-theme='light']) .filters-bar .advanced-fields {
  grid-column: 1 / -1;
  display: none;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  padding-top: 4px;
}

:global(html[data-theme='light']) .filters-bar.advanced-open .advanced-fields {
  display: grid;
}

:global(html[data-theme='light']) .filters-bar .ghost-button,
:global(html[data-theme='light']) .filters-bar .primary-button {
  min-height: 44px;
  border-radius: 8px;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

@media (max-width: 1180px) {
  :global(html[data-theme='light']) .filters-bar {
    grid-template-columns: 1fr 1fr;
  }

  :global(html[data-theme='light']) .filters-bar .advanced-fields {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  :global(html[data-theme='light']) .filters-bar,
  :global(html[data-theme='light']) .filters-bar .advanced-fields {
    grid-template-columns: 1fr;
  }
}
</style>
