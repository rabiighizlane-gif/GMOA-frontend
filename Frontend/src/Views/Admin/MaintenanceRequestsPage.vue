<template>
  <main class="requests-page">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" aria-label="Afficher le menu" :aria-expanded="isSidebarOpen" @click="toggleSidebar">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <header class="page-header">
      <div>
        <p class="breadcrumb">Accueil / Demandes de maintenance</p>
        <h1>Demandes de maintenance</h1>
        <p>Déclaration, validation et suivi des demandes d’intervention</p>
      </div>
      <div class="header-actions">
        <button type="button" class="secondary-button" @click="showToast('Export mock prêt.')">Exporter</button>
        <button v-if="can('create')" type="button" class="primary-button" @click="openCreateModal">Nouvelle demande</button>
      </div>
    </header>

    <RequestsKPICards :cards="kpiCards" />

    <RequestsFiltersBar
      :filters="filters"
      :machines="machines"
      :lines="lines"
      :requesters="requesters"
      @update-filter="updateFilter"
      @reset="resetFilters"
    />

    <RequestsTable
      :requests="visibleRequests"
      :can="can"
      @view="openDrawer"
      @edit="openEditModal"
      @validate="openValidationModal"
      @transform="transformRequestToIntervention"
      @delete="deleteRequest"
    />

    <RequestsChartsSection :requests="requests" />

    <RequestDrawer
      :open="drawerOpen"
      :request="selectedRequest"
      :can="can"
      @close="drawerOpen = false"
      @edit="openEditModal"
      @validate="openValidationModal"
      @transform="transformRequestToIntervention"
    />

    <RequestFormModal
      :open="formModalOpen"
      :request="requestToEdit"
      @close="closeFormModal"
      @save="saveRequest"
    />

    <RequestValidationModal
      :open="validationModalOpen"
      :request="requestToValidate"
      :action="validationAction"
      @close="closeValidationModal"
      @confirm="applyValidation"
    />

    <Transition name="toast">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import RequestDrawer from '@/Components/MaintenanceRequests/RequestDrawer.vue'
import RequestFormModal from '@/Components/MaintenanceRequests/RequestFormModal.vue'
import RequestValidationModal from '@/Components/MaintenanceRequests/RequestValidationModal.vue'
import RequestsChartsSection from '@/Components/MaintenanceRequests/RequestsChartsSection.vue'
import RequestsFiltersBar from '@/Components/MaintenanceRequests/RequestsFiltersBar.vue'
import RequestsKPICards from '@/Components/MaintenanceRequests/RequestsKPICards.vue'
import RequestsTable from '@/Components/MaintenanceRequests/RequestsTable.vue'
import Sidebar from '@/Components/sidebar.vue'

const currentUser = {
  id: 1,
  name: 'Super Admin',
  role: 'super_admin'
}

const isSidebarOpen = ref(false)
const drawerOpen = ref(false)
const formModalOpen = ref(false)
const validationModalOpen = ref(false)
const selectedRequest = ref(null)
const requestToEdit = ref(null)
const requestToValidate = ref(null)
const validationAction = ref('')
const toastMessage = ref('')

const filters = reactive({
  search: '',
  machine: '',
  line: '',
  priority: '',
  status: '',
  requester: '',
  period: ''
})

const requests = ref([
  createRequest({
    id: 'DM-001',
    machine: 'Convoyeur M-309',
    line: 'Ligne Conditionnement',
    requester: 'Ahmed El Mansouri',
    shortDescription: 'Bruit anormal au niveau du moteur',
    fullDescription: 'Un bruit métallique apparaît au démarrage du moteur principal.',
    priority: 'Haute',
    createdAt: '18/07/2026 08:45',
    status: 'En attente',
    interventionId: '',
    problemType: 'Bruit',
    machineStopped: false,
    safetyRisk: false
  }),
  createRequest({
    id: 'DM-002',
    machine: 'Pasteurisateur P-204',
    line: 'Ligne Production 1',
    requester: 'Sara El Idrissi',
    shortDescription: 'Température instable pendant le cycle',
    fullDescription: 'La température varie fortement pendant les cycles de pasteurisation.',
    priority: 'Critique',
    createdAt: '18/07/2026 10:20',
    status: 'Acceptée',
    interventionId: '',
    problemType: 'Température',
    machineStopped: true,
    safetyRisk: true
  }),
  createRequest({
    id: 'DM-003',
    machine: 'Compresseur M-412',
    line: 'Ligne Utilités',
    requester: 'Youssef Berrada',
    shortDescription: 'Fuite d’air importante',
    fullDescription: 'Fuite audible près de la vanne de sortie du compresseur.',
    priority: 'Moyenne',
    createdAt: '17/07/2026 14:10',
    status: 'Intervention créée',
    interventionId: 'INT-889',
    problemType: 'Pneumatique',
    machineStopped: false,
    safetyRisk: false
  }),
  createRequest({
    id: 'DM-004',
    machine: 'Remplisseuse R-118',
    line: 'Ligne Conditionnement',
    requester: 'Nabil Amrani',
    shortDescription: 'Vibrations inhabituelles',
    fullDescription: 'Vibrations légères observées pendant les phases de dosage.',
    priority: 'Faible',
    createdAt: '16/07/2026 09:15',
    status: 'Refusée',
    interventionId: '',
    problemType: 'Vibration',
    machineStopped: false,
    safetyRisk: false
  }),
  createRequest({
    id: 'DM-005',
    machine: 'Tour d’usinage M-102',
    line: 'Ligne Production 1',
    requester: 'Karim El Fassi',
    shortDescription: 'Informations à compléter sur le capteur',
    fullDescription: 'Le signal du capteur semble irrégulier, mais la zone exacte doit être précisée.',
    priority: 'Moyenne',
    createdAt: '18/07/2026 12:30',
    status: 'Informations demandées',
    interventionId: '',
    problemType: 'Électrique',
    machineStopped: false,
    safetyRisk: false
  })
])

