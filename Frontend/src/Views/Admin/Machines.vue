<template>
  <main class="machines-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" :aria-label="content.sidebarToggle" :aria-expanded="isSidebarOpen" @click="toggleSidebar">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="machines-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">{{ content.breadcrumb }}</p>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
        <div class="header-actions">
          <AdminLanguageSwitcher />
          <button type="button" class="secondary-button" @click="showToast(content.exportReady)">{{ content.export }}</button>
          <button type="button" class="primary-button" @click="openCreateModal">{{ content.addMachine }}</button>
        </div>
      </header>
      <MachinesKPICards :cards="kpiCards" />
      <MachinesFiltersBar :filters="filters" :lines="lines" :categories="categories" :content="content.filters" @update-filter="updateFilter" @reset="resetFilters" />
      <MachinesTable
        :machines="filteredMachines"
        :content="content.table"
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
import AdminLanguageSwitcher from '@/Components/AdminLanguageSwitcher.vue'
import Sidebar from '@/Components/sidebar.vue'
import { saveMachines } from '@/data/machines'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const drawerOpen = ref(false)
const formModalOpen = ref(false)
const selectedMachine = ref(null)
const machineToEdit = ref(null)
const toastMessage = ref('')

const filters = reactive({ search: '', line: '', status: '', category: '', criticality: '' })

const language = computed(() => languageStore.language)

