<template>
  <main class="dashboard-layout min-h-screen bg-slate-50 text-slate-800" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.sidebarToggle"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>

    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="flex-1 min-w-0 p-6 space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ content.title }}</h1>
          <p class="text-sm text-slate-500">{{ content.subtitle }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-3 lg:justify-end">
          <label class="relative block w-full sm:w-64">
            <input
              v-model="searchQuery"
              type="search"
              class="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
              :placeholder="content.searchPlaceholder"
            />
            <Search class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          </label>

          <AdminLanguageSwitcher />

          <button
            class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:bg-slate-50"
            type="button"
            :aria-label="content.notifications"
          >
            <Bell class="h-5 w-5" aria-hidden="true" />
            <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-extrabold text-white">
              {{ content.unavailableValue }}
            </span>
          </button>

          <div class="calendar-chip flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
            <CalendarDays class="h-4 w-4" aria-hidden="true" />
            <span>{{ formattedDate }}</span>
          </div>

          <div class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-extrabold leading-10 text-slate-900 shadow-sm">
            {{ formattedTime }}
          </div>

          <span class="h-10 rounded-full bg-emerald-100 px-3 text-sm font-bold leading-10 text-emerald-800">
            {{ content.live }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          :title="content.cards.machines.title"
          :value="content.unavailableValue"
          :subTitle="content.unavailable"
          :icon-component="Settings"
          iconClass="h-6 w-6 text-blue-700"
          iconBgClass="bg-blue-50"
          subTitleClass="text-emerald-600"
        />
        <StatCard
          :title="content.cards.users.title"
          :value="content.unavailableValue"
          :subTitle="content.unavailable"
          :icon-component="Users"
          iconClass="h-6 w-6 text-emerald-700"
          iconBgClass="bg-emerald-50"
          subTitleClass="text-emerald-500"
        />
        <StatCard
          :title="content.cards.interventions.title"
          :value="content.unavailableValue"
          :subTitle="content.unavailable"
          :icon-component="Wrench"
          iconClass="h-6 w-6 text-amber-700"
          iconBgClass="bg-amber-50"
          subTitleClass="text-amber-500"
        />
        <StatCard
          :title="content.cards.criticalBreakdowns.title"
          :value="content.unavailableValue"
          :subTitle="content.unavailable"
          :icon-component="AlertTriangle"
          iconClass="h-6 w-6 text-rose-700"
          iconBgClass="bg-rose-50"
          valueClass="text-rose-600"
          subTitleClass="text-rose-500"
        />
        <StatCard
          :title="content.cards.planned.title"
          :value="content.unavailableValue"
          :subTitle="content.unavailable"
          :icon-component="FileCheck"
          iconClass="h-6 w-6 text-indigo-700"
          iconBgClass="bg-indigo-50"
          valueClass="text-indigo-600"
          subTitleClass="text-indigo-500"
        />
        <StatCard
          :title="content.cards.criticalParts.title"
          :value="content.unavailableValue"
          :subTitle="content.unavailable"
          :icon-component="Package"
          iconClass="h-6 w-6 text-slate-700"
          iconBgClass="bg-slate-100"
          subTitleClass="text-rose-500"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-3">
          <MachineStatusChart />
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:col-span-3">
          <PreventiveMaintenanceChart />
          <article class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <header class="mb-4">
              <h3 class="text-xl font-extrabold text-slate-900">{{ content.correctiveMaintenance }}</h3>
              <p class="mt-1 text-sm font-semibold text-slate-500">{{ content.correctiveMaintenanceUnavailable }}</p>
            </header>
            <div class="grid min-h-[300px] place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm font-bold text-slate-500">
              {{ content.unavailable }}
            </div>
          </article>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
          <h3 class="mb-4 text-2xl font-extrabold text-slate-900">{{ content.recentAlerts }}</h3>
          <div class="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
            <template v-if="recentAlerts.length">
              <AlertItem
                v-for="alert in recentAlerts"
                :key="alert.id"
                :type="alert.type"
                :title="alert.title"
                :description="alert.description"
                :time="alert.time"
              />
            </template>
            <div v-else class="px-4 py-8 text-center text-sm font-bold text-slate-500">
              {{ content.unavailable }}
            </div>
          </div>
          <RouterLink
            :to="{ name: 'admin-notifications' }"
            class="mt-5 inline-flex items-center gap-3 text-sm font-extrabold text-green-700 transition hover:text-green-800"
          >
            {{ content.viewAllAlerts }}
            <span class="text-2xl leading-none">-></span>
          </RouterLink>
        </div>
      </div>

      <InterventionTable :data="recentInterventions" />
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  FileCheck,
  Package,
  Search,
  Settings,
  Users,
  Wrench,
} from '@lucide/vue'

import AdminLanguageSwitcher from '@/Components/AdminLanguageSwitcher.vue'
import AlertItem from '@/Components/Dashboard/AlertItem.vue'
import InterventionTable from '@/Components/Dashboard/InterventionTable.vue'
import Sidebar from '@/Components/sidebar.vue'
import StatCard from '@/Components/Dashboard/Statcard.vue'
import MachineStatusChart from '@/Components/Dashboard/MachineStatusChart.vue'
import PreventiveMaintenanceChart from '@/Components/Dashboard/Charts/PreventiveMaintenanceChart.vue'

const languageStore = useLanguageStore()
const searchQuery = ref('')
const now = ref(new Date())
const isSidebarOpen = ref(false)
let clockInterval

const language = computed(() => languageStore.language)

const dashboardContent = {
  FR: {
    locale: 'fr-FR',
    title: 'Tableau de bord de Maintenance',
    subtitle: "Vue globale sur l'etat de l'usine en temps reel.",
    searchPlaceholder: 'Rechercher...',
    languageLabel: 'Changer la langue',
    sidebarToggle: 'Afficher le menu',
    notifications: 'Notifications',
    live: 'Live',
    unavailable: 'Donnees indisponibles',
    unavailableValue: '—',
    recentAlerts: 'Alertes recentes',
    correctiveMaintenance: 'Maintenance corrective',
    correctiveMaintenanceUnavailable: 'Les donnees de maintenance corrective ne sont pas encore disponibles.',
    viewAllAlerts: 'Voir toutes les alertes',
    yesterday: 'Hier',
    cards: {
      machines: { title: 'Machines', subtitle: 'Donnees indisponibles' },
      users: { title: 'Utilisateurs', subtitle: 'Donnees indisponibles' },
      interventions: { title: 'Interventions', subtitle: 'Donnees indisponibles' },
      criticalBreakdowns: { title: 'Pannes Critiques', subtitle: 'Donnees indisponibles' },
      planned: { title: 'Prevues', subtitle: 'Donnees indisponibles' },
      criticalParts: { title: 'Pieces Critiques', subtitle: 'Donnees indisponibles' },
    },
    alerts: [],
    interventions: [],
  },
  EN: {
    locale: 'en-US',
    title: 'Maintenance Dashboard',
    subtitle: 'Global real-time view of the factory status.',
    searchPlaceholder: 'Search...',
    languageLabel: 'Change language',
    sidebarToggle: 'Show menu',
    notifications: 'Notifications',
    live: 'Live',
    unavailable: 'Data unavailable',
    unavailableValue: '—',
    recentAlerts: 'Recent alerts',
    correctiveMaintenance: 'Corrective maintenance',
    correctiveMaintenanceUnavailable: 'Corrective maintenance data is not available yet.',
    viewAllAlerts: 'View all alerts',
    yesterday: 'Yesterday',
    cards: {
      machines: { title: 'Machines', subtitle: 'Data unavailable' },
      users: { title: 'Users', subtitle: 'Data unavailable' },
      interventions: { title: 'Interventions', subtitle: 'Data unavailable' },
      criticalBreakdowns: { title: 'Critical Breakdowns', subtitle: 'Data unavailable' },
      planned: { title: 'Planned', subtitle: 'Data unavailable' },
      criticalParts: { title: 'Critical Parts', subtitle: 'Data unavailable' },
    },
    alerts: [],
    interventions: [],
  },
  AR: {
    locale: 'ar-MA',
    title: 'Ù„ÙˆØ­Ø© ØªØ­ÙƒÙ… Ø§Ù„ØµÙŠØ§Ù†Ø©',
    subtitle: 'Ù†Ø¸Ø±Ø© Ø´Ø§Ù…Ù„Ø© ÙˆÙ…Ø¨Ø§Ø´Ø±Ø© Ø¹Ù„Ù‰ Ø­Ø§Ù„Ø© Ø§Ù„Ù…ØµÙ†Ø¹.',
    searchPlaceholder: 'Ø¨Ø­Ø«...',
    languageLabel: 'ØªØºÙŠÙŠØ± Ø§Ù„Ù„ØºØ©',
    notifications: 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª',
    live: 'Ù…Ø¨Ø§Ø´Ø±',
    unavailable: 'Donnees indisponibles',
    unavailableValue: '—',
    recentAlerts: 'Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø£Ø®ÙŠØ±Ø©',
    correctiveMaintenance: 'Maintenance corrective',
    correctiveMaintenanceUnavailable: 'Les donnees de maintenance corrective ne sont pas encore disponibles.',
    viewAllAlerts: 'Ø¹Ø±Ø¶ ÙƒÙ„ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª',
    yesterday: 'Ø£Ù…Ø³',
    cards: {
      machines: { title: 'Ø§Ù„Ø¢Ù„Ø§Øª', subtitle: 'Donnees indisponibles' },
      users: { title: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†', subtitle: 'Donnees indisponibles' },
      interventions: { title: 'Ø§Ù„ØªØ¯Ø®Ù„Ø§Øª', subtitle: 'Donnees indisponibles' },
      criticalBreakdowns: { title: 'Ø£Ø¹Ø·Ø§Ù„ Ø­Ø±Ø¬Ø©', subtitle: 'Ø¥Ø¬Ø±Ø§Ø¡ Ù…Ø·Ù„ÙˆØ¨' },
      planned: { title: 'Ù…Ø¨Ø±Ù…Ø¬Ø©', subtitle: 'Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹' },
      criticalParts: { title: 'Ù‚Ø·Ø¹ Ø­Ø±Ø¬Ø©', subtitle: 'ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø§Ø³ØªØ¨Ø¯Ø§Ù„' },
    },
    alerts: [],
    interventions: [],
  },
}

const content = computed(() => ({
  ...dashboardContent.FR,
  ...(dashboardContent[language.value] || {}),
}))

const formattedDate = computed(() =>
  new Intl.DateTimeFormat(content.value.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now.value),
)

const formattedTime = computed(() =>
  new Intl.DateTimeFormat(content.value.locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now.value),
)

const recentAlerts = computed(() =>
  content.value.alerts,
)

const recentInterventions = computed(() =>
  content.value.interventions,
)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
  window.clearInterval(clockInterval)
})
</script>

