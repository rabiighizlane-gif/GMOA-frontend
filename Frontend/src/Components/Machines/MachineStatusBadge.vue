<template>
  <span class="status-badge" :class="tone">{{ displayStatus }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  status: { type: String, required: true }
})

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const labels = {
  FR: { 'En service': 'En service', 'En maintenance': 'En maintenance', 'En panne': 'En panne', 'Hors service': 'Hors service' },
  EN: { 'En service': 'In service', 'En maintenance': 'In maintenance', 'En panne': 'Broken down', 'Hors service': 'Out of service' },
  AR: {
    'En service': '\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629',
    'En maintenance': '\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629',
    'En panne': '\u0641\u064a \u0639\u0637\u0644',
    'Hors service': '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629',
  },
}

const displayStatus = computed(() => labels[language.value]?.[props.status] || props.status)

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
.healthy { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
.warning { background: rgba(228, 171, 68, 0.18); color: #ffd27b; }
.danger { background: rgba(220, 55, 71, 0.18); color: #ff7f8e; }
.muted { background: rgba(148, 163, 184, 0.18); color: #cbd5e1; }
</style>
