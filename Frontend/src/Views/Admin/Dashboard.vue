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
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-base text-slate-500">🔍</span>
          </label>

          <AdminLanguageSwitcher />

          <button
            class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:bg-slate-50"
            type="button"
            :aria-label="content.notifications"
          >
            🔔
            <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-extrabold text-white">
              3
            </span>
          </button>

          <div class="calendar-chip flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
            <span class="text-base">📅</span>
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
          value="145"
          :subTitle="content.cards.machines.subtitle"
          icon="⚙️"
          iconBgClass="bg-blue-50"
          subTitleClass="text-emerald-600"
        />
        <StatCard
          :title="content.cards.users.title"
          value="32"
          :subTitle="content.cards.users.subtitle"
          icon="👥"
          iconBgClass="bg-emerald-50"
          subTitleClass="text-emerald-500"
        />
        <StatCard
          :title="content.cards.interventions.title"
          value="18"
          :subTitle="content.cards.interventions.subtitle"
          icon="🔧"
          iconBgClass="bg-amber-50"
          subTitleClass="text-amber-500"
        />
        <StatCard
          :title="content.cards.criticalBreakdowns.title"
          value="4"
          :subTitle="content.cards.criticalBreakdowns.subtitle"
          icon="🚨"
          iconBgClass="bg-rose-50"
          valueClass="text-rose-600"
          subTitleClass="text-rose-500"
        />
        <StatCard
          :title="content.cards.planned.title"
          value="15"
          :subTitle="content.cards.planned.subtitle"
          icon="📅"
          iconBgClass="bg-indigo-50"
          valueClass="text-indigo-600"
          subTitleClass="text-indigo-500"
        />
        <StatCard
          :title="content.cards.criticalParts.title"
          value="6"
          :subTitle="content.cards.criticalParts.subtitle"
          icon="🔩"
          iconBgClass="bg-slate-100"
          subTitleClass="text-rose-500"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-3">
          <MachineStatusChart />
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
          <h3 class="mb-4 text-2xl font-extrabold text-slate-900">{{ content.recentAlerts }}</h3>
          <div class="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
            <AlertItem
              v-for="alert in recentAlerts"
              :key="alert.id"
              :type="alert.type"
              :title="alert.title"
              :description="alert.description"
              :time="alert.time"
            />
          </div>
          <button class="mt-5 inline-flex items-center gap-3 text-sm font-extrabold text-green-700">
            {{ content.viewAllAlerts }}
            <span class="text-2xl leading-none">-></span>
          </button>
        </div>
      </div>

      <InterventionTable :data="recentInterventions" />
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

