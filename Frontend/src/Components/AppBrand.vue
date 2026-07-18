<script setup>
import { computed } from 'vue'
import appLogo from '@/assets/logo.png'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const tagline = computed(() => {
  const taglines = {
    FR: 'MAINTENANCE INTELLIGENTE',
    EN: 'SMART MAINTENANCE',
    AR: 'الصيانة الذكية',
  }

  return taglines[languageStore.language] || taglines.FR
})

const isArabic = computed(() => languageStore.language === 'AR')
</script>

<template>
  <div dir="ltr" class="flex h-14 w-72 items-center gap-2 bg-white px-3 shadow-sm [clip-path:polygon(0_0,78%_0,100%_12%,84%_50%,100%_88%,78%_100%,0_100%)]">
    <div class="h-11 w-14 overflow-hidden [clip-path:polygon(0_0,78%_0,100%_12%,84%_50%,100%_88%,78%_100%,0_100%)]">
      <img :src="appLogo" alt="SMARTCalyx Logo" class="h-full w-full object-cover object-center" />
    </div>
    <div class="flex flex-col items-center leading-none">
      <span v-if="!isArabic" class="text-2xl font-light tracking-normal">
        <span class="text-[#4f8f1f]">SMART</span><span class="text-[#6fa832]">Caly</span><span class="text-[#b8cc45]">x</span>
      </span>
      <span v-else class="text-2xl font-bold tracking-normal text-[#4f8f1f]">سمارت كاليكس</span>
      <span class="mt-1 text-[8px] font-medium tracking-[0.16em] text-gray-400">{{ tagline }}</span>
    </div>
  </div>
</template>
