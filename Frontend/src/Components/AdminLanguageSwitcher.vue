<template>
  <div
    ref="switcherRef"
    :class="['admin-language-switcher', { floating }]"
    :dir="language === 'AR' ? 'rtl' : 'ltr'"
  >
    <button
      type="button"
      class="language-button"
      :aria-label="content.label"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click.stop="toggleMenu"
    >
      {{ currentLanguageLabel }}
    </button>

    <div v-if="isOpen" class="language-menu">
      <button type="button" @click="selectLanguage('FR')">Français</button>
      <button type="button" @click="selectLanguage('EN')">English</button>
      <button type="button" @click="selectLanguage('AR')">العربية</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  floating: {
    type: Boolean,
    default: false,
  },
})

const languageStore = useLanguageStore()
const isOpen = ref(false)
const switcherRef = ref(null)
const language = computed(() => languageStore.language)

const languageLabels = {
  FR: 'Français',
  EN: 'English',
  AR: 'العربية',
}

const currentLanguageLabel = computed(() => languageLabels[language.value] || language.value)

const content = computed(() => {
  const labels = {
    FR: { label: 'Changer la langue' },
    EN: { label: 'Change language' },
    AR: { label: 'تغيير اللغة' },
  }

  return labels[language.value] || labels.FR
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function selectLanguage(nextLanguage) {
  languageStore.setLanguage(nextLanguage)
  isOpen.value = false
}

function closeOnOutsideClick(event) {
  if (!switcherRef.value?.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
})
</script>

<style scoped>
.admin-language-switcher {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.admin-language-switcher.floating {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 45;
}

[dir='rtl'].admin-language-switcher.floating {
  right: auto;
  left: 24px;
}

.admin-language-switcher.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.language-button {
  min-width: 78px;
  height: 48px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  color: #17210a;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 950;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.language-button:hover {
  border-color: rgba(79, 125, 32, 0.35);
  background: #f7fbe9;
  transform: translateY(-1px);
}

.language-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 60;
  width: 144px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16);
}

[dir='rtl'] .language-menu {
  right: auto;
  left: 0;
}

.language-menu button {
  width: 100%;
  min-height: 40px;
  border: 0;
  background: transparent;
  color: #17210a;
  padding: 0 14px;
  text-align: start;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
}

.language-menu button:hover {
  background: #f1f7db;
  color: #4f6f12;
}

:global(:root[data-theme='dark']) .language-button {
  border-color: rgba(215, 236, 120, 0.18);
  background: #172112;
  color: #eef6dc;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
}

:global(:root[data-theme='dark']) .language-button:hover {
  background: #223019;
}

:global(:root[data-theme='dark']) .language-menu {
  border-color: rgba(215, 236, 120, 0.18);
  background: #172112;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
}

:global(:root[data-theme='dark']) .language-menu button {
  color: #eef6dc;
}

:global(:root[data-theme='dark']) .language-menu button:hover {
  background: #223019;
  color: #d7ec78;
}

@media (max-width: 640px) {
  .admin-language-switcher.floating {
    top: 18px;
    right: 16px;
  }

  [dir='rtl'].admin-language-switcher.floating {
    right: auto;
    left: 16px;
  }
}
</style>
