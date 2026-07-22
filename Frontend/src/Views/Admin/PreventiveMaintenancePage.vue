<template>
  <main class="preventive-page" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.menu"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div
      v-if="isSidebarOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="closeSidebar"
    ></div>

    <Sidebar
      :open="isSidebarOpen"
      @close="closeSidebar"
    />

    <header class="page-header">
      <div>
        <p class="breadcrumb">{{ content.breadcrumb }}</p>

        <h1>{{ content.title }}</h1>

        <p>{{ content.subtitle }}</p>
      </div>

      <div class="view-switcher">
        <button
          :class="{ active: currentView === 'list' }"
          @click="currentView = 'list'"
        >
          <PreventiveIcon name="list" />
          {{ content.list }}
        </button>

        <button
          :class="{ active: currentView === 'calendar' }"
          @click="currentView = 'calendar'"
        >
          <PreventiveIcon name="calendar" />
          {{ content.calendar }}
        </button>
      </div>
    </header>

    <div
      v-if="apiStatus.message"
      class="api-status"
      :class="`api-status--${apiStatus.type}`"
      role="status"
    >
      {{ apiStatus.message }}
    </div>

    <PreventiveKPICards />

    <PreventiveFiltersBar
      :filters="filters"
      @update-filter="updateFilter"
      @reset="resetFilters"
      @create="openCreateModal"
    />

    <PreventiveTable
      v-if="currentView === 'list'"
      :maintenances="filteredMaintenances"
      @view="openDrawer"
      @edit="openEditModal"
      @complete="completeMaintenance"
      @delete="deleteMaintenance"
      @export="exportMaintenances"
    />

    <PreventiveCalendar
      v-else
      :maintenances="filteredMaintenances"
      @select="openDrawer"
    />

    <PreventiveChartsSection />

    <PreventiveDrawer
      :open="drawerOpen"
      :maintenance="selectedMaintenance"
      @close="drawerOpen = false"
      @edit="openEditModal"
    />

    <PreventiveFormModal
      :open="modalOpen"
      :maintenance="maintenanceToEdit"
      @close="closeModal"
      @save="saveMaintenance"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import {
  completePreventiveMaintenance,
  createPreventiveMaintenance,
  deletePreventiveMaintenance,
  getPreventiveMaintenances,
  updatePreventiveMaintenance,
} from '@/services/preventiveMaintenanceService'

import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'
import PreventiveKPICards from '@/Components/PreventiveMaintenance/PreventiveKPICards.vue'
import PreventiveFiltersBar from '@/Components/PreventiveMaintenance/PreventiveFiltersBar.vue'
import PreventiveTable from '@/Components/PreventiveMaintenance/PreventiveTable.vue'
import PreventiveDrawer from '@/Components/PreventiveMaintenance/PreventiveDrawer.vue'
import PreventiveCalendar from '@/Components/PreventiveMaintenance/PreventiveCalendar.vue'
import PreventiveFormModal from '@/Components/PreventiveMaintenance/PreventiveFormModal.vue'
import PreventiveChartsSection from '@/Components/PreventiveMaintenance/PreventiveChartsSection.vue'
import Sidebar from '@/Components/sidebar.vue'

