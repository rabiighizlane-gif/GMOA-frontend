<template>
  <div class="stock-progress">
    <div class="stock-meta">
      <strong>{{ currentStock }} / {{ maximumStock }}</strong>
      <span>Seuil {{ minimumStock }}</span>
    </div>

    <div class="track">
      <span
        class="fill"
        :class="statusClass"
        :style="{ width: `${progress}%` }"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentStock: {
    type: Number,
    required: true
  },
  minimumStock: {
    type: Number,
    required: true
  },
  maximumStock: {
    type: Number,
    required: true
  }
})

const progress = computed(() => {
  if (!props.maximumStock) {
    return 0
  }

  return Math.min(100, Math.round((props.currentStock / props.maximumStock) * 100))
})

const statusClass = computed(() => {
  if (props.currentStock === 0) {
    return 'danger'
  }

  if (props.currentStock <= props.minimumStock) {
    return 'warning'
  }

  return 'available'
})
</script>

<style scoped>
.stock-progress {
  min-width: 130px;
}

.stock-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 11px;
}

.stock-meta strong {
  color: #4a0a0a;
}

.stock-meta span {
  color: #94a3b8;
  font-weight: 700;
}

.track {
  overflow: hidden;
  height: 8px;
  background: #eef1e9;
  border-radius: 999px;
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.25s ease;
}

.fill.available {
  background: #6a9a2a;
}

.fill.warning {
  background: #ff6a00;
}

.fill.danger {
  background: #e31e24;
}
</style>
