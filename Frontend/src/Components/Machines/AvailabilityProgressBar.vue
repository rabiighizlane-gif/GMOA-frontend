<template>
  <div class="availability">
    <div class="meta">
      <strong>{{ value }}%</strong>
      <span>{{ label }}</span>
    </div>
    <div class="track">
      <span class="fill" :class="tone" :style="{ width: `${value}%` }"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  value: { type: Number, required: true },
})

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const label = computed(() => {
  const labels = {
    FR: 'Disponibilite',
    EN: 'Availability',
    AR: '\u0627\u0644\u062a\u0648\u0641\u0631',
  }

  return labels[language.value] || labels.FR
})

const tone = computed(() => ({
  healthy: props.value >= 90,
  warning: props.value < 90 && props.value >= 75,
  danger: props.value < 75,
}))
</script>

<style scoped>
.availability { min-width: 130px; }
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 11px;
}
.meta strong { color: #f4f7fb; }
.meta span { color: #8d9aab; font-weight: 800; }
.track { overflow: hidden; height: 8px; background: rgba(148, 163, 184, 0.18); border-radius: 999px; }
.fill { display: block; height: 100%; border-radius: inherit; transition: width 0.25s ease; }
.healthy { background: #83b95c; }
.warning { background: #e4ab44; }
.danger { background: #dc3747; }
</style>
