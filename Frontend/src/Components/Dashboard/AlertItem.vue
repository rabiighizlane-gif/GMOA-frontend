<template>
  <div class="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-slate-50">
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-black text-white"
      :class="alertConfig.iconClass"
    >
      {{ alertConfig.symbol }}
    </div>

    <div class="min-w-0 flex-1">
      <h5 class="text-sm font-extrabold text-slate-900">{{ title }}</h5>
      <p class="mt-1 text-sm font-medium leading-snug text-slate-500">{{ description }}</p>
    </div>

    <span class="shrink-0 text-sm font-bold text-slate-500">{{ time }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'info' },
  title: String,
  description: String,
  time: String,
})

const alertConfig = computed(() => {
  const configs = {
    critical: { iconClass: 'bg-red-500', symbol: '!' },
    warning: { iconClass: 'bg-orange-500', symbol: '!' },
    anomaly: { iconClass: 'bg-amber-400', symbol: '!' },
    info: { iconClass: 'bg-blue-500', symbol: 'i' },
  }

  return configs[props.type] || configs.info
})
</script>
