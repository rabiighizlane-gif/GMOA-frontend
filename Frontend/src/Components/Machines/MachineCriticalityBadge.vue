<template>
  <span class="criticality-badge" :class="tone">{{ criticality }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  criticality: { type: String, required: true }
})

const tone = computed(() => ({
  critical: props.criticality === 'Critique',
  high: props.criticality === 'Haute',
  medium: props.criticality === 'Moyenne',
  low: props.criticality === 'Faible'
}))
</script>

<style scoped>
.criticality-badge {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}
.critical { background: #ffe2e2; color: #e31e24; }
.high { background: #fff0df; color: #ff6a00; }
.medium { background: #fff4cf; color: #ad7a00; }
.low { background: #e3f4df; color: #43852c; }
</style>