const machines = computed(() => [...new Set(requests.value.map((request) => request.machine))])
const lines = computed(() => [...new Set(requests.value.map((request) => request.line))])
const requesters = computed(() => [...new Set(requests.value.map((request) => request.requester))])

const visibleRequests = computed(() => {
  const query = filters.search.toLowerCase().trim()

  return requests.value.filter((request) => {
    if (!can('view', request)) return false

    const matchesSearch =
      !query ||
      [request.id, request.machine, request.requester, request.shortDescription, request.fullDescription]
        .join(' ')
        .toLowerCase()
        .includes(query)

    return (
      matchesSearch &&
      (!filters.machine || request.machine === filters.machine) &&
      (!filters.line || request.line === filters.line) &&
      (!filters.priority || request.priority === filters.priority) &&
      (!filters.status || request.status === filters.status) &&
      (!filters.requester || request.requester === filters.requester) &&
      matchesPeriod(request)
    )
  })
})

const kpiCards = computed(() => [
  { label: 'Total des demandes', value: requests.value.length, description: 'Toutes les demandes enregistrées', icon: '▦', color: 'gray' },
  { label: 'Nouvelles', value: requests.value.filter((request) => request.createdAt.startsWith('18/07/2026')).length, description: 'Créées aujourd’hui', icon: '+', color: 'green' },
  { label: 'En attente', value: countStatus('En attente'), description: 'En attente de validation', icon: '…', color: 'yellow' },
  { label: 'Acceptées', value: countStatus('Acceptée'), description: 'Validées par le responsable', icon: '✓', color: 'green' },
  { label: 'Refusées', value: countStatus('Refusée'), description: 'Demandes non retenues', icon: '×', color: 'red' },
  { label: 'Interventions créées', value: countStatus('Intervention créée'), description: 'Transformées en interventions', icon: '↗', color: 'green' }
])

function createRequest(request) {
  return {
    zone: 'Zone moteur',
    urgency: request.priority,
    symptoms: request.shortDescription,
    operatorComment: 'Observation déclarée depuis la ligne.',
    attachments: ['Photo machine.jpg', 'Note opérateur.pdf'],
    validation: {
      decision: request.status === 'Acceptée' ? 'Acceptée' : request.status === 'Refusée' ? 'Refusée' : '',
      by: request.status === 'Acceptée' || request.status === 'Refusée' ? 'Super Admin' : '',
      date: request.status === 'Acceptée' || request.status === 'Refusée' ? '18/07/2026' : '',
      comment: '',
      refusalReason: request.status === 'Refusée' ? 'Demande non prioritaire.' : '',
      requestedInfo: request.status === 'Informations demandées' ? 'Préciser la zone exacte du capteur.' : ''
    },
    history: [
      historyEvent('Demande créée', 'Création de la demande de maintenance.', request.requester, request.createdAt, 'gray'),
      historyEvent('Demande soumise', 'Demande envoyée pour validation.', request.requester, request.createdAt, 'yellow')
    ],
    ...request
  }
}

function historyEvent(title, description, user, dateTime, color = 'green') {
  const [date, time = '09:00'] = dateTime.split(' ')
  return { title, description, user, date, time, color, icon: title[0] }
}

function countStatus(status) {
  return requests.value.filter((request) => request.status === status).length
}

function matchesPeriod(request) {
  if (!filters.period) return true
  if (filters.period === 'today') return request.createdAt.startsWith('18/07/2026')
  if (filters.period === 'week') return ['16/07/2026', '17/07/2026', '18/07/2026'].some((date) => request.createdAt.startsWith(date))
  return request.createdAt.includes('/07/2026')
}

function can(action, request = null) {
  const role = currentUser.role
  if (role === 'super_admin') return true

  if (role === 'responsable_maintenance') {
    return ['view', 'accept', 'reject', 'askInfo', 'transform', 'edit', 'delete'].includes(action)
  }

  if (role === 'technicien') {
    if (action === 'create') return true
    if (action === 'view') return request?.requester === currentUser.name
    return false
  }

  if (role === 'operateur') {
    if (action === 'create') return true
    if (action === 'view') return request?.requester === currentUser.name
    if (action === 'edit') return request?.requester === currentUser.name && ['Brouillon', 'En attente'].includes(request.status)
  }

  return false
}