import AdminLanguageSwitcher from '@/Components/AdminLanguageSwitcher.vue'
import AlertItem from '@/Components/Dashboard/AlertItem.vue'
import InterventionTable from '@/Components/Dashboard/InterventionTable.vue'
import Sidebar from '@/Components/sidebar.vue'
import StatCard from '@/Components/Dashboard/Statcard.vue'
import MachineStatusChart from '@/Components/Dashboard/MachineStatusChart.vue'

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
    recentAlerts: 'Alertes recentes',
    viewAllAlerts: 'Voir toutes les alertes',
    yesterday: 'Hier',
    cards: {
      machines: { title: 'Machines', subtitle: '130 Actives | 15 Arrets' },
      users: { title: 'Utilisateurs', subtitle: '8 En ligne' },
      interventions: { title: 'Interventions', subtitle: '7 En cours' },
      criticalBreakdowns: { title: 'Pannes Critiques', subtitle: 'Action requise' },
      planned: { title: 'Prevues', subtitle: 'Cette semaine' },
      criticalParts: { title: 'Pieces Critiques', subtitle: 'A remplacer' },
    },
    alerts: [
      {
        type: 'critical',
        title: 'Panne critique sur Pasteurisateur #2',
        description: 'Arret immediat de la machine recommande.',
        time: '10:15',
      },
      {
        type: 'warning',
        title: 'Maintenance preventive en retard',
        description: 'Compresseur #1 - Echeance depassee de 3 jours.',
        time: 'Hier',
      },
      {
        type: 'anomaly',
        title: 'Anomalie detectee',
        description: 'Convoyeur #4 - Niveau de vibration eleve.',
        time: 'Hier',
      },
      {
        type: 'info',
        title: 'Intervention urgente',
        description: "Ensacheuse #3 - Fuite d'air detectee.",
        time: 'Hier',
      },
    ],
    interventions: [
      {
        machine: 'Pasteurisateur #2',
        type: 'Preventif',
        typeKey: 'preventive',
        technician: 'Ahmed',
        status: 'En cours',
        statusKey: 'inProgress',
        time: '14:32',
      },
      {
        machine: 'Convoyeur #4',
        type: 'Curatif',
        typeKey: 'curative',
        technician: 'Nabil',
        status: 'En attente',
        statusKey: 'pending',
        time: '12:15',
      },
      {
        machine: 'Pompe #1',
        type: 'Amelioration',
        typeKey: 'improvement',
        technician: 'Youssef',
        status: 'Termine',
        statusKey: 'completed',
        time: 'Hier',
      },
    ],
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
    recentAlerts: 'Recent alerts',
    viewAllAlerts: 'View all alerts',
    yesterday: 'Yesterday',
    cards: {
      machines: { title: 'Machines', subtitle: '130 Active | 15 Stopped' },
      users: { title: 'Users', subtitle: '8 Online' },
      interventions: { title: 'Interventions', subtitle: '7 In progress' },
      criticalBreakdowns: { title: 'Critical Breakdowns', subtitle: 'Action required' },
      planned: { title: 'Planned', subtitle: 'This week' },
      criticalParts: { title: 'Critical Parts', subtitle: 'To replace' },
    },
    alerts: [
      {
        type: 'critical',
        title: 'Critical breakdown on Pasteurizer #2',
        description: 'Immediate machine shutdown recommended.',
        time: '10:15',
      },
      {
        type: 'warning',
        title: 'Preventive maintenance overdue',
        description: 'Compressor #1 - Deadline exceeded by 3 days.',
        time: 'Yesterday',
      },
      {
        type: 'anomaly',
        title: 'Anomaly detected',
        description: 'Conveyor #4 - High vibration level.',
        time: 'Yesterday',
      },
      {
        type: 'info',
        title: 'Urgent intervention',
        description: 'Bagging machine #3 - Air leak detected.',
        time: 'Yesterday',
      },
    ],
    interventions: [
      {
        machine: 'Pasteurizer #2',
        type: 'Preventive',
        typeKey: 'preventive',
        technician: 'Ahmed',
        status: 'In progress',
        statusKey: 'inProgress',
        time: '14:32',
      },
      {
        machine: 'Conveyor #4',
        type: 'Curative',
        typeKey: 'curative',
        technician: 'Nabil',
        status: 'Pending',
        statusKey: 'pending',
        time: '12:15',
      },
      {
        machine: 'Pump #1',
        type: 'Improvement',
        typeKey: 'improvement',
        technician: 'Youssef',
        status: 'Completed',
        statusKey: 'completed',
        time: 'Yesterday',
      },
    ],
  },
  AR: {
    locale: 'ar-MA',
    title: 'لوحة تحكم الصيانة',
    subtitle: 'نظرة شاملة ومباشرة على حالة المصنع.',
    searchPlaceholder: 'بحث...',
    languageLabel: 'تغيير اللغة',
    notifications: 'الإشعارات',
    live: 'مباشر',
    recentAlerts: 'التنبيهات الأخيرة',
    viewAllAlerts: 'عرض كل التنبيهات',
    yesterday: 'أمس',
    cards: {
      machines: { title: 'الآلات', subtitle: '130 نشطة | 15 متوقفة' },
      users: { title: 'المستخدمون', subtitle: '8 متصلون' },
      interventions: { title: 'التدخلات', subtitle: '7 قيد الإنجاز' },
      criticalBreakdowns: { title: 'أعطال حرجة', subtitle: 'إجراء مطلوب' },
      planned: { title: 'مبرمجة', subtitle: 'هذا الأسبوع' },
      criticalParts: { title: 'قطع حرجة', subtitle: 'تحتاج إلى استبدال' },
    },
    alerts: [
      {
        type: 'critical',
        title: 'عطل حرج في المبستر #2',
        description: 'يوصى بإيقاف الآلة فورا.',
        time: '10:15',
      },
      {
        type: 'warning',
        title: 'تأخر الصيانة الوقائية',
        description: 'الضاغط #1 - تجاوز الموعد بثلاثة أيام.',
        time: 'أمس',
      },
      {
        type: 'anomaly',
        title: 'تم اكتشاف خلل',
        description: 'الناقل #4 - مستوى اهتزاز مرتفع.',
        time: 'أمس',
      },
      {
        type: 'info',
        title: 'تدخل عاجل',
        description: 'آلة التعبئة #3 - تم اكتشاف تسرب هواء.',
        time: 'أمس',
      },
    ],
    interventions: [
      {
        machine: 'المبستر #2',
        type: 'وقائي',
        typeKey: 'preventive',
        technician: 'Ahmed',
        status: 'قيد الإنجاز',
        statusKey: 'inProgress',
        time: '14:32',
      },
      {
        machine: 'الناقل #4',
        type: 'إصلاحي',
        typeKey: 'curative',
        technician: 'Nabil',
        status: 'في الانتظار',
        statusKey: 'pending',
        time: '12:15',
      },
      {
        machine: 'المضخة #1',
        type: 'تحسين',
        typeKey: 'improvement',
        technician: 'Youssef',
        status: 'مكتمل',
        statusKey: 'completed',
        time: 'أمس',
      },
    ],
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
  content.value.alerts.map((alert, index) => ({
    id: index + 1,
    ...alert,
  })),
)

const recentInterventions = computed(() =>
  content.value.interventions.map((intervention, index) => ({
    id: `#INT-${892 - index}`,
    ...intervention,
  })),
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
