<template>
  <main class="machines-layout">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" aria-label="Afficher le menu" :aria-expanded="isSidebarOpen" @click="toggleSidebar">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="machines-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">Accueil / Machines</p>
          <h1>Machines</h1>
          <p>Supervision de l’état, de la disponibilité et de la maintenance du parc machines.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="secondary-button" @click="showToast('Export mock prêt.')">Exporter</button>
          <button type="button" class="primary-button" @click="openCreateModal">Ajouter une machine</button>
        </div>
      </header>

      <MachinesKPICards :cards="kpiCards" />
      <MachinesFiltersBar :filters="filters" :lines="lines" :categories="categories" @update-filter="updateFilter" @reset="resetFilters" />
      <MachinesTable
        :machines="filteredMachines"
        @view="openDrawer"
        @edit="openEditModal"
        @intervention="createInterventionForMachine"
        @plan="planPreventiveMaintenance"
        @breakdown="declareBreakdown"
        @history="openDrawer"
        @delete="deleteMachine"
      />
      <MachinesChartsSection :machines="machines" />

      <MachineDrawer
        :open="drawerOpen"
        :machine="selectedMachine"
        @close="drawerOpen = false"
        @edit="openEditModal"
        @intervention="createInterventionForMachine"
        @plan="planPreventiveMaintenance"
      />
      <MachineFormModal :open="formModalOpen" :machine="machineToEdit" @close="closeFormModal" @save="saveMachine" />

      <Transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import MachineDrawer from '@/Components/Machines/MachineDrawer.vue'
import MachineFormModal from '@/Components/Machines/MachineFormModal.vue'
import MachinesChartsSection from '@/Components/Machines/MachinesChartsSection.vue'
import MachinesFiltersBar from '@/Components/Machines/MachinesFiltersBar.vue'
import MachinesKPICards from '@/Components/Machines/MachinesKPICards.vue'
import MachinesTable from '@/Components/Machines/MachinesTable.vue'
import Sidebar from '@/Components/sidebar.vue'
import { saveMachines } from '@/data/machines'

const isSidebarOpen = ref(false)
const drawerOpen = ref(false)
const formModalOpen = ref(false)
const selectedMachine = ref(null)
const machineToEdit = ref(null)
const toastMessage = ref('')

const filters = reactive({ search: '', line: '', status: '', category: '', criticality: '' })

const machines = ref([
  createMachine({ id: 'M-102', name: "Tour d'usinage", line: 'Ligne Production 1', category: 'Mécanique', status: 'En service', criticality: 'Moyenne', lastMaintenance: '05/07/2026', nextMaintenance: '05/08/2026', availability: 96, manufacturer: 'Mazak', model: 'QT-200', serialNumber: 'MX-102-8841', commissioningDate: '12/03/2021', location: 'Atelier A', mtbf: '420 h', mttr: '3 h 30', breakdownCount: 2, interventionCount: 8, downtime: '7 h' }),
  createMachine({ id: 'M-215', name: 'Presse hydraulique', line: 'Ligne Production 2', category: 'Hydraulique', status: 'En maintenance', criticality: 'Haute', lastMaintenance: '10/07/2026', nextMaintenance: 'Aujourd’hui', availability: 88, manufacturer: 'Bosch Rexroth', model: 'HP-400', serialNumber: 'BR-215-4490', commissioningDate: '18/09/2020', location: 'Atelier B', mtbf: '210 h', mttr: '8 h', breakdownCount: 5, interventionCount: 14, downtime: '40 h' }),
  createMachine({ id: 'M-309', name: 'Convoyeur à bande', line: 'Ligne Conditionnement', category: 'Conditionnement', status: 'En panne', criticality: 'Critique', lastMaintenance: '01/07/2026', nextMaintenance: 'En retard de 2 jours', availability: 72, manufacturer: 'Interroll', model: 'BM-309', serialNumber: 'IR-309-7718', commissioningDate: '04/06/2022', location: 'Zone conditionnement', mtbf: '160 h', mttr: '9 h', breakdownCount: 7, interventionCount: 18, downtime: '54 h' }),
  createMachine({ id: 'M-412', name: "Compresseur d'air", line: 'Ligne Utilités', category: 'Pneumatique', status: 'En service', criticality: 'Haute', lastMaintenance: '12/07/2026', nextMaintenance: '01/08/2026', availability: 94, manufacturer: 'Atlas Copco', model: 'GA-37', serialNumber: 'AC-412-2201', commissioningDate: '27/01/2019', location: 'Local technique', mtbf: '260 h', mttr: '6 h', breakdownCount: 4, interventionCount: 12, downtime: '24 h' }),
  createMachine({ id: 'M-518', name: 'Étiqueteuse automatique', line: 'Ligne Conditionnement', category: 'Électrique', status: 'Hors service', criticality: 'Faible', lastMaintenance: '22/06/2026', nextMaintenance: '15/08/2026', availability: 66, manufacturer: 'Krones', model: 'ET-500', serialNumber: 'KR-518-1209', commissioningDate: '11/02/2018', location: 'Zone emballage', mtbf: '190 h', mttr: '5 h', breakdownCount: 3, interventionCount: 9, downtime: '18 h' })
])

const filteredMachines = computed(() => {
  const query = filters.search.toLowerCase().trim()
  return machines.value.filter((machine) => {
    const matchesSearch = !query || machine.id.toLowerCase().includes(query) || machine.name.toLowerCase().includes(query)
    return matchesSearch && (!filters.line || machine.line === filters.line) && (!filters.status || machine.status === filters.status) && (!filters.category || machine.category === filters.category) && (!filters.criticality || machine.criticality === filters.criticality)
  })
})

