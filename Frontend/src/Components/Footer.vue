<script setup>
defineProps({
  language: {
    type: String,
    default: 'FR',
  },
})
</script>

<template>
  <footer class="bg-white pb-6 pt-0">
    <div class="mx-8 bg-[#6fa832] py-3 text-center text-sm font-medium tracking-wide text-white">
      <span v-if="language === 'FR'">&copy; 2026 SmartCalyx - Tous droits reserves</span>
      <span v-else-if="language === 'EN'">&copy; 2026 SmartCalyx - All rights reserved</span>
      <span v-else dir="rtl">&copy; 2026 SmartCalyx - جميع الحقوق محفوظة</span>
    </div>
  </footer>
</template>
