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
          <button type="button" class="secondary-button" @click="exportMachines">{{ content.export }}</button>
          <button type="button" class="primary-button" @click="openCreateModal">{{ content.addMachine }}</button>
        </div>
      </header>
      <MachinesKPICards :cards="kpiCards" />
      <MachinesFiltersBar :filters="filters" :sites="sites" :periodicities="periodicities" :zones="zones" :content="content.filters" @update-filter="updateFilter" @reset="resetFilters" />
      <div v-if="loading" class="machines-state">{{ content.loadingMachines }}</div>
      <div v-else-if="errorMessage" class="machines-state error">{{ errorMessage }}</div>
      <MachinesTable
        v-else
        :machines="filteredMachines"
        :content="content.table"
        :enabled-optional-fields="enabledOptionalFields"
        @view="openDrawer"
        @edit="openEditModal"
        @intervention="createInterventionForMachine"
        @plan="planPreventiveMaintenance"
        @breakdown="declareBreakdown"
        @history="openDrawer"
        @delete="deleteMachine"
      />
      <MachinesChartsSection v-if="!loading && !errorMessage" :machines="machines" />

      <MachineDrawer
        :open="drawerOpen"
        :machine="selectedMachine"
        :enabled-optional-fields="enabledOptionalFields"
        @close="drawerOpen = false"
        @edit="openEditModal"
        @intervention="createInterventionForMachine"
        @plan="planPreventiveMaintenance"
      />
      <MachineFormModal
        :open="createModalOpen"
        :machine="machineToEdit"
        :zone-options="zoneOptions"
        :enabled-optional-fields="enabledOptionalFields"
        :field-settings="fieldSettings"
        @close="closeMachineForm"
        @save="saveMachine"
      />
      <Transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import MachineDrawer from '@/Components/Machines/MachineDrawer.vue'
import MachineFormModal from '@/Components/Machines/MachineFormModal.vue'
import MachinesChartsSection from '@/Components/Machines/MachinesChartsSection.vue'
import MachinesFiltersBar from '@/Components/Machines/MachinesFiltersBar.vue'
import MachinesKPICards from '@/Components/Machines/MachinesKPICards.vue'
import MachinesTable from '@/Components/Machines/MachinesTable.vue'
import AdminLanguageSwitcher from '@/Components/AdminLanguageSwitcher.vue'
import Sidebar from '@/Components/sidebar.vue'
import { createEquipment, getEquipmentById, getEquipmentStats, getEquipments, updateEquipment } from '@/services/equipmentService'
import { getEquipmentFieldSettings } from '@/services/equipmentFieldSettingsService'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const drawerOpen = ref(false)
const createModalOpen = ref(false)
const selectedMachine = ref(null)
const machineToEdit = ref(null)
const toastMessage = ref('')
const machines = ref([])
const equipmentStats = ref({})
const fieldSettings = ref([])
const fieldSettingsLoadFailed = ref(false)
const loading = ref(true)
const errorMessage = ref('')

const filters = reactive({ search: '', site: '', status: '', periodicity: '', zone: '' })

const language = computed(() => languageStore.language)

onMounted(loadMachines)