function updateFilter({ key, value }) {
  filters[key] = value
}

function resetFilters() {
  filters.search = ''
  filters.machine = ''
  filters.line = ''
  filters.priority = ''
  filters.status = ''
  filters.requester = ''
  filters.period = ''
}

function openDrawer(request) {
  selectedRequest.value = request
  drawerOpen.value = true
}

function openCreateModal() {
  requestToEdit.value = null
  formModalOpen.value = true
}

function openEditModal(request) {
  drawerOpen.value = false
  requestToEdit.value = request
  formModalOpen.value = true
}

function closeFormModal() {
  formModalOpen.value = false
  requestToEdit.value = null
}

function saveRequest(request) {
  if (request.id) {
    const index = requests.value.findIndex((item) => item.id === request.id)
    if (index !== -1) {
      requests.value[index] = {
        ...requests.value[index],
        ...request,
        history: [
          ...requests.value[index].history,
          historyEvent('Demande modifiée', 'Mise à jour des informations.', currentUser.name, '18/07/2026 14:30', 'gray')
        ]
      }
    }
  } else {
    const nextNumber = String(requests.value.length + 1).padStart(3, '0')
    requests.value.unshift(createRequest({
      ...request,
      id: `DM-${nextNumber}`,
      createdAt: '18/07/2026 14:45',
      interventionId: ''
    }))
  }

  closeFormModal()
  showToast('Demande enregistrée.')
}

function openValidationModal({ action, request }) {
  requestToValidate.value = request
  validationAction.value = action
  validationModalOpen.value = true
}

function closeValidationModal() {
  validationModalOpen.value = false
  requestToValidate.value = null
  validationAction.value = ''
}

function applyValidation({ action, payload }) {
  const request = requestToValidate.value
  if (!request) return

  if (action === 'accept') {
    request.status = 'Acceptée'
    request.priority = payload.priority
    request.validation = {
      ...request.validation,
      decision: 'Acceptée',
      by: currentUser.name,
      date: '18/07/2026',
      comment: payload.comment
    }
    request.history.push(historyEvent('Demande acceptée', `Technicien suggéré : ${payload.technician}.`, currentUser.name, '18/07/2026 15:00', 'green'))
    showToast('Demande acceptée.')
  }

  if (action === 'reject') {
    request.status = 'Refusée'
    request.validation = {
      ...request.validation,
      decision: 'Refusée',
      by: currentUser.name,
      date: '18/07/2026',
      refusalReason: payload.reason,
      comment: payload.comment
    }
    request.history.push(historyEvent('Demande refusée', payload.reason, currentUser.name, '18/07/2026 15:05', 'red'))
    showToast('Demande refusée.')
  }

  if (action === 'askInfo') {
    request.status = 'Informations demandées'
    request.validation = {
      ...request.validation,
      requestedInfo: payload.requestedInfo,
      comment: payload.comment
    }
    request.history.push(historyEvent('Informations demandées', payload.requestedInfo, currentUser.name, '18/07/2026 15:10', 'orange'))
    showToast('Informations demandées.')
  }

  closeValidationModal()
}

function transformRequestToIntervention(request) {
  if (!request || request.status !== 'Acceptée') return

  const nextId = `INT-${890 + requests.value.filter((item) => item.interventionId).length}`
  request.status = 'Intervention créée'
  request.interventionId = nextId
  request.history.push(historyEvent('Intervention créée', `Intervention liée ${nextId}.`, currentUser.name, '18/07/2026 15:20', 'green'))
  showToast(`Intervention ${nextId} créée.`)
}

function deleteRequest(request) {
  if (!window.confirm(`Supprimer la demande ${request.id} ?`)) return
  requests.value = requests.value.filter((item) => item.id !== request.id)
  showToast('Demande supprimée.')
}

function showToast(message) {
  toastMessage.value = message
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 2200)
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.requests-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
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

.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74, 10, 10, 0.28); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px !important; color: #6a9a2a !important; font-size: 11px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 32px; font-weight: 900; }
.page-header p { margin: 6px 0 0; color: #64748b; font-size: 13px; }
.header-actions { display: flex; gap: 12px; }
.primary-button, .secondary-button { min-height: 44px; padding: 0 16px; border-radius: 12px; font-weight: 900; cursor: pointer; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
.secondary-button { background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 11000;
  padding: 14px 18px;
  background: #4a0a0a;
  border-radius: 14px;
  color: white;
  font-weight: 900;
  box-shadow: 0 18px 44px rgba(74, 10, 10, 0.22);
}
.toast-enter-active, .toast-leave-active { transition: 0.22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 960px) {
  .page-header { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 760px) {
  .requests-page { padding: 88px 16px 32px; }
  .header-actions { flex-direction: column; width: 100%; }
  .header-actions button { width: 100%; }
}
</style>
