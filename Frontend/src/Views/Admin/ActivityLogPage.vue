<template>
  <main class="activity-layout" :dir="pageDirection">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.menu"
      @click="toggleSidebar"
    >
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="activity-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">{{ content.breadcrumb }}</p>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
      </header>

      <section class="filters-card">
        <input v-model="search" type="search" :placeholder="content.search" />
        <select v-model="moduleFilter">
          <option value="">{{ content.allModules }}</option>
          <option v-for="module in modules" :key="module" :value="module">
            {{ translate('modules', module) }}
          </option>
        </select>
        <select v-model="resultFilter">
          <option value="">{{ content.allResults }}</option>
          <option v-for="result in results" :key="result" :value="result">
            {{ translate('results', result) }}
          </option>
        </select>
        <button type="button" @click="resetFilters">{{ content.reset }}</button>
      </section>

      <section class="activity-card">
        <article v-for="entry in filteredEntries" :key="entry.id" class="activity-row">
          <div class="time-box">
            <strong dir="ltr">{{ entry.time }}</strong>
            <span dir="ltr">{{ entry.date }}</span>
          </div>
          <div class="actor">
            <strong>{{ translate('users', entry.user) }}</strong>
            <span>{{ translate('roles', entry.role) }}</span>
          </div>
          <div class="action">
            <strong>{{ translate('actions', entry.actionKey) }}</strong>
            <span>
              {{ translate('modules', entry.module) }}
              <span dir="ltr">- IP {{ entry.ip }}</span>
            </span>
          </div>
          <span class="result" :class="{ failed: entry.result === 'failure' }">
            {{ translate('results', entry.result) }}
          </span>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import Sidebar from '@/Components/sidebar.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const search = ref('')
const moduleFilter = ref('')
const resultFilter = ref('')

const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const labels = {
  FR: {
    menu: 'Afficher le menu',
    breadcrumb: "Accueil / Journal d'activite",
    title: "Journal d'activite",
    subtitle: 'Historique systeme des actions realisees par les utilisateurs.',
    search: 'Rechercher utilisateur, action, module...',
    allModules: 'Tous les modules',
    allResults: 'Tous les resultats',
    reset: 'Reinitialiser',
  },
  EN: {
    menu: 'Show menu',
    breadcrumb: 'Home / Activity log',
    title: 'Activity log',
    subtitle: 'System history of actions performed by users.',
    search: 'Search user, action, module...',
    allModules: 'All modules',
    allResults: 'All results',
    reset: 'Reset',
  },
  AR: {
    menu: 'عرض القائمة',
    breadcrumb: 'الرئيسية / سجل النشاط',
    title: 'سجل النشاط',
    subtitle: 'تاريخ النظام للإجراءات التي قام بها المستخدمون.',
    search: 'ابحث عن مستخدم أو إجراء أو وحدة...',
    allModules: 'كل الوحدات',
    allResults: 'كل النتائج',
    reset: 'إعادة ضبط',
  },
}

const dictionaries = {
  FR: {
    users: {
      superAdmin: 'Super Admin',
      sara: 'Sara El Idrissi',
      ahmed: 'Ahmed El Mansouri',
      youssef: 'Youssef Berrada',
      nabil: 'Nabil Amrani',
    },
    roles: {
      superAdmin: 'Super Administratrice',
      technicianFemale: 'Technicienne',
      technician: 'Technicien',
      maintenanceManager: 'Responsable maintenance',
    },
    modules: {
      machines: 'Machines',
      interventions: 'Interventions',
      requests: 'Demandes',
      stock: 'Stock',
      users: 'Utilisateurs',
    },
    actions: {
      machineAdded: 'A ajoute une nouvelle machine.',
      interventionDone: "A termine l'intervention INT-889.",
      requestCreated: 'A cree une demande de maintenance.',
      stockUpdated: 'A modifie le stock : Filtre huile.',
      userCreated: 'A cree un utilisateur.',
      unauthorizedDelete: 'Tentative de suppression non autorisee.',
    },
    results: { success: 'Succes', failure: 'Echec' },
  },
  EN: {
    users: {
      superAdmin: 'Super Admin',
      sara: 'Sara El Idrissi',
      ahmed: 'Ahmed El Mansouri',
      youssef: 'Youssef Berrada',
      nabil: 'Nabil Amrani',
    },
    roles: {
      superAdmin: 'Super Administrator',
      technicianFemale: 'Technician',
      technician: 'Technician',
      maintenanceManager: 'Maintenance manager',
    },
    modules: {
      machines: 'Machines',
      interventions: 'Interventions',
      requests: 'Requests',
      stock: 'Stock',
      users: 'Users',
    },
    actions: {
      machineAdded: 'Added a new machine.',
      interventionDone: 'Completed intervention INT-889.',
      requestCreated: 'Created a maintenance request.',
      stockUpdated: 'Updated stock: Oil filter.',
      userCreated: 'Created a user.',
      unauthorizedDelete: 'Unauthorized deletion attempt.',
    },
    results: { success: 'Success', failure: 'Failure' },
  },
  AR: {
    users: {
      superAdmin: 'المدير العام',
      sara: 'سارة الإدريسي',
      ahmed: 'أحمد المنصوري',
      youssef: 'يوسف برادة',
      nabil: 'نبيل العمراني',
    },
    roles: {
      superAdmin: 'مديرة عامة',
      technicianFemale: 'تقنية',
      technician: 'تقني',
      maintenanceManager: 'مسؤول الصيانة',
    },
    modules: {
      machines: 'الآلات',
      interventions: 'التدخلات',
      requests: 'الطلبات',
      stock: 'المخزون',
      users: 'المستخدمون',
    },
    actions: {
      machineAdded: 'أضاف آلة جديدة.',
      interventionDone: 'أنهى التدخل INT-889.',
      requestCreated: 'أنشأ طلب صيانة.',
      stockUpdated: 'عدّل المخزون: مرشح الزيت.',
      userCreated: 'أنشأ مستخدما.',
      unauthorizedDelete: 'محاولة حذف غير مصرح بها.',
    },
    results: { success: 'نجاح', failure: 'فشل' },
  },
}

