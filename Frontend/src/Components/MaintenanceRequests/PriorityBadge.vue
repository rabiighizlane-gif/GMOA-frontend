<template>
  <span class="priority-badge" :class="badgeClass" :aria-label="`${t.priority} ${label}`">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  priority: {
    type: String,
    required: true,
  },
})

const languageStore = useLanguageStore()

const labels = {
  FR: { priority: 'Priorite', Critique: 'Critique', Haute: 'Haute', Moyenne: 'Moyenne', Faible: 'Faible' },
  EN: { priority: 'Priority', Critique: 'Critical', Haute: 'High', Moyenne: 'Medium', Faible: 'Low' },
  AR: { priority: 'الأولوية', Critique: 'حرجة', Haute: 'عالية', Moyenne: 'متوسطة', Faible: 'منخفضة' },
}

const t = computed(() => labels[languageStore.language] || labels.FR)
const label = computed(() => t.value[props.priority] || props.priority)

const badgeClass = computed(() => ({
  critical: props.priority === 'Critique',
  high: props.priority === 'Haute',
  medium: props.priority === 'Moyenne',
  low: props.priority === 'Faible',
}))
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
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