const currentView = ref('list')
const drawerOpen = ref(false)
const modalOpen = ref(false)
const selectedMaintenance = ref(null)
const maintenanceToEdit = ref(null)
const isSidebarOpen = ref(false)
const apiStatus = reactive({ type: '', message: '' })
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const pageContent = {
  FR: {
    menu: 'Afficher le menu',
    breadcrumb: 'Accueil / Maintenance preventive',
    title: 'Maintenance preventive',
    subtitle: 'Planification et suivi des operations programmees',
    list: 'Liste',
    calendar: 'Calendrier',
    newDeadline: 'Nouvellement planifiee',
    completedToday: 'Realisee aujourd hui',
    onlineLoaded: 'Mode online actif: donnees chargees depuis le backend.',
    offlinePrefix: 'Mode offline temporaire',
    synced: 'Plan synchronise avec le backend.',
    completed: 'Plan marque comme realise dans le backend.',
    deleted: 'Plan supprime du backend.',
  },
  EN: {
    menu: 'Show menu',
    breadcrumb: 'Home / Preventive maintenance',
    title: 'Preventive maintenance',
    subtitle: 'Planning and tracking scheduled operations',
    list: 'List',
    calendar: 'Calendar',
    newDeadline: 'Newly planned',
    completedToday: 'Completed today',
    onlineLoaded: 'Online mode active: data loaded from the backend.',
    offlinePrefix: 'Temporary offline mode',
    synced: 'Plan synced with the backend.',
    completed: 'Plan marked as completed in the backend.',
    deleted: 'Plan deleted from the backend.',
  },
  AR: {
    menu: '\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0642\u0627\u0626\u0645\u0629',
    breadcrumb: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 / \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0648\u0642\u0627\u0626\u064a\u0629',
    title: '\u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0648\u0642\u0627\u0626\u064a\u0629',
    subtitle: '\u062a\u062e\u0637\u064a\u0637 \u0648\u062a\u062a\u0628\u0639 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0645\u0628\u0631\u0645\u062c\u0629',
    list: '\u0642\u0627\u0626\u0645\u0629',
    calendar: '\u0627\u0644\u062a\u0642\u0648\u064a\u0645',
    newDeadline: '\u062a\u0645\u062a \u0628\u0631\u0645\u062c\u062a\u0647\u0627 \u062d\u062f\u064a\u062b\u0627',
    completedToday: '\u0623\u0646\u062c\u0632\u062a \u0627\u0644\u064a\u0648\u0645',
    onlineLoaded: '\u0646\u0645\u0637 \u0645\u062a\u0635\u0644: \u062a\u0645 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0646 \u0627\u0644\u062e\u0627\u062f\u0645.',
    offlinePrefix: '\u0646\u0645\u0637 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u0645\u0624\u0642\u062a',
    synced: '\u062a\u0645\u062a \u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u062e\u0637\u0629 \u0645\u0639 \u0627\u0644\u062e\u0627\u062f\u0645.',
    completed: '\u062a\u0645 \u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u062e\u0637\u0629 \u0643\u0645\u0646\u062c\u0632\u0629 \u0641\u064a \u0627\u0644\u062e\u0627\u062f\u0645.',
    deleted: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062e\u0637\u0629 \u0645\u0646 \u0627\u0644\u062e\u0627\u062f\u0645.',
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const filters = reactive({
  search: '',
  machine: '',
  frequency: '',
  status: ''
})

const fallbackMaintenances = [
  {
    id: 'MP-001',
    plan: 'Graissage du moteur',
    machine: 'Convoyeur M-309',
    line: 'Ligne Conditionnement',
    frequency: 'Mensuelle',
    lastExecution: '20/06/2026',
    nextDueDate: '20/07/2026',
    technician: 'Nabil Amrani',
    initials: 'NA',
    status: 'A venir',
    deadlineLabel: 'Dans 2 jours',
    deadlineColor: 'orange',
    description:
      'ContrÃ´le du moteur, vÃ©rification du niveau de lubrification et graissage des Ã©lÃ©ments mÃ©caniques.'
  },
  {
    id: 'MP-002',
    plan: 'ContrÃ´le de tempÃ©rature',
    machine: 'Pasteurisateur P-204',
    line: 'Ligne Production 1',
    frequency: 'Hebdomadaire',
    lastExecution: '10/07/2026',
    nextDueDate: '17/07/2026',
    technician: 'Sara El Idrissi',
    initials: 'SE',
    status: 'En retard',
    deadlineLabel: 'En retard de 1 jour',
    deadlineColor: 'red',
    description:
      'VÃ©rifier les capteurs, la tempÃ©rature de fonctionnement et le systÃ¨me de rÃ©gulation.'
  },
  {
    id: 'MP-003',
    plan: 'Nettoyage des filtres',
    machine: 'Compresseur M-412',
    line: 'Ligne Utilites',
    frequency: 'Trimestrielle',
    lastExecution: '01/05/2026',
    nextDueDate: '01/08/2026',
    technician: 'Youssef Berrada',
    initials: 'YB',
    status: 'Planifiee',
    deadlineLabel: 'Dans 14 jours',
    deadlineColor: 'green',
    description:
      'Nettoyage et remplacement Ã©ventuel des filtres du compresseur.'
  },
  {
    id: 'MP-004',
    plan: 'Inspection des buses',
    machine: 'Remplisseuse R-118',
    line: 'Ligne Conditionnement',
    frequency: 'Mensuelle',
    lastExecution: '15/07/2026',
    nextDueDate: '15/08/2026',
    technician: 'Ahmed El Mansouri',
    initials: 'AE',
    status: 'Realisee',
    deadlineLabel: 'RÃ©alisÃ©e le 15/07',
    deadlineColor: 'green',
    description:
      'Inspection, nettoyage et contrÃ´le de la pression des buses de remplissage.'
  }
]

const maintenances = ref([])

const formatDateForDisplay = (value) => {
  if (!value || value === '-') return '-'
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR').format(date)
}

const formatDateForInput = (value) => {
  if (!value || value === '-') return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/')
    return `${year}-${month}-${day}`
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const normalizeMaintenance = (maintenance) => ({
  id: maintenance.id || maintenance.reference,
  plan: maintenance.plan || maintenance.name || maintenance.title || '',
  machine: maintenance.machine || maintenance.machine_name || '',
  line: maintenance.line || maintenance.production_line || '',
  frequency: maintenance.frequency || '',
  lastExecution: formatDateForDisplay(maintenance.lastExecution || maintenance.last_execution),
  nextDueDate: formatDateForDisplay(maintenance.nextDueDate || maintenance.next_due_date),
  technician: maintenance.technician || maintenance.responsible || '',
  initials: maintenance.initials || initialsFromName(maintenance.technician || maintenance.responsible),
  status: maintenance.status || 'Planifiee',
  deadlineLabel: maintenance.deadlineLabel || maintenance.deadline_label || '',
  deadlineColor: maintenance.deadlineColor || maintenance.deadline_color || 'green',
  description: maintenance.description || '',
  estimatedDuration: maintenance.estimatedDuration || maintenance.estimated_duration || '',
  time: maintenance.time || '09:00',
})

const toApiPayload = (maintenance) => ({
  plan: maintenance.plan,
  machine: maintenance.machine,
  line: maintenance.line,
  frequency: maintenance.frequency,
  technician: maintenance.technician,
  nextDueDate: formatDateForInput(maintenance.nextDueDate),
  lastExecution: formatDateForInput(maintenance.lastExecution),
  estimatedDuration: maintenance.estimatedDuration,
  description: maintenance.description,
  status: maintenance.status,
})

function showStatus(type, message) {
  apiStatus.type = type
  apiStatus.message = message
}

async function loadMaintenances() {
  try {
    const onlineMaintenances = await getPreventiveMaintenances()
    maintenances.value = onlineMaintenances.map(normalizeMaintenance)
    showStatus('online', content.value.onlineLoaded)
  } catch (error) {
    maintenances.value = fallbackMaintenances.map(normalizeMaintenance)
    showStatus('offline', `${content.value.offlinePrefix}: ${error.message}`)
  }
}

onMounted(loadMaintenances)

const filteredMaintenances = computed(() => {
  const search = filters.search.toLowerCase().trim()

  return maintenances.value.filter((maintenance) => {
    const matchesSearch =
      !search ||
      maintenance.id.toLowerCase().includes(search) ||
      maintenance.plan.toLowerCase().includes(search) ||
      maintenance.machine.toLowerCase().includes(search)

    const matchesMachine =
      !filters.machine || maintenance.machine === filters.machine

    const matchesFrequency =
      !filters.frequency || maintenance.frequency === filters.frequency

    const matchesStatus =
      !filters.status || maintenance.status === filters.status

    return (
      matchesSearch &&
      matchesMachine &&
      matchesFrequency &&
      matchesStatus
    )
  })
})

const updateFilter = ({ key, value }) => {
  filters[key] = value
}

const resetFilters = () => {
  filters.search = ''
  filters.machine = ''
  filters.frequency = ''
  filters.status = ''
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openDrawer = (maintenance) => {
  selectedMaintenance.value = maintenance
  drawerOpen.value = true
}

const openCreateModal = () => {
  maintenanceToEdit.value = null
  modalOpen.value = true
}

const openEditModal = (maintenance) => {
  drawerOpen.value = false
  maintenanceToEdit.value = {
    ...maintenance,
    lastExecution: formatDateForInput(maintenance.lastExecution),
    nextDueDate: formatDateForInput(maintenance.nextDueDate),
  }
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  maintenanceToEdit.value = null
}

const saveMaintenanceLocal = (maintenance) => {
  if (maintenance.id) {
    const index = maintenances.value.findIndex(
      (item) => item.id === maintenance.id
    )

    if (index !== -1) {
      maintenances.value[index] = {
        ...maintenances.value[index],
        ...maintenance
      }
    }
  } else {
    const nextNumber = String(maintenances.value.length + 1).padStart(3, '0')

    maintenances.value.unshift({
      ...maintenance,
      id: `MP-${nextNumber}`,
      lastExecution: 'â€”',
      status: 'Planifiee',
      deadlineLabel: content.value.newDeadline,
      deadlineColor: 'green',
      initials: maintenance.technician
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    })
  }

  closeModal()
}

const completeMaintenanceLocal = (maintenance) => {
  maintenance.status = 'Realisee'
  maintenance.deadlineLabel = content.value.completedToday
  maintenance.deadlineColor = 'green'
}

const deleteMaintenanceLocal = (maintenance) => {
  maintenances.value = maintenances.value.filter(
    (item) => item.id !== maintenance.id
  )

  if (selectedMaintenance.value?.id === maintenance.id) {
    drawerOpen.value = false
    selectedMaintenance.value = null
  }
}

const saveMaintenance = async (maintenance) => {
  try {
    if (maintenance.id) {
      const savedMaintenance = await updatePreventiveMaintenance(maintenance.id, toApiPayload(maintenance))
      const index = maintenances.value.findIndex((item) => item.id === maintenance.id)

      if (index !== -1) {
        maintenances.value[index] = normalizeMaintenance(savedMaintenance)
      }
    } else {
      const savedMaintenance = await createPreventiveMaintenance(toApiPayload(maintenance))
      maintenances.value.unshift({
        ...normalizeMaintenance(savedMaintenance),
        deadlineLabel: savedMaintenance.deadlineLabel || savedMaintenance.deadline_label || content.value.newDeadline,
      })
    }

    showStatus('online', content.value.synced)
    closeModal()
  } catch (error) {
    showStatus('offline', error.message)
  }
}

const completeMaintenance = async (maintenance) => {
  try {
    const completedMaintenance = await completePreventiveMaintenance(maintenance.id)
    Object.assign(maintenance, normalizeMaintenance(completedMaintenance))
    showStatus('online', content.value.completed)
  } catch (error) {
    showStatus('offline', error.message)
  }
}

const deleteMaintenance = async (maintenance) => {
  try {
    await deletePreventiveMaintenance(maintenance.id)
    maintenances.value = maintenances.value.filter((item) => item.id !== maintenance.id)

    if (selectedMaintenance.value?.id === maintenance.id) {
      drawerOpen.value = false
      selectedMaintenance.value = null
    }

    showStatus('online', content.value.deleted)
  } catch (error) {
    showStatus('offline', error.message)
  }
}

const exportMaintenances = () => {
  const rows = filteredMaintenances.value.map((maintenance) => ({
    ID: maintenance.id,
    Plan: maintenance.plan,
    Machine: maintenance.machine,
    Ligne: maintenance.line,
    Frequence: maintenance.frequency,
    Derniere_realisation: maintenance.lastExecution,
    Prochaine_echeance: maintenance.nextDueDate,
    Responsable: maintenance.technician,
    Statut: maintenance.status,
  }))

  if (rows.length === 0) return

  const csv = [
    Object.keys(rows[0]).join(','),
    ...rows.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value || '').replaceAll('"', '""')}"`)
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'maintenance-preventive.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.preventive-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 28px 28px 38px 88px;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 20% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
  box-sizing: border-box;
}

.sidebar-toggle {
  position: fixed;
  top: 22px;
  left: 22px;
  z-index: 50;
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  background: rgba(28, 40, 54, 0.9);
  border: 1px solid rgba(126, 146, 170, 0.22);
  border-radius: 12px;
  color: #d9e4ef;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
  cursor: pointer;
}

.sidebar-toggle.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.sidebar-toggle span {
  width: 22px;
  height: 2px;
  background: currentColor;
  border-radius: 999px;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(5, 10, 18, 0.56);
  backdrop-filter: blur(3px);
}

[dir='rtl'].preventive-page {
  padding-right: 88px;
  padding-left: 28px;
}

[dir='rtl'] .sidebar-toggle {
  right: 24px;
  left: auto;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.breadcrumb {
  margin: 0 0 7px !important;
  color: #83b95c !important;
  font-size: 11px;
  font-weight: 800;
}

.page-header h1 {
  margin: 0;
  color: #f8fbff;
  font-size: 29px;
}

.page-header p {
  margin: 6px 0 0;
  color: #aab7c7;
  font-size: 13px;
}

.api-status {
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
}

.api-status--online {
  background: rgba(131, 185, 92, 0.14);
  border-color: rgba(131, 185, 92, 0.32);
  color: #bce39d;
}

.api-status--offline {
  background: rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.34);
  color: #fdba74;
}

.view-switcher {
  display: flex;
  padding: 4px;
  background: rgba(17, 27, 38, 0.9);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.18);
}

.view-switcher button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: #aeb9c8;
  font-weight: 700;
  cursor: pointer;
}

.view-switcher button svg {
  width: 16px;
  height: 16px;
}

.view-switcher button.active {
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
}

@media (max-width: 760px) {
  .preventive-page {
    padding: 88px 16px 32px;
  }

  [dir='rtl'].preventive-page {
    padding: 88px 16px 32px;
  }
}
</style>
