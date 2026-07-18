<template>
  <main class="interventions-layout">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      aria-label="Afficher le menu"
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
          <nav aria-label="Fil d'Ariane">
            <span>Accueil</span>
            <strong>&gt;</strong>
            <span>Interventions</span>
          </nav>
          <h1>Interventions</h1>
          <p>Suivi opérationnel des interventions de maintenance, priorités et temps de résolution.</p>
        </div>
        <AdminTopControls v-model="globalSearch" />
      </header>

      <KPICards :cards="kpiCards" />
      <FiltersBar v-model="filters" :can-create="canManageInterventions" :technicians="technicians" />
      <InterventionTable
        :can-manage="canManageInterventions"
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

const techniciansData = {
  nabil: { name: 'Nabil Amrani', initials: 'NA', phone: '+212 6 11 24 39 80', service: 'Maintenance', color: '#6A9A2A' },
  ahmed: { name: 'Ahmed El Mansouri', initials: 'AE', phone: '+212 6 23 88 14 02', service: 'Hydraulique', color: '#FF6A00' },
  youssef: { name: 'Youssef Berrada', initials: 'YB', phone: '+212 6 45 10 77 31', service: 'Production', color: '#E8B300' },
  sara: { name: 'Sara El Idrissi', initials: 'SE', phone: '+212 6 74 52 18 46', service: 'Qualité', color: '#4A0A0A' },
  karim: { name: 'Karim El Fassi', initials: 'KF', phone: '+212 6 60 31 42 12', service: 'Électricité', color: '#E31E24' },
}

const interventions = [
  buildIntervention('INT-892', 'Tour d’usinage M-102', 'Ligne Production 1', 'Corrective', 'Critique', techniciansData.nabil, '15/07/2026 08:30', '15/07/2026 14:10', 'Terminée', 'Fuite hydraulique sur vérin principal'),
  buildIntervention('INT-891', 'Presse hydraulique M-215', 'Ligne Production 2', 'Préventive', 'Moyenne', techniciansData.ahmed, '16/07/2026 09:00', '16/07/2026 11:25', 'Terminée', 'Contrôle pression et remplacement filtre'),
  buildIntervention('INT-890', 'Convoyeur à bande M-309', 'Ligne Conditionnement', 'Corrective', 'Haute', techniciansData.youssef, '18/07/2026 10:20', '—', 'En cours', 'Vibration élevée sur tambour moteur'),
  buildIntervention('INT-889', 'Compresseur d’air M-412', 'Ligne Utilités', 'Préventive', 'Basse', techniciansData.sara, '18/07/2026 13:00', '—', 'En attente', 'Inspection sécurité trimestrielle'),
  buildIntervention('INT-888', 'Pasteurisateur P-204', 'Ligne Production 1', 'Corrective', 'Critique', techniciansData.karim, '17/07/2026 15:40', '17/07/2026 18:15', 'Terminée', 'Arrêt automatique répété'),
  buildIntervention('INT-887', 'Remplisseuse R-118', 'Ligne Conditionnement', 'Amélioration', 'Moyenne', techniciansData.nabil, '14/07/2026 08:15', '14/07/2026 10:00', 'Terminée', 'Réglage dosage et calibration capteurs'),
  buildIntervention('INT-886', 'Étiqueteuse E-330', 'Ligne Conditionnement', 'Préventive', 'Basse', techniciansData.ahmed, '19/07/2026 08:00', '—', 'En attente', 'Contrôle alignement et nettoyage'),
  buildIntervention('INT-885', 'Pompe CIP P-101', 'Ligne Utilités', 'Corrective', 'Haute', techniciansData.youssef, '18/07/2026 12:10', '—', 'En cours', 'Débit instable pendant le cycle'),
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
  const done = interventions.filter((item) => item.status === 'Terminée').length
  const pending = interventions.filter((item) => item.status === 'En attente').length
  return [
    { icon: 'activity', title: 'Interventions totales', value: total, evolution: '+12% ce mois', tone: 'primary' },
    { icon: 'clock', title: 'En cours', value: inProgress, evolution: '2 urgentes', tone: 'attention' },
    { icon: 'check', title: 'Terminées', value: done, evolution: '94% validées', tone: 'primary' },
    { icon: 'pause', title: 'En attente', value: pending, evolution: 'Planification', tone: 'danger' },
    { icon: 'users', title: 'Techniciens actifs', value: technicians.value.length, evolution: '5 disponibles', tone: 'primary' },
    { icon: 'timer', title: "Temps moyen d'intervention", value: '2h 35', evolution: '-18 min', tone: 'warning' },
  ]
})

function buildIntervention(id, machine, line, type, priority, technician, start, end, status, description) {
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
    duration: end === '—' ? 'En calcul' : '5h 40',
    diagnostic: {
      cause: priority === 'Critique' ? 'Usure mécanique accélérée' : 'Contrôle planifié ou dérive mineure',
      symptoms: description,
      solution: status === 'Terminée' ? 'Action corrective réalisée et test validé' : 'Diagnostic en cours',
      notes: 'Intervention documentée dans le plan de maintenance SmartCalyx.',
    },
    parts: [
      { name: 'Joint hydraulique', reference: 'JH-400-22', quantity: 1, state: 'Utilisée' },
      { name: 'Filtre huile', reference: 'FH-110-A', quantity: 2, state: status === 'Terminée' ? 'Validée' : 'Réservée' },
    ],
    history: [
      { label: 'Intervention créée', time: start, description: 'Demande enregistrée dans SmartCalyx.' },
      { label: 'Affectée au technicien', time: start, description: `${technician.name} affecté à l’intervention.` },
      { label: 'Début intervention', time: start, description: 'Début des contrôles terrain.' },
      { label: 'Diagnostic', time: start, description },
      { label: status === 'Terminée' ? 'Validation' : 'Réparation', time: end, description: status === 'Terminée' ? 'Tests terminés et intervention validée.' : 'Action en progression.' },
    ],
    files: [
      { type: 'Photo avant', title: `${id}-avant.jpg`, meta: 'Image terrain' },
      { type: 'Photo après', title: `${id}-apres.jpg`, meta: status === 'Terminée' ? 'Disponible' : 'À ajouter' },
      { type: 'Rapport PDF', title: `${id}-rapport.pdf`, meta: 'PDF maintenance' },
      { type: 'Pièce jointe', title: `${id}-checklist.xlsx`, meta: 'Checklist contrôle' },
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
  .interventions-page {
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
