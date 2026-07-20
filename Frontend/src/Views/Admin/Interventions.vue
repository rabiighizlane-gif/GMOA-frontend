<template>
  <main class="interventions-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
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

    <section class="interventions-page">
      <header class="page-header">
        <div>
          <nav :aria-label="content.breadcrumbLabel">
            <span>{{ content.home }}</span>
            <strong>&gt;</strong>
            <span>{{ content.title }}</span>
          </nav>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
        <AdminTopControls v-model="globalSearch" />
      </header>
      <KPICards :cards="kpiCards" />
      <FiltersBar v-model="filters" :can-create="canManageInterventions" :content="content.filters" :technicians="technicians" />
      <InterventionTable
        :can-manage="canManageInterventions"
        :content="content.table"
        :rows="filteredInterventions"
        @view="selectedIntervention = $event"
      />

      <section class="charts-grid" aria-label="Graphiques interventions">
        <InterventionsByMonth />
        <InterventionTypesChart />
        <TopTechniciansChart />
        <AverageTimeChart />
        <PriorityChart />
        <SlaGauge />
      </section>
    </section>

    <InterventionDrawer :intervention="selectedIntervention" @close="selectedIntervention = null" />
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import AverageTimeChart from '@/Components/charts/AverageTimeChart.vue'
import FiltersBar from '@/Components/Interventions/FiltersBar.vue'
import InterventionDrawer from '@/Components/Interventions/InterventionDrawer.vue'
import InterventionTable from '@/Components/Interventions/InterventionTable.vue'
import InterventionsByMonth from '@/Components/charts/InterventionsByMonth.vue'
import InterventionTypesChart from '@/Components/charts/InterventionTypesChart.vue'
import KPICards from '@/Components/Interventions/KPICards.vue'
import PriorityChart from '@/Components/charts/PriorityChart.vue'
import SlaGauge from '@/Components/charts/SlaGauge.vue'
import Sidebar from '@/Components/sidebar.vue'
import TopTechniciansChart from '@/Components/charts/TopTechniciansChart.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const globalSearch = ref('')
const selectedIntervention = ref(null)
const isSidebarOpen = ref(false)
const storedUser = ref(localStorage.getItem('user'))
const filters = ref({
  search: '',
  date: '',
  technician: '',
  status: '',
})

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    breadcrumbLabel: "Fil d'Ariane",
    home: 'Accueil',
    title: 'Interventions',
    subtitle: 'Suivi operationnel des interventions de maintenance, priorites et temps de resolution.',
    kpis: {
      total: ['Interventions totales', '+12% ce mois'],
      inProgress: ['En cours', '2 urgentes'],
      done: ['Terminees', '94% validees'],
      pending: ['En attente', 'Planification'],
      technicians: ['Techniciens actifs', '5 disponibles'],
      average: ["Temps moyen d'intervention", '-18 min'],
    },
    filters: { search: 'Rechercher une intervention...', date: 'Date', technician: 'Technicien', status: 'Statut', all: 'Tous', done: 'Terminee', inProgress: 'En cours', pending: 'En attente', export: 'Export', create: 'Nouvelle intervention' },
    table: {
      title: 'Liste des interventions',
      count: (count) => `${count} interventions trouvees`,
      page: (current, total) => `Page ${current} / ${total}`,
      columns: { id: 'ID', machine: 'Machine', line: 'Ligne', type: 'Type', priority: 'Priorite', technicianName: 'Technicien', start: 'Debut', end: 'Fin', status: 'Statut', actions: 'Actions' },
      previous: 'Precedent',
      next: 'Suivant',
      of: 'sur',
      view: 'Voir',
      edit: 'Modifier',
      more: 'Plus',
    },
  },
  EN: {
    sidebarToggle: 'Show menu',
    breadcrumbLabel: 'Breadcrumb',
    home: 'Home',
    title: 'Interventions',
    subtitle: 'Operational tracking of maintenance interventions, priorities, and resolution time.',
    kpis: {
      total: ['Total interventions', '+12% this month'],
      inProgress: ['In progress', '2 urgent'],
      done: ['Completed', '94% validated'],
      pending: ['Pending', 'Planning'],
      technicians: ['Active technicians', '5 available'],
      average: ['Average intervention time', '-18 min'],
    },
    filters: { search: 'Search intervention...', date: 'Date', technician: 'Technician', status: 'Status', all: 'All', done: 'Completed', inProgress: 'In progress', pending: 'Pending', export: 'Export', create: 'New intervention' },
    table: {
      title: 'Intervention list',
      count: (count) => `${count} interventions found`,
      page: (current, total) => `Page ${current} / ${total}`,
      columns: { id: 'ID', machine: 'Machine', line: 'Line', type: 'Type', priority: 'Priority', technicianName: 'Technician', start: 'Start', end: 'End', status: 'Status', actions: 'Actions' },
      previous: 'Previous',
      next: 'Next',
      of: 'of',
      view: 'View',
      edit: 'Edit',
      more: 'More',
    },
  },
  AR: {
    sidebarToggle: '\u0639\u0631\u0636 \u0627\u0644\u0642\u0627\u0626\u0645\u0629',
    breadcrumbLabel: '\u0627\u0644\u0645\u0633\u0627\u0631',
    home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
    title: '\u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a',
    subtitle: '\u0645\u062a\u0627\u0628\u0639\u0629 \u062a\u0634\u063a\u064a\u0644\u064a\u0629 \u0644\u062a\u062f\u062e\u0644\u0627\u062a \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0648\u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0627\u062a \u0648\u0645\u062f\u0629 \u0627\u0644\u062d\u0644.',
    kpis: {
      total: ['\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a', '+12% \u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631'],
      inProgress: ['\u0642\u064a\u062f \u0627\u0644\u062a\u0646\u0641\u064a\u0630', '\u062d\u0627\u0644\u062a\u0627\u0646 \u0639\u0627\u062c\u0644\u062a\u0627\u0646'],
      done: ['\u0645\u0643\u062a\u0645\u0644\u0629', '94% \u0645\u0635\u0627\u062f\u0642 \u0639\u0644\u064a\u0647\u0627'],
      pending: ['\u0641\u064a \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631', '\u062a\u062e\u0637\u064a\u0637'],
      technicians: ['\u062a\u0642\u0646\u064a\u0648\u0646 \u0646\u0634\u0637\u0648\u0646', '5 \u0645\u062a\u0627\u062d\u0648\u0646'],
      average: ['\u0645\u062a\u0648\u0633\u0637 \u0645\u062f\u0629 \u0627\u0644\u062a\u062f\u062e\u0644', '-18 \u062f\u0642\u064a\u0642\u0629'],
    },
    filters: { search: '\u0627\u0628\u062d\u062b \u0639\u0646 \u062a\u062f\u062e\u0644...', date: '\u0627\u0644\u062a\u0627\u0631\u064a\u062e', technician: '\u0627\u0644\u062a\u0642\u0646\u064a', status: '\u0627\u0644\u062d\u0627\u0644\u0629', all: '\u0627\u0644\u0643\u0644', done: '\u0645\u0643\u062a\u0645\u0644\u0629', inProgress: '\u0642\u064a\u062f \u0627\u0644\u062a\u0646\u0641\u064a\u0630', pending: '\u0641\u064a \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631', export: '\u062a\u0635\u062f\u064a\u0631', create: '\u062a\u062f\u062e\u0644 \u062c\u062f\u064a\u062f' },
    table: {
      title: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a',
      count: (count) => `\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 ${count} \u062a\u062f\u062e\u0644\u0627\u062a`,
      page: (current, total) => `\u0627\u0644\u0635\u0641\u062d\u0629 ${current} / ${total}`,
      columns: { id: '\u0627\u0644\u0645\u0639\u0631\u0641', machine: '\u0627\u0644\u0622\u0644\u0629', line: '\u0627\u0644\u062e\u0637', type: '\u0627\u0644\u0646\u0648\u0639', priority: '\u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0629', technicianName: '\u0627\u0644\u062a\u0642\u0646\u064a', start: '\u0627\u0644\u0628\u062f\u0621', end: '\u0627\u0644\u0646\u0647\u0627\u064a\u0629', status: '\u0627\u0644\u062d\u0627\u0644\u0629', actions: '\u0625\u062c\u0631\u0627\u0621\u0627\u062a' },
      previous: '\u0627\u0644\u0633\u0627\u0628\u0642',
      next: '\u0627\u0644\u062a\u0627\u0644\u064a',
      of: '\u0645\u0646',
      view: '\u0639\u0631\u0636',
      edit: '\u062a\u0639\u062f\u064a\u0644',
      more: '\u0627\u0644\u0645\u0632\u064a\u062f',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const techniciansData = {
  nabil: { name: 'Nabil Amrani', initials: 'NA', phone: '+212 6 11 24 39 80', service: 'Maintenance', color: '#6A9A2A' },
  ahmed: { name: 'Ahmed El Mansouri', initials: 'AE', phone: '+212 6 23 88 14 02', service: 'Hydraulique', color: '#FF6A00' },
  youssef: { name: 'Youssef Berrada', initials: 'YB', phone: '+212 6 45 10 77 31', service: 'Production', color: '#E8B300' },
  sara: { name: 'Sara El Idrissi', initials: 'SE', phone: '+212 6 74 52 18 46', service: 'QualitÃƒÆ’Ã‚Â©', color: '#4A0A0A' },
  karim: { name: 'Karim El Fassi', initials: 'KF', phone: '+212 6 60 31 42 12', service: 'ÃƒÆ’Ã¢â‚¬Â°lectricitÃƒÆ’Ã‚Â©', color: '#E31E24' },
}

const interventions = [
  buildIntervention('INT-892', 'Tour usinage M-102', 'Ligne Production 1', 'Corrective', 'Critique', techniciansData.nabil, '15/07/2026 08:30', '15/07/2026 14:10', 'Terminee', 'Fuite hydraulique sur verin principal'),
  buildIntervention('INT-891', 'Presse hydraulique M-215', 'Ligne Production 2', 'Preventive', 'Moyenne', techniciansData.ahmed, '16/07/2026 09:00', '16/07/2026 11:25', 'Terminee', 'Controle pression et remplacement filtre'),
  buildIntervention('INT-890', 'Convoyeur a bande M-309', 'Ligne Conditionnement', 'Corrective', 'Haute', techniciansData.youssef, '18/07/2026 10:20', '-', 'En cours', 'Vibration elevee sur tambour moteur'),
  buildIntervention('INT-889', "Compresseur d'air M-412", 'Ligne Utilites', 'Preventive', 'Basse', techniciansData.sara, '18/07/2026 13:00', '-', 'En attente', 'Inspection securite trimestrielle'),
  buildIntervention('INT-888', 'Pasteurisateur P-204', 'Ligne Production 1', 'Corrective', 'Critique', techniciansData.karim, '17/07/2026 15:40', '17/07/2026 18:15', 'Terminee', 'Arret automatique repete'),
  buildIntervention('INT-887', 'Remplisseuse R-118', 'Ligne Conditionnement', 'Amelioration', 'Moyenne', techniciansData.nabil, '14/07/2026 08:15', '14/07/2026 10:00', 'Terminee', 'Reglage dosage et calibration capteurs'),
  buildIntervention('INT-886', 'Etiqueteuse E-330', 'Ligne Conditionnement', 'Preventive', 'Basse', techniciansData.ahmed, '19/07/2026 08:00', '-', 'En attente', 'Controle alignement et nettoyage'),
  buildIntervention('INT-885', 'Pompe CIP P-101', 'Ligne Utilites', 'Corrective', 'Haute', techniciansData.youssef, '18/07/2026 12:10', '-', 'En cours', 'Debit instable pendant le cycle'),
]
const technicians = computed(() => Object.values(techniciansData).map((technician) => technician.name))

const currentUserRole = computed(() => {
  try {
    const user = JSON.parse(storedUser.value || '{}')
    return String(user.role || '').toLowerCase().replace(/[\s_-]+/g, '')
  } catch {
    return ''
  }
})

const canManageInterventions = computed(() => currentUserRole.value !== 'superadmin')

const filteredInterventions = computed(() => {
  const query = `${globalSearch.value} ${filters.value.search}`.trim().toLowerCase()

  return interventions.filter((item) => {
    const matchesQuery =
      !query ||
      [item.id, item.machine, item.line, item.type, item.priority, item.technician.name, item.status, item.description]
        .join(' ')
        .toLowerCase()
        .includes(query)
    const matchesTechnician = !filters.value.technician || item.technician.name === filters.value.technician
    const matchesStatus = !filters.value.status || item.status === filters.value.status
    const matchesDate = !filters.value.date || item.start.includes(formatDateFilter(filters.value.date))
    return matchesQuery && matchesTechnician && matchesStatus && matchesDate
  })
})

const kpiCards = computed(() => {
  const total = interventions.length
  const inProgress = interventions.filter((item) => item.status === 'En cours').length
  const done = interventions.filter((item) => item.status === 'Terminee').length
  const pending = interventions.filter((item) => item.status === 'En attente').length
  return [
    { icon: 'activity', title: content.value.kpis.total[0], value: total, evolution: content.value.kpis.total[1], tone: 'primary' },
    { icon: 'clock', title: content.value.kpis.inProgress[0], value: inProgress, evolution: content.value.kpis.inProgress[1], tone: 'attention' },
    { icon: 'check', title: content.value.kpis.done[0], value: done, evolution: content.value.kpis.done[1], tone: 'primary' },
    { icon: 'pause', title: content.value.kpis.pending[0], value: pending, evolution: content.value.kpis.pending[1], tone: 'danger' },
    { icon: 'users', title: content.value.kpis.technicians[0], value: technicians.value.length, evolution: content.value.kpis.technicians[1], tone: 'primary' },
    { icon: 'timer', title: content.value.kpis.average[0], value: '2h 35', evolution: content.value.kpis.average[1], tone: 'warning' },
  ]
})
function buildIntervention(id, machine, line, type, priority, technician, start, end, status, description) {
  const isDone = status === 'Terminee'

  return {
    id,
    machine,
    line,
    type,
    priority,
    technician,
    start,
    end,
    status,
    description,
    createdAt: start,
    duration: end === '-' ? 'En calcul' : '5h 40',
    diagnostic: {
      cause: priority === 'Critique' ? 'Usure mecanique acceleree' : 'Controle planifie ou derive mineure',
      symptoms: description,
      solution: isDone ? 'Action corrective realisee et test valide' : 'Diagnostic en cours',
      notes: 'Intervention documentee dans le plan de maintenance SmartCalyx.',
    },
    parts: [
      { name: 'Joint hydraulique', reference: 'JH-400-22', quantity: 1, state: 'Utilisee' },
      { name: 'Filtre huile', reference: 'FH-110-A', quantity: 2, state: isDone ? 'Validee' : 'Reservee' },
    ],
    history: [
      { label: 'Intervention creee', time: start, description: 'Demande enregistree dans SmartCalyx.' },
      { label: 'Affectee au technicien', time: start, description: `${technician.name} affecte a l intervention.` },
      { label: 'Debut intervention', time: start, description: 'Debut des controles terrain.' },
      { label: 'Diagnostic', time: start, description },
      { label: isDone ? 'Validation' : 'Reparation', time: end, description: isDone ? 'Tests termines et intervention validee.' : 'Action en progression.' },
    ],
    files: [
      { type: 'Photo avant', title: `${id}-avant.jpg`, meta: 'Image terrain' },
      { type: 'Photo apres', title: `${id}-apres.jpg`, meta: isDone ? 'Disponible' : 'A ajouter' },
      { type: 'Rapport PDF', title: `${id}-rapport.pdf`, meta: 'PDF maintenance' },
      { type: 'Piece jointe', title: `${id}-checklist.xlsx`, meta: 'Checklist controle' },
    ],
  }
}
function formatDateFilter(date) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.interventions-layout {
  min-height: 100vh;
  background: var(--sc-bg);
  color: var(--sc-dark);
}

.interventions-page {
  min-height: 100vh;
  display: grid;
  gap: 20px;
  padding: 32px 28px 44px 88px;
}

[dir='rtl'] .interventions-page {
  padding-right: 88px;
  padding-left: 28px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

nav {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
}

h1,
p {
  margin: 0;
}

h1 {
  margin-top: 10px;
  color: var(--sc-dark);
  font-size: 34px;
  font-weight: 950;
  letter-spacing: 0;
}

p {
  margin-top: 8px;
  color: var(--sc-muted);
  font-size: 15px;
  font-weight: 820;
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
  border: 1px solid var(--sc-border);
  border-radius: 16px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  box-shadow: var(--sc-shadow);
}

[dir='rtl'] .sidebar-toggle {
  right: 24px;
  left: auto;
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

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .interventions-page,
  [dir='rtl'] .interventions-page {
    padding: 88px 16px 32px;
  }
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

@media (max-width: 1300px) {
  .charts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
