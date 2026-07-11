<script setup>
import appLogo from '../assets/logo.png'
</script>

<template>
  <header class="px-2 pt-6">
    <div class="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <div class="flex h-14 w-72 items-center gap-2 bg-white px-3 shadow-sm [clip-path:polygon(0_0,78%_0,100%_12%,84%_50%,100%_88%,78%_100%,0_100%)]">
        <div class="h-11 w-14 overflow-hidden [clip-path:polygon(0_0,78%_0,100%_12%,84%_50%,100%_88%,78%_100%,0_100%)]">
          <img :src="appLogo" alt="SMARTCalyx Logo" class="h-full w-full object-cover object-center" />
        </div>
        <div class="flex flex-col items-center leading-none">
            <span class="text-2xl font-light tracking-normal">
              <span class="text-[#4f8f1f]">SMART</span><span class="text-[#6fa832]">Caly</span><span class="text-[#b8cc45]">x</span>
            </span>
            <span class="mt-1 text-[8px] font-medium tracking-[0.16em] text-gray-400">MAINTENANCE INTELLIGENTE</span>
        </div>
      </div>

      <nav class="flex items-center gap-8">
        <a href="#fonctionnalites" class="font-medium text-gray-600 transition-colors hover:text-[#5b9223]">Fonctionnalites</a>
        <a href="#contact" class="font-medium text-gray-600 transition-colors hover:text-[#5b9223]">Contact</a>
        <button class="rounded-full bg-[#6fa832] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5b9223]">
          se connecter
        </button>
        <span class="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">FR</span>
      </nav>
    </div>
  </header>
</template>
