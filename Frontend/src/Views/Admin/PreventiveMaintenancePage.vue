<template>
  <main class="preventive-page">
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
        <p class="breadcrumb">Accueil / Maintenance préventive</p>

        <h1>Maintenance préventive</h1>

        <p>
          Planification et suivi des opérations programmées
        </p>
      </div>

      <div class="view-switcher">
        <button
          :class="{ active: currentView === 'list' }"
          @click="currentView = 'list'"
        >
          <PreventiveIcon name="list" />
          Liste
        </button>

        <button
          :class="{ active: currentView === 'calendar' }"
          @click="currentView = 'calendar'"
        >
          <PreventiveIcon name="calendar" />
          Calendrier
        </button>
      </div>
    </header>

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
import { computed, reactive, ref } from 'vue'

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

const filters = reactive({
  search: '',
  machine: '',
  frequency: '',
  status: ''
})

const maintenances = ref([
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
    status: 'À venir',
    deadlineLabel: 'Dans 2 jours',
    deadlineColor: 'orange',
    description:
      'Contrôle du moteur, vérification du niveau de lubrification et graissage des éléments mécaniques.'
  },
  {
    id: 'MP-002',
    plan: 'Contrôle de température',
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
      'Vérifier les capteurs, la température de fonctionnement et le système de régulation.'
  },
  {
    id: 'MP-003',
    plan: 'Nettoyage des filtres',
    machine: 'Compresseur M-412',
    line: 'Ligne Utilités',
    frequency: 'Trimestrielle',
    lastExecution: '01/05/2026',
    nextDueDate: '01/08/2026',
    technician: 'Youssef Berrada',
    initials: 'YB',
    status: 'Planifiée',
    deadlineLabel: 'Dans 14 jours',
    deadlineColor: 'green',
    description:
      'Nettoyage et remplacement éventuel des filtres du compresseur.'
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
    status: 'Réalisée',
    deadlineLabel: 'Réalisée le 15/07',
    deadlineColor: 'green',
    description:
      'Inspection, nettoyage et contrôle de la pression des buses de remplissage.'
  }
])

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
  maintenanceToEdit.value = maintenance
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  maintenanceToEdit.value = null
}

const saveMaintenance = (maintenance) => {
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
      lastExecution: '—',
      status: 'Planifiée',
      deadlineLabel: 'Nouvellement planifiée',
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

const completeMaintenance = (maintenance) => {
  maintenance.status = 'Réalisée'
  maintenance.deadlineLabel = 'Réalisée aujourd’hui'
  maintenance.deadlineColor = 'green'
}

const deleteMaintenance = (maintenance) => {
  maintenances.value = maintenances.value.filter(
    (item) => item.id !== maintenance.id
  )

  if (selectedMaintenance.value?.id === maintenance.id) {
    drawerOpen.value = false
    selectedMaintenance.value = null
  }
}
</script>

<style scoped>
.preventive-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 32px 28px 44px 88px;
  overflow-x: hidden;
  background: #f7f9f3;
  box-sizing: border-box;
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 50;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 16px;
  color: #4a0a0a;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.08);
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
  background: rgba(74, 10, 10, 0.28);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.breadcrumb {
  margin: 0 0 7px !important;
  color: #6a9a2a !important;
  font-size: 11px;
  font-weight: 800;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 29px;
}

.page-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.view-switcher {
  display: flex;
  padding: 4px;
  background: white;
  border: 1px solid #e5eadc;
  border-radius: 13px;
}

.view-switcher button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: 0;
  border-radius: 9px;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
}

.view-switcher button svg {
  width: 16px;
  height: 16px;
}

.view-switcher button.active {
  background: #edf5de;
  color: #5c8a23;
}

@media (max-width: 760px) {
  .preventive-page {
    padding: 88px 16px 32px;
  }
}
</style>