<style scoped>
.dashboard-layout {
  position: relative;
  display: flex;
  background: #f7f9f3;
  color: #4a0a0a;
}

.dashboard-layout > section {
  padding-left: 88px;
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 50;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid rgba(74, 10, 10, 0.1);
  border-radius: 16px;
  background: #ffffff;
  color: #4a0a0a;
  box-shadow: 0 12px 28px rgba(74, 10, 10, 0.12);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    visibility 0.18s ease;
}

.sidebar-toggle:hover {
  border-color: rgba(106, 154, 42, 0.35);
  background: #f7f9f3;
  transform: translateY(-1px);
}

.sidebar-toggle.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.sidebar-toggle span {
  width: 22px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(74, 10, 10, 0.28);
}

.dashboard-layout :deep(.text-slate-900),
.dashboard-layout :deep(.text-slate-800),
.dashboard-layout :deep(.text-slate-700) {
  color: #4a0a0a !important;
}

.dashboard-layout :deep(.text-slate-500),
.dashboard-layout :deep(.text-slate-400),
.dashboard-layout :deep(.text-slate-600) {
  color: rgba(74, 10, 10, 0.62) !important;
}

.dashboard-layout :deep(.bg-white) {
  background-color: #ffffff !important;
}

.dashboard-layout :deep(.border-slate-100),
.dashboard-layout :deep(.border-slate-200) {
  border-color: rgba(74, 10, 10, 0.1) !important;
}

