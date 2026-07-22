<template>
  <span class="criticality-badge" :class="tone">{{ displayCriticality }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  criticality: { type: String, required: true }
})

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const labels = {
  FR: { Critique: 'Critique', Haute: 'Haute', Moyenne: 'Moyenne', Faible: 'Faible' },
  EN: { Critique: 'Critical', Haute: 'High', Moyenne: 'Medium', Faible: 'Low' },
  AR: {
    Critique: '\u062d\u0631\u062c\u0629',
    Haute: '\u0639\u0627\u0644\u064a\u0629',
    Moyenne: '\u0645\u062a\u0648\u0633\u0637\u0629',
    Faible: '\u0645\u0646\u062e\u0641\u0636\u0629',
  },
}

const displayCriticality = computed(() => labels[language.value]?.[props.criticality] || props.criticality)

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
.critical { background: rgba(220, 55, 71, 0.18); color: #ff7f8e; }
.high { background: rgba(228, 171, 68, 0.18); color: #ffd27b; }
.medium { background: rgba(228, 171, 68, 0.16); color: #e4ab44; }
.low { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
</style>
