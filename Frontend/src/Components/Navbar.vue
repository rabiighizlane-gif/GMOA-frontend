<script setup>
import { ref } from 'vue'
import AppBrand from '@/Components/AppBrand.vue'

defineProps({
  selectedSpace: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'FR',
  },
})

defineEmits(['login', 'language-change'])

const showLanguageMenu = ref(false)

function toggleLanguageMenu() {
  showLanguageMenu.value = !showLanguageMenu.value
}

function selectLanguage(language, emit) {
  emit('language-change', language)
  showLanguageMenu.value = false
}
</script>

<template>
  <header class="px-2 pt-6">
    <div class="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <AppBrand />

      <nav class="flex items-center gap-8">
        <a href="#accueil" class="font-medium text-gray-600 transition-colors hover:text-[#5b9223]">
          {{ language === 'FR' ? 'Accueil' : language === 'AR' ? 'الرئيسية' : 'Home' }}
        </a>
        <a href="#fonctionnalites" class="font-medium text-gray-600 transition-colors hover:text-[#5b9223]">
          {{ language === 'FR' ? 'Fonctionnalites' : language === 'AR' ? 'الوظائف' : 'Features' }}
        </a>
        <a href="#a-propos" class="font-medium text-gray-600 transition-colors hover:text-[#5b9223]">
          {{ language === 'FR' ? 'À propos' : language === 'AR' ? 'حول' : 'About' }}
        </a>
        <button
          class="rounded-full bg-[#6fa832] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5b9223] disabled:cursor-not-allowed disabled:bg-gray-300"
          :disabled="!selectedSpace"
          :title="selectedSpace ? `${language === 'FR' ? 'Connexion' : language === 'AR' ? 'تسجيل الدخول' : 'Login'} ${selectedSpace}` : language === 'FR' ? 'Choisissez un espace avant de vous connecter' : language === 'AR' ? 'اختر فضاء قبل تسجيل الدخول' : 'Choose a workspace before logging in'"
          @click="$emit('login')"
        >
          {{ selectedSpace ? `${language === 'FR' ? 'se connecter' : language === 'AR' ? 'تسجيل الدخول' : 'login'} - ${selectedSpace}` : language === 'FR' ? 'se connecter' : language === 'AR' ? 'تسجيل الدخول' : 'login' }}
        </button>
        <div class="relative">
          <button
            type="button"
            class="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-[#6fa832] hover:text-white"
            :aria-expanded="showLanguageMenu"
            aria-haspopup="true"
            title="Choisir la langue"
            @click="toggleLanguageMenu"
          >
            {{ language }}
          </button>

          <div
            v-if="showLanguageMenu"
            class="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 text-sm shadow-lg"
          >
            <button
              type="button"
              class="block w-full px-4 py-2 text-left font-medium text-gray-700 hover:bg-[#eef7e7] hover:text-[#5b9223]"
              @click="selectLanguage('FR', $emit)"
            >
              Francais
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 text-left font-medium text-gray-700 hover:bg-[#eef7e7] hover:text-[#5b9223]"
              @click="selectLanguage('EN', $emit)"
            >
              English
            </button>
            <button
              type="button"
              class="block w-full px-4 py-2 text-right font-medium text-gray-700 hover:bg-[#eef7e7] hover:text-[#5b9223]"
              @click="selectLanguage('AR', $emit)"
            >
              العربية
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
