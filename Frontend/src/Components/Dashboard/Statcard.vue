<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
    <div>
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ title }}</span>
      <h3 class="text-2xl font-bold mt-1" :class="valueClass">{{ value }}</h3>
      <p class="text-[10px] mt-1 font-medium" :class="subTitleClass">{{ subTitle }}</p>
    </div>
    <div class="text-2xl p-2.5 rounded-lg" :class="iconBgClass">
      {{ icon }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  subTitle: String,
  icon: String,
  valueClass: { type: String, default: 'text-slate-800' },
  subTitleClass: { type: String, default: 'text-slate-500' },
  iconBgClass: { type: String, default: 'bg-slate-50' }
})
</script>