.dashboard-layout :deep(.shadow-sm) {
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.06) !important;
}

.dashboard-layout :deep(input[type='search']) {
  border-color: rgba(74, 10, 10, 0.12) !important;
  color: #4a0a0a !important;
}

.dashboard-layout :deep(input[type='search']:focus) {
  border-color: rgba(106, 154, 42, 0.4) !important;
  box-shadow: 0 0 0 4px rgba(182, 198, 91, 0.2) !important;
}

.dashboard-layout :deep(.bg-blue-50),
.dashboard-layout :deep(.bg-emerald-50),
.dashboard-layout :deep(.bg-indigo-50),
.dashboard-layout :deep(.bg-slate-50),
.dashboard-layout :deep(.bg-slate-100) {
  background-color: rgba(182, 198, 91, 0.18) !important;
}

.dashboard-layout :deep(.bg-amber-50) {
  background-color: rgba(232, 179, 0, 0.18) !important;
}

.dashboard-layout :deep(.bg-rose-50),
.dashboard-layout :deep(.bg-rose-100) {
  background-color: rgba(227, 30, 36, 0.12) !important;
}

.dashboard-layout :deep(.bg-emerald-100) {
  background-color: rgba(182, 198, 91, 0.24) !important;
}

.dashboard-layout :deep(.bg-amber-100) {
  background-color: rgba(232, 179, 0, 0.22) !important;
}

