<script setup>
defineProps({
  type: String, // 'red', 'yellow', 'orange'
  imageSrc: String,
  text: String,
  buttonText: String
})
</script>

<template>
  <div 
    class="bg-white rounded-2xl p-5 w-[280px] shadow-lg flex flex-col items-center text-center border-t-8 transition-transform hover:-translate-y-1"
    :class="{
      'border-[#cc1818]': type === 'red',
      'border-[#e6b800]': type === 'yellow',
      'border-[#ff6600]': type === 'orange'
    }"
  >
    <!-- Card Image Container -->
    <div class="w-full h-32 rounded-xl overflow-hidden mb-4 bg-gray-100">
      <img :src="imageSrc" alt="Espace Workspace" class="w-full h-full object-cover" />
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
      {{ text }}
    </p>

    <!-- Dynamic Button -->
    <button 
      class="w-full py-2.5 rounded-lg font-bold text-white text-sm shadow-sm hover:opacity-90 transition-opacity"
      :class="{
        'bg-[#cc1818]': type === 'red',
        'bg-[#e6b800] !text-gray-900': type === 'yellow',
        'bg-[#ff6600]': type === 'orange'
      }"
    >
      {{ buttonText }}
    </button>
  </div>
</template>