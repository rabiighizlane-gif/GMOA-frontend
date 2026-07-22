<template>
  <div class="stock-progress">
    <div class="stock-meta">
      <strong class="stock-ratio" dir="ltr">{{ currentStock }} / {{ maximumStock }}</strong>
      <span>{{ thresholdLabel }} <bdi dir="ltr">{{ minimumStock }}</bdi></span>
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
import { useLanguageStore } from '@/stores/language'

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

const languageStore = useLanguageStore()
const thresholdLabel = computed(() => ({
  FR: 'Seuil',
  EN: 'Threshold',
  AR: 'الحد الادنى',
})[languageStore.language] || 'Seuil')

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
  color: #f8fbff;
}

.stock-ratio,
.stock-meta bdi {
  unicode-bidi: isolate;
}

.stock-meta span {
  color: #8d9aab;
  font-weight: 700;
}

.track {
  overflow: hidden;
  height: 8px;
  background: rgba(126, 146, 170, 0.18);
  border-radius: 999px;
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.25s ease;
}

.fill.available {
  background: #83b95c;
}

.fill.warning {
  background: #f97316;
}

.fill.danger {
  background: #dc3747;
}
</style>