const pageContent = {
  FR: {
    breadcrumb: 'Accueil / Machines',
    title: 'Machines',
    subtitle: "Supervision de l'etat, de la disponibilite et de la maintenance du parc machines.",
    sidebarToggle: 'Afficher le menu',
    export: 'Exporter',
    addMachine: 'Ajouter une machine',
    exportReady: 'Export mock pret.',
    saved: 'Machine enregistree.',
    createdIntervention: (machineId) => `Intervention creee pour ${machineId}.`,
    plannedMaintenance: (machineId) => `Maintenance preventive planifiee pour ${machineId}.`,
    declaredBreakdown: (machineId) => `Panne declaree pour ${machineId}.`,
    deleteConfirm: (machineId) => `Supprimer la machine ${machineId} ?`,
    deleted: 'Machine supprimee.',
    kpis: {
      total: ['Total machines', 'Parc industriel enregistre'],
      service: ['En service', 'Machines operationnelles'],
      maintenance: ['En maintenance', 'Interventions planifiees ou en cours'],
      breakdown: ['En panne', 'Action requise'],
      availability: ['Disponibilite globale', 'Objectif superieur a 90 %'],
      critical: ['Machines critiques', 'Surveillance renforcee'],
    },
    filters: {
      search: 'Rechercher par ID ou nom...',
      allLines: 'Toutes les lignes',
      allStatuses: 'Tous les etats',
      allCategories: 'Toutes les categories',
      allCriticalities: 'Toutes les criticites',
      reset: 'Reinitialiser',
      statuses: { service: 'En service', maintenance: 'En maintenance', breakdown: 'En panne', offline: 'Hors service' },
      criticalities: { critical: 'Critique', high: 'Haute', medium: 'Moyenne', low: 'Faible' },
    },
    table: {
      title: 'Parc machines',
      count: (count) => `${count} machine(s) affichee(s)`,
      columns: {
        id: 'ID',
        name: 'Machine',
        line: 'Ligne de production',
        category: 'Categorie',
        status: 'Etat',
        criticality: 'Criticite',
        lastMaintenance: 'Derniere maintenance',
        nextMaintenance: 'Prochaine maintenance',
        availability: 'Disponibilite',
        actions: 'Actions',
      },
      view: 'Voir',
      more: 'Plus',
      edit: 'Modifier',
      intervention: 'Creer une intervention',
      plan: 'Planifier une maintenance',
      breakdown: 'Declarer une panne',
      history: "Voir l'historique",
      delete: 'Supprimer',
      emptyTitle: 'Aucune machine trouvee',
      emptyText: 'Aucune machine ne correspond aux filtres selectionnes.',
      previous: 'Precedent',
      next: 'Suivant',
      of: 'sur',
    },
  },
  EN: {
    breadcrumb: 'Home / Machines',
    title: 'Machines',
    subtitle: 'Monitor machine status, availability, and maintenance across the fleet.',
    sidebarToggle: 'Show menu',
    export: 'Export',
    addMachine: 'Add machine',
    exportReady: 'Mock export ready.',
    saved: 'Machine saved.',
    createdIntervention: (machineId) => `Intervention created for ${machineId}.`,
    plannedMaintenance: (machineId) => `Preventive maintenance planned for ${machineId}.`,
    declaredBreakdown: (machineId) => `Breakdown declared for ${machineId}.`,
    deleteConfirm: (machineId) => `Delete machine ${machineId}?`,
    deleted: 'Machine deleted.',
    kpis: {
      total: ['Total machines', 'Registered industrial fleet'],
      service: ['In service', 'Operational machines'],
      maintenance: ['In maintenance', 'Planned or active interventions'],
      breakdown: ['Broken down', 'Action required'],
      availability: ['Overall availability', 'Target above 90%'],
      critical: ['Critical machines', 'Enhanced monitoring'],
    },
    filters: {
      search: 'Search by ID or name...',
      allLines: 'All lines',
      allStatuses: 'All statuses',
      allCategories: 'All categories',
      allCriticalities: 'All criticalities',
      reset: 'Reset',
      statuses: { service: 'In service', maintenance: 'In maintenance', breakdown: 'Broken down', offline: 'Out of service' },
      criticalities: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
    },
    table: {
      title: 'Machine fleet',
      count: (count) => `${count} machine(s) shown`,
      columns: {
        id: 'ID',
        name: 'Machine',
        line: 'Production line',
        category: 'Category',
        status: 'Status',
        criticality: 'Criticality',
        lastMaintenance: 'Last maintenance',
        nextMaintenance: 'Next maintenance',
        availability: 'Availability',
        actions: 'Actions',
      },
      view: 'View',
      more: 'More',
      edit: 'Edit',
      intervention: 'Create intervention',
      plan: 'Schedule maintenance',
      breakdown: 'Declare breakdown',
      history: 'View history',
      delete: 'Delete',
      emptyTitle: 'No machines found',
      emptyText: 'No machine matches the selected filters.',
      previous: 'Previous',
      next: 'Next',
      of: 'of',
    },
  },
  AR: {
    breadcrumb: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 / \u0627\u0644\u0622\u0644\u0627\u062a',
    title: '\u0627\u0644\u0622\u0644\u0627\u062a',
    subtitle: '\u0645\u0631\u0627\u0642\u0628\u0629 \u062d\u0627\u0644\u0629 \u0627\u0644\u0622\u0644\u0627\u062a \u0648\u062a\u0648\u0641\u0631\u0647\u0627 \u0648\u0635\u064a\u0627\u0646\u062a\u0647\u0627.',
    sidebarToggle: '\u0639\u0631\u0636 \u0627\u0644\u0642\u0627\u0626\u0645\u0629',
    export: '\u062a\u0635\u062f\u064a\u0631',
    addMachine: '\u0625\u0636\u0627\u0641\u0629 \u0622\u0644\u0629',
    exportReady: '\u0627\u0644\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u062a\u062c\u0631\u064a\u0628\u064a \u062c\u0627\u0647\u0632.',
    saved: '\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0622\u0644\u0629.',
    createdIntervention: (machineId) => `\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u062a\u062f\u062e\u0644 \u0644\u0644\u0622\u0644\u0629 ${machineId}.`,
    plannedMaintenance: (machineId) => `\u062a\u0645 \u062a\u062e\u0637\u064a\u0637 \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0644\u0644\u0622\u0644\u0629 ${machineId}.`,
    declaredBreakdown: (machineId) => `\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0639\u0637\u0644 \u0644\u0644\u0622\u0644\u0629 ${machineId}.`,
    deleteConfirm: (machineId) => `\u062d\u0630\u0641 \u0627\u0644\u0622\u0644\u0629 ${machineId}\u061f`,
    deleted: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0622\u0644\u0629.',
    kpis: {
      total: ['\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0622\u0644\u0627\u062a', '\u0627\u0644\u0623\u0633\u0637\u0648\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u064a \u0627\u0644\u0645\u0633\u062c\u0644'],
      service: ['\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', '\u0622\u0644\u0627\u062a \u062a\u0639\u0645\u0644'],
      maintenance: ['\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629', '\u062a\u062f\u062e\u0644\u0627\u062a \u0645\u062e\u0637\u0637\u0629 \u0623\u0648 \u062c\u0627\u0631\u064a\u0629'],
      breakdown: ['\u0641\u064a \u0639\u0637\u0644', '\u064a\u062a\u0637\u0644\u0628 \u062a\u062f\u062e\u0644\u0627'],
      availability: ['\u0627\u0644\u062a\u0648\u0641\u0631 \u0627\u0644\u0639\u0627\u0645', '\u0627\u0644\u0647\u062f\u0641 \u0623\u0643\u062b\u0631 \u0645\u0646 90%'],
      critical: ['\u0622\u0644\u0627\u062a \u062d\u0631\u062c\u0629', '\u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0639\u0632\u0632\u0629'],
    },
    filters: {
      search: '\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0645\u0639\u0631\u0641 \u0623\u0648 \u0627\u0644\u0627\u0633\u0645...',
      allLines: '\u0643\u0644 \u0627\u0644\u062e\u0637\u0648\u0637',
      allStatuses: '\u0643\u0644 \u0627\u0644\u062d\u0627\u0644\u0627\u062a',
      allCategories: '\u0643\u0644 \u0627\u0644\u0641\u0626\u0627\u062a',
      allCriticalities: '\u0643\u0644 \u062f\u0631\u062c\u0627\u062a \u0627\u0644\u062d\u0631\u062c\u064a\u0629',
      reset: '\u0625\u0639\u0627\u062f\u0629',
      statuses: { service: '\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', maintenance: '\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629', breakdown: '\u0641\u064a \u0639\u0637\u0644', offline: '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629' },
      criticalities: { critical: '\u062d\u0631\u062c\u0629', high: '\u0639\u0627\u0644\u064a\u0629', medium: '\u0645\u062a\u0648\u0633\u0637\u0629', low: '\u0645\u0646\u062e\u0641\u0636\u0629' },
    },
    table: {
      title: '\u0623\u0633\u0637\u0648\u0644 \u0627\u0644\u0622\u0644\u0627\u062a',
      count: (count) => `\u062a\u0645 \u0639\u0631\u0636 ${count} \u0622\u0644\u0629`,
      columns: {
        id: '\u0627\u0644\u0645\u0639\u0631\u0641',
        name: '\u0627\u0644\u0622\u0644\u0629',
        line: '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c',
        category: '\u0627\u0644\u0641\u0626\u0629',
        status: '\u0627\u0644\u062d\u0627\u0644\u0629',
        criticality: '\u0627\u0644\u062d\u0631\u062c\u064a\u0629',
        lastMaintenance: '\u0622\u062e\u0631 \u0635\u064a\u0627\u0646\u0629',
        nextMaintenance: '\u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629',
        availability: '\u0627\u0644\u062a\u0648\u0641\u0631',
        actions: '\u0625\u062c\u0631\u0627\u0621\u0627\u062a',
      },
      view: '\u0639\u0631\u0636',
      more: '\u0627\u0644\u0645\u0632\u064a\u062f',
      edit: '\u062a\u0639\u062f\u064a\u0644',
      intervention: '\u0625\u0646\u0634\u0627\u0621 \u062a\u062f\u062e\u0644',
      plan: '\u062a\u062e\u0637\u064a\u0637 \u0635\u064a\u0627\u0646\u0629',
      breakdown: '\u062a\u0633\u062c\u064a\u0644 \u0639\u0637\u0644',
      history: '\u0639\u0631\u0636 \u0627\u0644\u0633\u062c\u0644',
      delete: '\u062d\u0630\u0641',
      emptyTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0622\u0644\u0627\u062a',
      emptyText: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0622\u0644\u0629 \u062a\u0637\u0627\u0628\u0642 \u0627\u0644\u0641\u0644\u0627\u062a\u0631.',
      previous: '\u0627\u0644\u0633\u0627\u0628\u0642',
      next: '\u0627\u0644\u062a\u0627\u0644\u064a',
      of: '\u0645\u0646',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const machines = ref([
  createMachine({ id: 'M-102', name: "Tour d'usinage", line: 'Ligne Production 1', category: 'Mecanique', status: 'En service', criticality: 'Moyenne', lastMaintenance: '05/07/2026', nextMaintenance: '05/08/2026', availability: 96, manufacturer: 'Mazak', model: 'QT-200', serialNumber: 'MX-102-8841', commissioningDate: '12/03/2021', location: 'Atelier A', mtbf: '420 h', mttr: '3 h 30', breakdownCount: 2, interventionCount: 8, downtime: '7 h' }),
  createMachine({ id: 'M-215', name: 'Presse hydraulique', line: 'Ligne Production 2', category: 'Hydraulique', status: 'En maintenance', criticality: 'Haute', lastMaintenance: '10/07/2026', nextMaintenance: "Aujourd'hui", availability: 88, manufacturer: 'Bosch Rexroth', model: 'HP-400', serialNumber: 'BR-215-4490', commissioningDate: '18/09/2020', location: 'Atelier B', mtbf: '210 h', mttr: '8 h', breakdownCount: 5, interventionCount: 14, downtime: '40 h' }),
  createMachine({ id: 'M-309', name: 'Convoyeur a bande', line: 'Ligne Conditionnement', category: 'Conditionnement', status: 'En panne', criticality: 'Critique', lastMaintenance: '01/07/2026', nextMaintenance: 'En retard de 2 jours', availability: 72, manufacturer: 'Interroll', model: 'BM-309', serialNumber: 'IR-309-7718', commissioningDate: '04/06/2022', location: 'Zone conditionnement', mtbf: '160 h', mttr: '9 h', breakdownCount: 7, interventionCount: 18, downtime: '54 h' }),
  createMachine({ id: 'M-412', name: "Compresseur d'air", line: 'Ligne Utilites', category: 'Pneumatique', status: 'En service', criticality: 'Haute', lastMaintenance: '12/07/2026', nextMaintenance: '01/08/2026', availability: 94, manufacturer: 'Atlas Copco', model: 'GA-37', serialNumber: 'AC-412-2201', commissioningDate: '27/01/2019', location: 'Local technique', mtbf: '260 h', mttr: '6 h', breakdownCount: 4, interventionCount: 12, downtime: '24 h' }),
  createMachine({ id: 'M-518', name: 'Etiqueteuse automatique', line: 'Ligne Conditionnement', category: 'Electrique', status: 'Hors service', criticality: 'Faible', lastMaintenance: '22/06/2026', nextMaintenance: '15/08/2026', availability: 66, manufacturer: 'Krones', model: 'ET-500', serialNumber: 'KR-518-1209', commissioningDate: '11/02/2018', location: 'Zone emballage', mtbf: '190 h', mttr: '5 h', breakdownCount: 3, interventionCount: 9, downtime: '18 h' }),
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
  const kpis = content.value.kpis

  return [
    { label: kpis.total[0], value: total, description: kpis.total[1], icon: '#', color: 'green' },
    { label: kpis.service[0], value: countStatus('En service'), description: kpis.service[1], icon: 'OK', color: 'green' },
    { label: kpis.maintenance[0], value: countStatus('En maintenance'), description: kpis.maintenance[1], icon: 'T', color: 'orange' },
    { label: kpis.breakdown[0], value: countStatus('En panne'), description: kpis.breakdown[1], icon: '!', color: 'red' },
    { label: kpis.availability[0], value: `${availability} %`, description: kpis.availability[1], icon: '%', color: availability >= 90 ? 'green' : 'orange' },
    { label: kpis.critical[0], value: machines.value.filter((machine) => machine.criticality === 'Critique').length, description: kpis.critical[1], icon: '!', color: 'yellow' },
  ]
})

function createMachine(machine) {
  return {
    description: 'Machine industrielle suivie dans le parc SmartCalyx.',
    imageUrl: '/documents/machines/common/photo-zone-machine.svg',
    interventions: [{ id: 'INT-887', type: 'Corrective', technician: 'Nabil', date: '15/07/2026', status: 'Terminee' }],
    preventive: { plan: 'Controle mensuel', frequency: 'Mensuelle', last: machine.lastMaintenance, next: machine.nextMaintenance, owner: 'Youssef', status: 'Planifie' },
    breakdowns: [{ date: '15/07/2026', type: 'Arret automatique', description: 'Controle requis', downtime: '2 h', status: 'Resolue' }],
    parts: [{ reference: 'PR-001', name: 'Roulement SKF 6205', stock: 25, availability: 'Disponible' }],
    ...machine,
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
  showToast(content.value.saved)
}
function createInterventionForMachine(machine) { machine.interventions.unshift({ id: `INT-${900 + machine.interventions.length}`, type: 'Corrective', technician: 'Nabil', date: '18/07/2026', status: 'En cours' }); showToast(content.value.createdIntervention(machine.id)) }
function planPreventiveMaintenance(machine) { machine.preventive.status = 'Planifie'; machine.nextMaintenance = '01/08/2026'; showToast(content.value.plannedMaintenance(machine.id)) }
function declareBreakdown(machine) { machine.status = 'En panne'; machine.breakdownCount += 1; showToast(content.value.declaredBreakdown(machine.id)) }
function deleteMachine(machine) { if (!window.confirm(content.value.deleteConfirm(machine.id))) return; machines.value = machines.value.filter((item) => item.id !== machine.id); showToast(content.value.deleted) }
function showToast(message) { toastMessage.value = message; window.setTimeout(() => { toastMessage.value = '' }, 2200) }
function toggleSidebar() { isSidebarOpen.value = !isSidebarOpen.value }
function closeSidebar() { isSidebarOpen.value = false }
</script>

<style scoped>
.machines-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}
.machines-page { display: flex; flex-direction: column; gap: 18px; min-height: 100vh; padding: 28px 28px 38px 88px; overflow-x: hidden; box-sizing: border-box; }
[dir='rtl'] .machines-page { padding-right: 88px; padding-left: 28px; }
.sidebar-toggle { position: fixed; top: 22px; left: 22px; z-index: 50; display: inline-flex; width: 42px; height: 42px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: rgba(28, 40, 54, 0.9); border: 1px solid rgba(126, 146, 170, 0.22); border-radius: 12px; color: #d9e4ef; box-shadow: 0 12px 28px rgba(0,0,0,.24); cursor: pointer; }
[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(5,10,18,.56); backdrop-filter: blur(3px); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px !important; color: #83b95c !important; font-size: 11px; font-weight: 900; }
.page-header h1 { margin: 0; color: #f8fbff; font-size: 32px; font-weight: 900; }
.page-header p { margin: 6px 0 0; color: #aab7c7; font-size: 13px; }
.header-actions { display: flex; gap: 12px; }
.primary-button, .secondary-button { min-height: 44px; padding: 0 16px; border-radius: 12px; font-weight: 900; cursor: pointer; }
.primary-button { background: #5f8f2f; border: 1px solid rgba(131, 185, 92, 0.44); color: #f8fbff; box-shadow: 0 16px 34px rgba(0,0,0,.24); }
.primary-button:hover { background: #6fa43c; }
.secondary-button { background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); color: #f2f6fb; }
.secondary-button:hover { border-color: rgba(91, 155, 215, 0.72); color: #cfe9ff; }
.machines-page :deep(.language-button) { height: 44px; border: 1px solid rgba(210, 221, 234, 0.28); border-radius: 12px; background: rgba(13, 21, 32, 0.82); color: #f2f6fb; box-shadow: 0 16px 34px rgba(0,0,0,.18); }
.machines-page :deep(.language-menu) { border-color: rgba(126, 146, 170, 0.24); background: #121c28; }
.machines-page :deep(.language-menu button) { color: #e7edf5; }
.machines-page :deep(.language-menu button:hover) { background: rgba(75, 153, 212, 0.16); color: #cfe9ff; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 14px 18px; background: #101924; border: 1px solid rgba(126, 146, 170, 0.24); border-radius: 12px; color: #f4f7fb; font-weight: 900; box-shadow: 0 18px 44px rgba(0,0,0,.36); }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 960px) { .page-header { align-items: flex-start; flex-direction: column; } }
@media (max-width: 760px) { .machines-page, [dir='rtl'] .machines-page { padding: 88px 16px 32px; } .header-actions { flex-direction: column; width: 100%; } .header-actions button { width: 100%; } }
</style>
