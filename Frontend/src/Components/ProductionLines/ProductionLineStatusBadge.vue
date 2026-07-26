<template>
  <span :class="['production-line-status-badge', normalizedStatus]">
    <i aria-hidden="true"></i>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'active',
  },
})

const normalizedStatus = computed(() => normalizeStatus(props.status))
const label = computed(() => {
  const labels = {
    active: 'Active',
    maintenance: 'En maintenance',
    stopped: 'Arretee',
  }

  return labels[normalizedStatus.value]
})

function normalizeStatus(status) {
  const value = String(status || 'active').trim().toLowerCase()

  if (['maintenance', 'in_maintenance', 'en maintenance'].includes(value)) return 'maintenance'
  if (['stopped', 'stop', 'arret', 'arretee', 'arrêtée', 'inactive', 'down'].includes(value)) return 'stopped'
  return 'active'
}
</script>

<style scoped>
.production-line-status-badge {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 0 11px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.production-line-status-badge i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.production-line-status-badge.active {
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.production-line-status-badge.active i {
  background: var(--sc-primary);
}

.production-line-status-badge.maintenance {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.production-line-status-badge.maintenance i {
  background: var(--sc-warning);
}

.production-line-status-badge.stopped {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.production-line-status-badge.stopped i {
  background: var(--sc-danger);
}
</style>
