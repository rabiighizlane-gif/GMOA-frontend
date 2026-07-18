<template>
  <span class="status-badge" :class="tone">{{ status }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const tone = computed(() => ({
  healthy: props.status === 'En service',
  warning: props.status === 'En maintenance',
  danger: props.status === 'En panne',
  muted: props.status === 'Hors service'
}))
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}
.healthy { background: #e3f4df; color: #43852c; }
.warning { background: #fff0df; color: #ff6a00; }
.danger { background: #ffe2e2; color: #e31e24; }
.muted { background: #f1f5f9; color: #64748b; }
</style>