const pageContent = {
  FR: {
    breadcrumb: 'Accueil / Machines',
    title: 'Machines',
    subtitle: "Supervision de l'etat, de la disponibilite et de la maintenance du parc machines.",
    sidebarToggle: 'Afficher le menu',
    export: 'Exporter',
    addMachine: 'Ajouter une machine',
    exportReady: 'Export des machines pret.',
    saved: 'Machine enregistree.',
    updated: 'Machine modifiee.',
    loadingMachines: 'Chargement des machines...',
    loadError: 'Impossible de charger les machines.',
    unavailableValue: '—',
    unavailableData: 'Données indisponibles',
    detailError: 'Impossible de charger le detail de la machine.',
    noExportData: 'Aucune machine réelle à exporter.',
    createUnavailable: "La création de machine n'est pas encore connectée.",
    deleteUnavailable: "La suppression de machine n'est pas encore disponible.",
    interventionUnavailable: "La création d'intervention n'est pas encore connectée.",
    preventiveUnavailable: "La planification de maintenance n'est pas encore connectée.",
    breakdownUnavailable: "La déclaration de panne n'est pas encore connectée.",
    deleteConfirm: (machineId) => `Supprimer la machine ${machineId} ?`,
    deleted: 'Machine supprimee.',
    kpis: {
      total: ['Total machines', 'Parc industriel enregistre'],
      service: ['En service', 'Machines operationnelles'],
      maintenance: ['En maintenance', 'Interventions planifiees ou en cours'],
      breakdown: ['En panne', 'Action requise'],
      availability: ['Disponibilité globale', 'Données indisponibles'],
      critical: ['Machines critiques', 'Surveillance renforcee'],
    },
    filters: {
      search: 'Rechercher par code, nom, usine ou zone...',
      allSites: 'Toutes les usines',
      allStatuses: 'Tous les etats',
      allPeriodicities: 'Toutes les periodicites',
      allZones: 'Toutes les zones',
      reset: 'Reinitialiser',
      unavailable: 'Données indisponibles',
      statuses: { OPERATIONAL: 'En service', IN_MAINTENANCE: 'En maintenance', OUT_OF_SERVICE: 'En panne', OFFLINE: 'Hors service' },
    },
    table: {
      title: 'Parc machines',
      count: (count) => `${count} machine(s) affichee(s)`,
      columns: {
        id: 'ID',
        name: 'Machine',
        line: 'Usine / Zone',
        periodicity: 'Périodicité',
        category: 'Catégorie',
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
      emptyTitle: 'Aucune machine trouvée',
      emptyText: 'Aucune machine réelle ne correspond aux filtres sélectionnés.',
      unavailableValue: '—',
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
    exportReady: 'Machine export ready.',
    saved: 'Machine saved.',
    updated: 'Machine updated.',
    loadingMachines: 'Loading machines...',
    loadError: 'Unable to load machines.',
    unavailableValue: '—',
    unavailableData: 'Data unavailable',
    detailError: 'Unable to load machine details.',
    noExportData: 'No real machine to export.',
    createUnavailable: 'Machine creation is not connected yet.',
    deleteUnavailable: 'Machine deletion is not available yet.',
    interventionUnavailable: 'Intervention creation is not connected yet.',
    preventiveUnavailable: 'Maintenance planning is not connected yet.',
    breakdownUnavailable: 'Breakdown declaration is not connected yet.',
    deleteConfirm: (machineId) => `Delete machine ${machineId}?`,
    deleted: 'Machine deleted.',
    kpis: {
      total: ['Total machines', 'Registered industrial fleet'],
      service: ['In service', 'Operational machines'],
      maintenance: ['In maintenance', 'Planned or active interventions'],
      breakdown: ['Broken down', 'Action required'],
      availability: ['Overall availability', 'Data unavailable'],
      critical: ['Critical machines', 'Enhanced monitoring'],
    },
    filters: {
      search: 'Search by ID or name...',
      allSites: 'All sites',
      allStatuses: 'All statuses',
      allPeriodicities: 'All periodicities',
      allZones: 'All zones',
      reset: 'Reset',
      unavailable: 'Data unavailable',
      statuses: { OPERATIONAL: 'In service', IN_MAINTENANCE: 'In maintenance', OUT_OF_SERVICE: 'Broken down', OFFLINE: 'Out of service' },
    },
    table: {
      title: 'Machine fleet',
      count: (count) => `${count} machine(s) shown`,
      columns: {
        id: 'ID',
        name: 'Machine',
        line: 'Site / Zone',
        periodicity: 'Periodicity',
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
      unavailableValue: '—',
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
    updated: '\u062a\u0645 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0622\u0644\u0629.',
    loadingMachines: 'جاري تحميل الآلات...',
    loadError: 'تعذر تحميل الآلات.',
    unavailableValue: '—',
    unavailableData: 'البيانات غير متوفرة',
    detailError: 'تعذر تحميل تفاصيل الآلة.',
    noExportData: 'لا توجد آلات حقيقية للتصدير.',
    createUnavailable: 'إنشاء الآلة غير متصل بعد.',
    deleteUnavailable: 'حذف الآلة غير متاح بعد.',
    interventionUnavailable: '\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062a\u062f\u062e\u0644 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u0628\u0639\u062f.',
    preventiveUnavailable: '\u062a\u062e\u0637\u064a\u0637 \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u0628\u0639\u062f.',
    breakdownUnavailable: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0639\u0637\u0644 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u0628\u0639\u062f.',
    deleteConfirm: (machineId) => `\u062d\u0630\u0641 \u0627\u0644\u0622\u0644\u0629 ${machineId}\u061f`,
    deleted: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0622\u0644\u0629.',
    kpis: {
      total: ['\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0622\u0644\u0627\u062a', '\u0627\u0644\u0623\u0633\u0637\u0648\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u064a \u0627\u0644\u0645\u0633\u062c\u0644'],
      service: ['\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', '\u0622\u0644\u0627\u062a \u062a\u0639\u0645\u0644'],
      maintenance: ['\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629', '\u062a\u062f\u062e\u0644\u0627\u062a \u0645\u062e\u0637\u0637\u0629 \u0623\u0648 \u062c\u0627\u0631\u064a\u0629'],
      breakdown: ['\u0641\u064a \u0639\u0637\u0644', '\u064a\u062a\u0637\u0644\u0628 \u062a\u062f\u062e\u0644\u0627'],
      availability: ['\u0627\u0644\u062a\u0648\u0641\u0631 \u0627\u0644\u0639\u0627\u0645', '\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629'],
      critical: ['\u0622\u0644\u0627\u062a \u062d\u0631\u062c\u0629', '\u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0639\u0632\u0632\u0629'],
    },
    filters: {
      search: '\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0645\u0639\u0631\u0641 \u0623\u0648 \u0627\u0644\u0627\u0633\u0645...',
      allSites: '\u0643\u0644 \u0627\u0644\u0645\u0635\u0627\u0646\u0639',
      allStatuses: '\u0643\u0644 \u0627\u0644\u062d\u0627\u0644\u0627\u062a',
      allPeriodicities: '\u0643\u0644 \u0627\u0644\u062f\u0648\u0631\u064a\u0627\u062a',
      allZones: '\u0643\u0644 \u0627\u0644\u0645\u0646\u0627\u0637\u0642',
      reset: '\u0625\u0639\u0627\u062f\u0629',
      unavailable: 'البيانات غير متوفرة',
      statuses: { OPERATIONAL: '\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', IN_MAINTENANCE: '\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629', OUT_OF_SERVICE: '\u0641\u064a \u0639\u0637\u0644', OFFLINE: '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629' },
    },
    table: {
      title: '\u0623\u0633\u0637\u0648\u0644 \u0627\u0644\u0622\u0644\u0627\u062a',
      count: (count) => `\u062a\u0645 \u0639\u0631\u0636 ${count} \u0622\u0644\u0629`,
      columns: {
        id: '\u0627\u0644\u0645\u0639\u0631\u0641',
        name: '\u0627\u0644\u0622\u0644\u0629',
        line: '\u0627\u0644\u0645\u0635\u0646\u0639 / \u0627\u0644\u0645\u0646\u0637\u0642\u0629',
        periodicity: '\u0627\u0644\u062f\u0648\u0631\u064a\u0629',
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
      unavailableValue: '—',
      previous: '\u0627\u0644\u0633\u0627\u0628\u0642',
      next: '\u0627\u0644\u062a\u0627\u0644\u064a',
      of: '\u0645\u0646',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const filteredMachines = computed(() => {
  const query = filters.search.toLowerCase().trim()
  return machines.value.filter((machine) => {
    const matchesSearch =
      !query ||
      machine.id.toLowerCase().includes(query) ||
      machine.name.toLowerCase().includes(query) ||
      String(machine.code || '').toLowerCase().includes(query) ||
      String(machine.site || '').toLowerCase().includes(query) ||
      String(machine.zone || '').toLowerCase().includes(query)

    return (
      matchesSearch &&
      (!filters.site || machine.site === filters.site) &&
      (!filters.status || machine.statusRaw === filters.status) &&
      (!filters.periodicity || machine.periodicityRaw === filters.periodicity) &&
      (!filters.zone || machine.zone === filters.zone)
    )
  })
})

const sites = computed(() => uniqueValues(machines.value.map((machine) => machine.site)))
const zones = computed(() => uniqueValues(machines.value.map((machine) => machine.zone)))
const periodicities = computed(() => uniqueValues(machines.value.map((machine) => machine.periodicityRaw)))
const enabledOptionalFields = computed(() => {
  if (fieldSettingsLoadFailed.value) return []
  return fieldSettings.value.filter((setting) => setting.is_enabled).map((setting) => setting.field_key)
})
const zoneOptions = computed(() => {
  const options = new Map()

  machines.value.forEach((machine) => {
    const zoneId = machine.raw?.zone_id || machine.raw?.zone?.id
    if (!zoneId || options.has(zoneId)) return
    options.set(zoneId, {
      value: zoneId,
      label: [machine.site, machine.zone].filter((value) => value && value !== content.value.unavailableValue).join(' / ') || String(zoneId),
    })
  })

  return [...options.values()]
})
const kpiCards = computed(() => {
  const stats = equipmentStats.value || {}
  const kpis = content.value.kpis

  return [
    { label: kpis.total[0], value: displayStat(statValue(stats, ['total', 'total_equipments', 'totalEquipments'])), description: kpis.total[1], icon: '#', color: 'green' },
    { label: kpis.service[0], value: displayStat(statValue(stats, ['operational', 'operational_count', 'in_service'])), description: kpis.service[1], icon: 'OK', color: 'green' },
    { label: kpis.maintenance[0], value: displayStat(statValue(stats, ['in_maintenance', 'maintenance', 'maintenance_count'])), description: kpis.maintenance[1], icon: 'T', color: 'orange' },
    { label: kpis.breakdown[0], value: displayStat(statValue(stats, ['out_of_service', 'broken_down', 'breakdown', 'offline'])), description: kpis.breakdown[1], icon: '!', color: 'red' },
    { label: kpis.availability[0], value: content.value.unavailableValue, description: content.value.unavailableData, icon: '%', color: 'orange' },
    { label: kpis.critical[0], value: content.value.unavailableValue, description: content.value.unavailableData, icon: '!', color: 'yellow' },
  ]
})

function normalizeEquipment(equipment) {
  const site = equipment.site?.display_name || equipment.site?.name || equipment.site_name || equipment.siteName || equipment.site || content.value.unavailableValue
  const zone = equipment.zone?.name || equipment.zone_name || equipment.zoneName || equipment.zone || content.value.unavailableValue
  const periodicityRaw = equipment.periodicity || equipment.periodicite || equipment.frequency || ''
  const statusRaw = equipment.status || equipment.state || ''
  const periodicity = periodicityLabel(periodicityRaw)
  const availability = numericValue(equipment.availability ?? equipment.availability_rate ?? equipment.availabilityRate)

  return {
    id: String(equipment.code || equipment.id || content.value.unavailableValue),
    equipmentId: equipment.id,
    code: equipment.code || content.value.unavailableValue,
    name: equipment.name || content.value.unavailableValue,
    zoneId: equipment.zone_id || equipment.zone?.id || '',
    line: `${site} / ${zone}`,
    site,
    zone,
    category: equipment.category || equipment.type || content.value.unavailableValue,
    periodicity,
    periodicityRaw,
    status: statusLabel(statusRaw),
    statusRaw,
    criticality: criticalityLabel(equipment.criticality),
    lastMaintenance: equipment.last_maintenance || equipment.lastMaintenance || content.value.unavailableValue,
    nextMaintenance: equipment.next_maintenance || equipment.nextMaintenance || content.value.unavailableValue,
    availability,
    manufacturer: content.value.unavailableValue,
    model: content.value.unavailableValue,
    serialNumber: content.value.unavailableValue,
    commissioningDate: content.value.unavailableValue,
    location: zone,
    mtbf: content.value.unavailableValue,
    mttr: content.value.unavailableValue,
    breakdownCount: null,
    interventionCount: null,
    downtime: content.value.unavailableValue,
    description: equipment.description || content.value.unavailableValue,
    imageUrl: equipment.image_url || equipment.imageUrl || '',
    interventions: [],
    preventive: { frequency: periodicity },
    breakdowns: [],
    parts: [],
    documents: [],
    raw: equipment,
  }
}

function displayStat(value) { return value === null || value === undefined ? content.value.unavailableValue : value }
function statValue(stats, keys) {
  return keys.map((key) => stats[key]).find((value) => value !== undefined && value !== null)
}
function uniqueValues(values) { return [...new Set(values.filter((value) => value && value !== content.value.unavailableValue))] }
function numericValue(value) {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}
function periodicityLabel(value) {
  const labels = {
    HEBDOMADAIRE: 'Hebdomadaire',
    MENSUELLE: 'Mensuelle',
    BIMESTRIELLE: 'Tous les 2 mois',
    TRIMESTRIELLE: 'Tous les 3 mois',
  }
  return labels[value] || value || content.value.unavailableValue
}
function statusLabel(value) {
  const labels = {
    OPERATIONAL: 'En service',
    IN_MAINTENANCE: 'En maintenance',
    OUT_OF_SERVICE: 'En panne',
    OFFLINE: 'Hors service',
  }
  return labels[value] || value || content.value.unavailableValue
}
function criticalityLabel(value) {
  const labels = {
    CRITICAL: 'Critique',
    HIGH: 'Haute',
    MEDIUM: 'Moyenne',
    LOW: 'Faible',
  }
  return labels[value] || value || content.value.unavailableValue
}
function updateFilter({ key, value }) { filters[key] = value }
function resetFilters() { filters.search = ''; filters.site = ''; filters.status = ''; filters.periodicity = ''; filters.zone = '' }
async function loadMachines() {
  try {
    loading.value = true
    errorMessage.value = ''
    const [equipmentsResult, statsResult, settingsResult] = await Promise.allSettled([getEquipments(), getEquipmentStats(), getEquipmentFieldSettings()])

    if (equipmentsResult.status === 'rejected') {
      throw equipmentsResult.reason
    }

    equipmentStats.value = statsResult.status === 'fulfilled' ? statsResult.value : {}
    fieldSettings.value = settingsResult.status === 'fulfilled' ? settingsResult.value : []
    fieldSettingsLoadFailed.value = settingsResult.status === 'rejected'
    machines.value = equipmentsResult.value.map(normalizeEquipment)
  } catch (error) {
    errorMessage.value = error.message || content.value.loadError
    machines.value = []
    equipmentStats.value = {}
    fieldSettings.value = []
    fieldSettingsLoadFailed.value = true
  } finally {
    loading.value = false
  }
}
async function openDrawer(machine) {
  try {
    const equipment = await getEquipmentById(machine.equipmentId || machine.id)
    selectedMachine.value = normalizeEquipment(equipment)
  } catch (error) {
    selectedMachine.value = machine
    showToast(error.message || content.value.detailError)
  } finally {
    drawerOpen.value = true
  }
}
function openCreateModal() {
  if (!zoneOptions.value.length) {
    showToast(content.value.createUnavailable)
    return
  }

  machineToEdit.value = null
  createModalOpen.value = true
}
function openEditModal(machine) {
  drawerOpen.value = false
  machineToEdit.value = machine
  createModalOpen.value = true
}
function closeMachineForm() {
  createModalOpen.value = false
  machineToEdit.value = null
}
async function saveMachine(payload) {
  try {
    if (machineToEdit.value) {
      await updateEquipment(machineToEdit.value.equipmentId || machineToEdit.value.id, payload)
    } else {
      await createEquipment(payload)
    }
    createModalOpen.value = false
    const message = machineToEdit.value ? content.value.updated : content.value.saved
    machineToEdit.value = null
    showToast(message)
    await loadMachines()
  } catch (error) {
    showToast(error.message || content.value.createUnavailable)
  }
}
function exportMachines() {
  if (!filteredMachines.value.length) {
    showToast(content.value.noExportData)
    return
  }
  const optionalExportFields = [
    { key: 'category', label: 'category', value: (machine) => machine.category },
    { key: 'criticality', label: 'criticality', value: (machine) => machine.criticality },
    { key: 'last_maintenance', label: 'last_maintenance', value: (machine) => machine.lastMaintenance },
    { key: 'next_maintenance', label: 'next_maintenance', value: (machine) => machine.nextMaintenance },
    { key: 'availability', label: 'availability', value: (machine) => machine.availability },
    { key: 'image_url', label: 'image_url', value: (machine) => machine.imageUrl },
  ].filter((field) => enabledOptionalFields.value.includes(field.key))
  const headers = ['id', 'code', 'name', 'site', 'zone', 'periodicity', 'status', ...optionalExportFields.map((field) => field.label)]
  const rows = filteredMachines.value.map((machine) => [
    machine.equipmentId,
    machine.code,
    machine.name,
    machine.site,
    machine.zone,
    machine.periodicity,
    machine.status,
    ...optionalExportFields.map((field) => field.value(machine)),
  ])
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'machines.csv'
  link.click()
  URL.revokeObjectURL(url)
  showToast(content.value.exportReady)
}
function createInterventionForMachine() { showToast(content.value.interventionUnavailable) }
function planPreventiveMaintenance() { showToast(content.value.preventiveUnavailable) }
function declareBreakdown() { showToast(content.value.breakdownUnavailable) }
function deleteMachine() { showToast(content.value.deleteUnavailable) }
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
