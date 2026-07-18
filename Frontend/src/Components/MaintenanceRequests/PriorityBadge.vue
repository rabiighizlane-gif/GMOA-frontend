<template>
  <span class="priority-badge" :class="badgeClass" :aria-label="`Priorité ${priority}`">
    <span aria-hidden="true">{{ icon }}</span>
    {{ priority }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: {
    type: String,
    required: true
  }
})

const badgeClass = computed(() => ({
  critical: props.priority === 'Critique',
  high: props.priority === 'Haute',
  medium: props.priority === 'Moyenne',
  low: props.priority === 'Faible'
}))

const icon = computed(() => (props.priority === 'Critique' ? '!' : '•'))
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.critical {
  background: #ffe2e2;
  color: #e31e24;
}

.high {
  background: #fff0df;
  color: #ff6a00;
}

.medium {
  background: #fff4cf;
  color: #ad7a00;
}

.low {
  background: #e3f4df;
  color: #43852c;
}
</style>