.dashboard-layout :deep(.text-emerald-500),
.dashboard-layout :deep(.text-emerald-600),
.dashboard-layout :deep(.text-emerald-800),
.dashboard-layout :deep(.text-green-700),
.dashboard-layout :deep(.text-green-800) {
  color: #6a9a2a !important;
}

.dashboard-layout :deep(.text-amber-500),
.dashboard-layout :deep(.text-amber-600),
.dashboard-layout :deep(.text-amber-800),
.dashboard-layout :deep(.text-indigo-500),
.dashboard-layout :deep(.text-indigo-600) {
  color: #e8b300 !important;
}

.dashboard-layout :deep(.text-rose-500),
.dashboard-layout :deep(.text-rose-600),
.dashboard-layout :deep(.text-rose-800) {
  color: #e31e24 !important;
}

.dashboard-layout :deep(.bg-green-600) {
  background-color: #6a9a2a !important;
}

.dashboard-layout :deep(.divide-slate-200 > :not([hidden]) ~ :not([hidden])),
.dashboard-layout :deep(.divide-slate-100 > :not([hidden]) ~ :not([hidden])) {
  border-color: rgba(74, 10, 10, 0.1) !important;
}

.dashboard-layout :deep(.hover\:bg-slate-50:hover),
.dashboard-layout :deep(.hover\:bg-slate-50\/50:hover) {
  background-color: #f7f9f3 !important;
}

[dir='rtl'] .sidebar-toggle {
  right: 24px;
  left: auto;
}

[dir='rtl'].dashboard-layout > section {
  padding-right: 88px;
  padding-left: 24px;
}

@media (max-width: 640px) {
  .dashboard-layout > section {
    padding-left: 76px;
  }

  [dir='rtl'].dashboard-layout > section {
    padding-right: 76px;
    padding-left: 16px;
  }

  .sidebar-toggle {
    top: 18px;
    left: 16px;
  }

  [dir='rtl'] .sidebar-toggle {
    right: 16px;
  }
}
</style>