const entries = [
  { id: 1, date: '18/07/2026', time: '19:22', user: 'superAdmin', role: 'superAdmin', actionKey: 'machineAdded', module: 'machines', ip: '192.168.1.24', result: 'success' },
  { id: 2, date: '18/07/2026', time: '18:05', user: 'sara', role: 'technicianFemale', actionKey: 'interventionDone', module: 'interventions', ip: '192.168.1.31', result: 'success' },
  { id: 3, date: '18/07/2026', time: '17:54', user: 'ahmed', role: 'technician', actionKey: 'requestCreated', module: 'requests', ip: '192.168.1.33', result: 'success' },
  { id: 4, date: '18/07/2026', time: '16:40', user: 'youssef', role: 'maintenanceManager', actionKey: 'stockUpdated', module: 'stock', ip: '192.168.1.40', result: 'success' },
  { id: 5, date: '18/07/2026', time: '14:18', user: 'superAdmin', role: 'superAdmin', actionKey: 'userCreated', module: 'users', ip: '192.168.1.24', result: 'success' },
  { id: 6, date: '18/07/2026', time: '13:02', user: 'nabil', role: 'technician', actionKey: 'unauthorizedDelete', module: 'machines', ip: '192.168.1.28', result: 'failure' },
]

const modules = ['machines', 'interventions', 'requests', 'stock', 'users']
const results = ['success', 'failure']

const content = computed(() => labels[languageStore.language] || labels.FR)
const dictionary = computed(() => dictionaries[languageStore.language] || dictionaries.FR)

const filteredEntries = computed(() => {
  const query = search.value.trim().toLowerCase()

  return entries.filter((entry) => {
    const searchable = [
      translate('users', entry.user),
      translate('roles', entry.role),
      translate('actions', entry.actionKey),
      translate('modules', entry.module),
      translate('results', entry.result),
      entry.ip,
      entry.time,
      entry.date,
    ]
      .join(' ')
      .toLowerCase()

    return (
      (!query || searchable.includes(query)) &&
      (!moduleFilter.value || entry.module === moduleFilter.value) &&
      (!resultFilter.value || entry.result === resultFilter.value)
    )
  })
})

function translate(group, key) {
  return dictionary.value[group]?.[key] || key
}

function resetFilters() {
  search.value = ''
  moduleFilter.value = ''
  resultFilter.value = ''
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.activity-layout { min-height: 100vh; background: #f7f9f3; color: #4a0a0a; }
.activity-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; }
.activity-layout[dir='rtl'] .activity-page { padding-right: 88px; padding-left: 28px; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 90; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; box-shadow: 0 10px 30px rgba(74,10,10,.08); cursor: pointer; }
.activity-layout[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(74,10,10,.28); }
.breadcrumb { margin: 0 0 7px; color: #6a9a2a; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 34px; font-weight: 950; letter-spacing: 0; }
.page-header p { margin: 8px 0 0; color: #64748b; font-size: 15px; font-weight: 720; }
.filters-card { display: grid; grid-template-columns: minmax(260px, 1fr) 220px 180px 150px; gap: 12px; padding: 16px; background: white; border: 1px solid #edf0e8; border-radius: 18px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.activity-layout[dir='rtl'] .filters-card { grid-template-columns: 150px 180px 220px minmax(260px, 1fr); }
.filters-card input, .filters-card select, .filters-card button { min-height: 46px; min-width: 0; padding: 0 14px; border: 1px solid #dfe5d6; border-radius: 12px; background: white; color: #4a0a0a; font: inherit; font-weight: 850; }
.filters-card button { color: #64748b; cursor: pointer; }
.activity-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.activity-row { display: grid; grid-template-columns: 130px 220px minmax(0, 1fr) 110px; align-items: center; gap: 18px; padding: 18px 22px; border-top: 1px solid #edf0e8; }
.activity-layout[dir='rtl'] .activity-row { grid-template-columns: 110px minmax(0, 1fr) 220px 130px; }
.activity-row:first-child { border-top: 0; }
.time-box strong, .actor strong, .action strong { display: block; color: #4a0a0a; font-size: 14px; font-weight: 950; }
.time-box span, .actor span, .action span { display: block; margin-top: 5px; color: #64748b; font-size: 12px; font-weight: 780; }
.result { justify-self: end; padding: 7px 12px; border-radius: 999px; background: #e7f3d5; color: #6a9a2a; font-size: 12px; font-weight: 950; }
.activity-layout[dir='rtl'] .result { justify-self: start; }
.result.failed { background: #fee2e2; color: #e31e24; }
@media (max-width: 980px) {
  .filters-card,
  .activity-layout[dir='rtl'] .filters-card,
  .activity-row,
  .activity-layout[dir='rtl'] .activity-row { grid-template-columns: 1fr; }
  .result,
  .activity-layout[dir='rtl'] .result { justify-self: start; }
}
@media (max-width: 760px) {
  .activity-page,
  .activity-layout[dir='rtl'] .activity-page { padding: 88px 16px 32px; }
}
</style>
