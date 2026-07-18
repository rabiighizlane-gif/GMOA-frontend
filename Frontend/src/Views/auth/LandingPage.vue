<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import Navbar from '@/Components/Navbar.vue'
import SpaceCard from '@/Components/SpaceCard.vue'
import FeaturesBar from '@/Components/FeaturesBar.vue'
import AboutSection from '@/Components/AboutSection.vue'
import Footer from '@/Components/Footer.vue'

import imgOperateur from '@/assets/operateur.png'
import imgAdmin from '@/assets/Admin.png'
import imgTechnicien from '@/assets/Technicien.png'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const selectedSpace = ref('')
const loginSpace = ref('')
const loginMessage = ref('')
const router = useRouter()
const roleBySpace = {
  Operateur: 'operator',
  Administration: 'admin',
  Technicien: 'technician',
}

const content = {
  FR: {
    title: 'La solution intelligente pour une maintenance industrielle connectee et securisee',
    subtitle: 'Choisissez votre espace pour commencer',
    selectedText: 'Espace selectionne',
    loginMessage: (space) => `Espace ${space} selectionne. Redirection vers la connexion...`,
    cards: {
      Operateur: {
        text: "Signalez rapidement les pannes et suivez l'etat de vos demandes d'intervention.",
        button: 'Espace Operateur',
      },
      Administration: {
        text: 'Accedez au tableau de bord, consultez les rapports de maintenance et gerez les equipes.',
        button: 'Espace Administration',
      },
      Technicien: {
        text: 'Recevez vos interventions, cloturez les demandes de maintenance et gerez les pieces de rechange.',
        button: 'Espace Technicien',
      },
    },
  },
  EN: {
    title: 'The smart solution for connected and secure industrial maintenance',
    subtitle: 'Choose your workspace to get started',
    selectedText: 'Workspace selected',
    loginMessage: (space) => `${space} workspace selected. Redirecting to login...`,
    cards: {
      Operateur: {
        text: 'Report failures quickly and track the status of your intervention requests.',
        button: 'Operator Workspace',
      },
      Administration: {
        text: 'Access dashboards, review maintenance reports, and manage teams.',
        button: 'Administration Workspace',
      },
      Technicien: {
        text: 'Receive interventions, close maintenance requests, and manage spare parts.',
        button: 'Technician Workspace',
      },
    },
  },
  AR: {
    title: 'الحل الذكي لصيانة صناعية متصلة وآمنة',
    subtitle: 'اختر الفضاء المناسب للبدء',
    selectedText: 'تم اختيار الفضاء',
    loginMessage: (space) => `تم اختيار فضاء ${space}. جار الانتقال إلى تسجيل الدخول...`,
    cards: {
      Operateur: {
        text: 'قم بالتبليغ عن الأعطال بسرعة وتتبع حالة طلبات التدخل.',
        button: 'فضاء المشغل',
      },
      Administration: {
        text: 'ادخل إلى لوحة القيادة، راجع تقارير الصيانة، وقم بتدبير الفرق.',
        button: 'فضاء الإدارة',
      },
      Technicien: {
        text: 'استقبل التدخلات، أغلق طلبات الصيانة، وقم بتدبير قطع الغيار.',
        button: 'فضاء التقني',
      },
    },
  },
}

function setLanguage(nextLanguage) {
  languageStore.setLanguage(nextLanguage)
  loginMessage.value = ''
}

function selectSpace(space = '') {
  selectedSpace.value = space
  if (space) {
    loginSpace.value = space
  }
  loginMessage.value = ''
}

function handleLogin() {
  if (!loginSpace.value) return
  localStorage.setItem('selectedSpace', loginSpace.value)
  loginMessage.value = content[language.value].loginMessage(loginSpace.value)
  goToLogin(loginSpace.value)
}

function goToLogin(space) {
  const role = roleBySpace[space]
  if (!role) return
  localStorage.setItem('selectedSpace', space)
  router.push({ path: '/login', query: { role } })
}
</script>

<template>
  <div class="min-h-screen bg-white px-4 py-10 font-sans">
    <div class="mx-auto flex min-h-[760px] max-w-5xl flex-col overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.74),rgba(255,255,255,0.74)),url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000')] bg-cover bg-center shadow-sm">
      <Navbar
        :selectedSpace="loginSpace"
        :language="language"
        @login="handleLogin"
        @language-change="setLanguage"
      />

      <main id="accueil" class="flex flex-grow items-center justify-center px-6 py-10">
        <div class="max-w-5xl text-center" :dir="language === 'AR' ? 'rtl' : 'ltr'">
          <h1 class="mx-auto mb-3 max-w-3xl text-3xl font-bold leading-snug text-gray-800 md:text-4xl">
            {{ content[language].title }}
          </h1>
          <p class="mb-12 text-2xl font-semibold text-[#76b033]">
            {{ content[language].subtitle }}
          </p>
          <p
            v-if="loginMessage"
            class="mx-auto mb-8 max-w-xl rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-[#5b9223] shadow-sm"
          >
            {{ loginMessage }}
          </p>

          <div class="flex flex-wrap justify-center gap-8">
            <SpaceCard
              type="red"
              space="Operateur"
              :imageSrc="imgOperateur"
              :text="content[language].cards.Operateur.text"
              :buttonText="content[language].cards.Operateur.button"
              :selectedText="content[language].selectedText"
              :selected="selectedSpace === 'Operateur'"
              @select="selectSpace"
              @login="goToLogin"
            />
            <SpaceCard
              type="yellow"
              space="Administration"
              :imageSrc="imgAdmin"
              :text="content[language].cards.Administration.text"
              :buttonText="content[language].cards.Administration.button"
              :selectedText="content[language].selectedText"
              :selected="selectedSpace === 'Administration'"
              @select="selectSpace"
              @login="goToLogin"
            />
            <SpaceCard
              type="orange"
              space="Technicien"
              :imageSrc="imgTechnicien"
              :text="content[language].cards.Technicien.text"
              :buttonText="content[language].cards.Technicien.button"
              :selectedText="content[language].selectedText"
              :selected="selectedSpace === 'Technicien'"
              @select="selectSpace"
              @login="goToLogin"
            />
          </div>
        </div>
      </main>

      <FeaturesBar :language="language" />
      <AboutSection :language="language" />
      <Footer :language="language" />
    </div>
  </div>
</template>
