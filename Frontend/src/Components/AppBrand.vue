<script setup>
import appLogo from '@/assets/logo.png'
</script>

<template>
  <div
    dir="ltr"
    class="flex h-14 w-72 items-center gap-2 bg-white px-3 shadow-sm [clip-path:polygon(0_0,78%_0,100%_12%,84%_50%,100%_88%,78%_100%,0_100%)]"
  >
    <div
      class="h-11 w-14 overflow-hidden [clip-path:polygon(0_0,78%_0,100%_12%,84%_50%,100%_88%,78%_100%,0_100%)]"
    >
      <img :src="appLogo" alt="SMARTCalyx Logo" class="h-full w-full object-cover object-center" />
    </div>
    <div class="flex flex-col items-center leading-none">
      <span class="text-2xl font-light tracking-normal">
        <span class="text-[#4f8f1f]">SMART</span><span class="text-[#6fa832]">Caly</span><span class="text-[#b8cc45]">x</span>
      </span>
      <span class="mt-1 text-[8px] font-medium tracking-[0.16em] text-gray-400">MAINTENANCE INTELLIGENTE</span>
    </div>
  </div>
</template>