const lines = computed(() => [...new Set(machines.value.map((machine) => machine.line))])
const categories = computed(() => [...new Set(machines.value.map((machine) => machine.category))])
const kpiCards = computed(() => {
  const total = machines.value.length
  const availability = Math.round(machines.value.reduce((sum, machine) => sum + machine.availability, 0) / Math.max(1, total))
  return [
    { label: 'Total machines', value: total, description: 'Parc industriel enregistré', icon: '▦', color: 'green' },
    { label: 'En service', value: countStatus('En service'), description: 'Machines opérationnelles', icon: '✓', color: 'green' },
    { label: 'En maintenance', value: countStatus('En maintenance'), description: 'Interventions planifiées ou en cours', icon: '◷', color: 'orange' },
    { label: 'En panne', value: countStatus('En panne'), description: 'Action requise', icon: '!', color: 'red' },
    { label: 'Disponibilité globale', value: `${availability} %`, description: 'Objectif supérieur à 90 %', icon: '%', color: availability >= 90 ? 'green' : 'orange' },
    { label: 'Machines critiques', value: machines.value.filter((machine) => machine.criticality === 'Critique').length, description: 'Surveillance renforcée', icon: '△', color: 'yellow' }
  ]
})

function createMachine(machine) {
  return {
    description: 'Machine industrielle suivie dans le parc SmartCalyx.',
    interventions: [{ id: 'INT-887', type: 'Corrective', technician: 'Nabil', date: '15/07/2026', status: 'Terminée' }],
    preventive: { plan: 'Contrôle mensuel', frequency: 'Mensuelle', last: machine.lastMaintenance, next: machine.nextMaintenance, owner: 'Youssef', status: 'Planifié' },
    breakdowns: [{ date: '15/07/2026', type: 'Arrêt automatique', description: 'Contrôle requis', downtime: '2 h', status: 'Résolue' }],
    parts: [{ reference: 'PR-001', name: 'Roulement SKF 6205', stock: 25, availability: 'Disponible' }],
    ...machine
  }
}

function countStatus(status) { return machines.value.filter((machine) => machine.status === status).length }
function updateFilter({ key, value }) { filters[key] = value }
function resetFilters() { filters.search = ''; filters.line = ''; filters.status = ''; filters.category = ''; filters.criticality = '' }
function openDrawer(machine) { selectedMachine.value = machine; drawerOpen.value = true }
function openCreateModal() { machineToEdit.value = null; formModalOpen.value = true }
function openEditModal(machine) { drawerOpen.value = false; machineToEdit.value = machine; formModalOpen.value = true }
function closeFormModal() { formModalOpen.value = false; machineToEdit.value = null }
function saveMachine(machine) {
  const normalized = createMachine(machine)
  const index = machines.value.findIndex((item) => item.id === normalized.id)
  if (index !== -1) machines.value[index] = { ...machines.value[index], ...normalized }
  else machines.value.unshift(normalized)
  saveMachines(machines.value.map((item) => ({ ...item, type: item.category, availability: `${item.availability}%` })))
  closeFormModal()
  showToast('Machine enregistrée.')
}
function createInterventionForMachine(machine) { machine.interventions.unshift({ id: `INT-${900 + machine.interventions.length}`, type: 'Corrective', technician: 'Nabil', date: '18/07/2026', status: 'En cours' }); showToast(`Intervention créée pour ${machine.id}.`) }
function planPreventiveMaintenance(machine) { machine.preventive.status = 'Planifié'; machine.nextMaintenance = '01/08/2026'; showToast(`Maintenance préventive planifiée pour ${machine.id}.`) }
function declareBreakdown(machine) { machine.status = 'En panne'; machine.breakdownCount += 1; showToast(`Panne déclarée pour ${machine.id}.`) }
function deleteMachine(machine) { if (!window.confirm(`Supprimer la machine ${machine.id} ?`)) return; machines.value = machines.value.filter((item) => item.id !== machine.id); showToast('Machine supprimée.') }
function showToast(message) { toastMessage.value = message; window.setTimeout(() => { toastMessage.value = '' }, 2200) }
function toggleSidebar() { isSidebarOpen.value = !isSidebarOpen.value }
function closeSidebar() { isSidebarOpen.value = false }
</script>

<style scoped>
.machines-layout { min-height: 100vh; background: #f7f9f3; color: #4a0a0a; }
.machines-page { display: flex; flex-direction: column; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; overflow-x: hidden; box-sizing: border-box; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; box-shadow: 0 10px 30px rgba(74,10,10,.08); cursor: pointer; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74,10,10,.28); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px !important; color: #6a9a2a !important; font-size: 11px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 32px; font-weight: 900; }
.page-header p { margin: 6px 0 0; color: #64748b; font-size: 13px; }
.header-actions { display: flex; gap: 12px; }
.primary-button, .secondary-button { min-height: 44px; padding: 0 16px; border-radius: 12px; font-weight: 900; cursor: pointer; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
.secondary-button { background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 14px 18px; background: #4a0a0a; border-radius: 14px; color: white; font-weight: 900; box-shadow: 0 18px 44px rgba(74,10,10,.22); }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 960px) { .page-header { align-items: flex-start; flex-direction: column; } }
@media (max-width: 760px) { .machines-page { padding: 88px 16px 32px; } .header-actions { flex-direction: column; width: 100%; } .header-actions button { width: 100%; } }
</style>
