import { ref } from 'vue'
import { defineStore } from 'pinia'

const defaultLanguage = localStorage.getItem('language') || 'FR'

export const useLanguageStore = defineStore('language', () => {
  const language = ref(defaultLanguage)

  function setLanguage(nextLanguage) {
    language.value = nextLanguage
    localStorage.setItem('language', nextLanguage)
  }

  return { language, setLanguage }
})
