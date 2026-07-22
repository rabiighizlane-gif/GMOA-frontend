<template>
  <main class="requests-page" :dir="pageDirection">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" :aria-label="content.menu" :aria-expanded="isSidebarOpen" @click="toggleSidebar">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <header class="page-header">
      <div>
        <p class="breadcrumb">{{ content.breadcrumb }}</p>
        <h1>{{ content.title }}</h1>
        <p>{{ content.subtitle }}</p>
      </div>
      <div class="header-actions">
        <button type="button" class="secondary-button" @click="showToast(content.exportReady)">{{ content.export }}</button>
        <button v-if="can('create')" type="button" class="primary-button" @click="openCreateModal">{{ content.newRequest }}</button>
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

    <RequestFormModal :open="formModalOpen" :request="requestToEdit" @close="closeFormModal" @save="saveRequest" />

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
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()

const currentUser = { id: 1, name: 'Super Admin', role: 'super_admin' }
const isSidebarOpen = ref(false)
const drawerOpen = ref(false)
const formModalOpen = ref(false)
const validationModalOpen = ref(false)
const selectedRequest = ref(null)
const requestToEdit = ref(null)
const requestToValidate = ref(null)
const validationAction = ref('')
const toastMessage = ref('')

const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const labels = {
  FR: {
    menu: 'Afficher le menu',
    breadcrumb: 'Accueil / Demandes de maintenance',
    title: 'Demandes de maintenance',
    subtitle: "Declaration, validation et suivi des demandes d'intervention",
    export: 'Exporter',
    newRequest: 'Nouvelle demande',
    exportReady: 'Export pret.',
    saved: 'Demande enregistree.',
    accepted: 'Demande acceptee.',
    rejected: 'Demande refusee.',
    infoAsked: 'Informations demandees.',
    deleted: 'Demande supprimee.',
    deleteConfirm: (id) => `Supprimer la demande ${id} ?`,
    interventionCreated: (id) => `Intervention ${id} creee.`,
    technicianSuggested: (name) => `Technicien suggere : ${name}.`,
    linkedIntervention: (id) => `Intervention liee ${id}.`,
  },
  EN: {
    menu: 'Show menu',
    breadcrumb: 'Home / Maintenance requests',
    title: 'Maintenance requests',
    subtitle: 'Request submission, validation, and intervention tracking',
    export: 'Export',
    newRequest: 'New request',
    exportReady: 'Export ready.',
    saved: 'Request saved.',
    accepted: 'Request accepted.',
    rejected: 'Request rejected.',
    infoAsked: 'Information requested.',
    deleted: 'Request deleted.',
    deleteConfirm: (id) => `Delete request ${id}?`,
    interventionCreated: (id) => `Intervention ${id} created.`,
    technicianSuggested: (name) => `Suggested technician: ${name}.`,
    linkedIntervention: (id) => `Linked intervention ${id}.`,
  },
  AR: {
    menu: 'عرض القائمة',
    breadcrumb: 'الرئيسية / طلبات الصيانة',
    title: 'طلبات الصيانة',
    subtitle: 'تصريح وتتبع ومصادقة طلبات التدخل',
    export: 'تصدير',
    newRequest: 'طلب جديد',
    exportReady: 'التصدير جاهز.',
    saved: 'تم حفظ الطلب.',
    accepted: 'تم قبول الطلب.',
    rejected: 'تم رفض الطلب.',
    infoAsked: 'تم طلب معلومات إضافية.',
    deleted: 'تم حذف الطلب.',
    deleteConfirm: (id) => `هل تريد حذف الطلب ${id}؟`,
    interventionCreated: (id) => `تم إنشاء التدخل ${id}.`,
    technicianSuggested: (name) => `التقني المقترح: ${name}.`,
    linkedIntervention: (id) => `التدخل المرتبط ${id}.`,
  },
}

const content = computed(() => labels[languageStore.language] || labels.FR)

const filters = reactive({ search: '', machine: '', line: '', priority: '', status: '', requester: '', period: '' })

const requests = ref([
  createRequest({
    id: 'DM-001',
    machine: 'Convoyeur M-309',
    line: 'Ligne Conditionnement',
    requester: 'Ahmed El Mansouri',
    shortDescription: 'Bruit anormal au niveau du moteur',
    fullDescription: 'Un bruit metallique apparait au demarrage du moteur principal.',
    priority: 'Haute',
    createdAt: '18/07/2026 08:45',
    status: 'En attente',
    interventionId: '',
    problemType: 'Bruit',
    machineStopped: false,
    safetyRisk: false,
  }),
  createRequest({
    id: 'DM-002',
    machine: 'Pasteurisateur P-204',
    line: 'Ligne Production 1',
    requester: 'Sara El Idrissi',
    shortDescription: 'Temperature instable pendant le cycle',
    fullDescription: 'La temperature varie fortement pendant les cycles de pasteurisation.',
    priority: 'Critique',
    createdAt: '18/07/2026 10:20',
    status: 'Acceptee',
    interventionId: '',
    problemType: 'Temperature',
    machineStopped: true,
    safetyRisk: true,
  }),
  createRequest({
    id: 'DM-003',
    machine: 'Compresseur M-412',
    line: 'Ligne Utilites',
    requester: 'Youssef Berrada',
    shortDescription: "Fuite d'air importante",
    fullDescription: 'Fuite audible pres de la vanne de sortie du compresseur.',
    priority: 'Moyenne',
    createdAt: '17/07/2026 14:10',
    status: 'Intervention creee',
    interventionId: 'INT-889',
    problemType: 'Pneumatique',
    machineStopped: false,
    safetyRisk: false,
  }),
  createRequest({
    id: 'DM-004',
    machine: 'Remplisseuse R-118',
    line: 'Ligne Conditionnement',
    requester: 'Nabil Amrani',
    shortDescription: 'Vibrations inhabituelles',
    fullDescription: 'Vibrations legeres observees pendant les phases de dosage.',
    priority: 'Faible',
    createdAt: '16/07/2026 09:15',
    status: 'Refusee',
    interventionId: '',
    problemType: 'Vibration',
    machineStopped: false,
    safetyRisk: false,
  }),
  createRequest({
    id: 'DM-005',
    machine: "Tour d'usinage M-102",
    line: 'Ligne Production 1',
    requester: 'Karim El Fassi',
    shortDescription: 'Informations a completer sur le capteur',
    fullDescription: 'Le signal du capteur semble irregulier, mais la zone exacte doit etre precisee.',
    priority: 'Moyenne',
    createdAt: '18/07/2026 12:30',
    status: 'Informations demandees',
    interventionId: '',
    problemType: 'Electrique',
    machineStopped: false,
    safetyRisk: false,
  }),
])

const machines = computed(() => [...new Set(requests.value.map((request) => request.machine))])
const lines = computed(() => [...new Set(requests.value.map((request) => request.line))])
const requesters = computed(() => [...new Set(requests.value.map((request) => request.requester))])

const visibleRequests = computed(() => {
  const query = filters.search.toLowerCase().trim()

  return requests.value.filter((request) => {
    if (!can('view', request)) return false
    const matchesSearch = !query || [request.id, request.machine, request.requester, request.shortDescription, request.fullDescription].join(' ').toLowerCase().includes(query)
    return matchesSearch && (!filters.machine || request.machine === filters.machine) && (!filters.line || request.line === filters.line) && (!filters.priority || request.priority === filters.priority) && (!filters.status || request.status === filters.status) && (!filters.requester || request.requester === filters.requester) && matchesPeriod(request)
  })
})

const kpiCards = computed(() => [
  { labelKey: 'total', value: requests.value.length, color: 'gray' },
  { labelKey: 'new', value: requests.value.filter((request) => request.createdAt.startsWith('18/07/2026')).length, color: 'green' },
  { labelKey: 'pending', value: countStatus('En attente'), color: 'yellow' },
  { labelKey: 'accepted', value: countStatus('Acceptee'), color: 'green' },
  { labelKey: 'rejected', value: countStatus('Refusee'), color: 'red' },
  { labelKey: 'created', value: countStatus('Intervention creee'), color: 'green' },
])

function createRequest(request) {
  return {
    zone: 'Zone moteur',
    urgency: request.priority,
    symptoms: request.shortDescription,
    operatorComment: 'Observation declaree depuis la ligne.',
    attachments: ['Photo machine.jpg', 'Note operateur.pdf'],
    validation: {
      decision: request.status === 'Acceptee' ? 'Acceptee' : request.status === 'Refusee' ? 'Refusee' : '',
      by: ['Acceptee', 'Refusee'].includes(request.status) ? 'Super Admin' : '',
      date: ['Acceptee', 'Refusee'].includes(request.status) ? '18/07/2026' : '',
      comment: '',
      refusalReason: request.status === 'Refusee' ? 'Demande non prioritaire.' : '',
      requestedInfo: request.status === 'Informations demandees' ? 'Preciser la zone exacte du capteur.' : '',
    },
    history: [
      historyEvent('Demande creee', 'Creation de la demande de maintenance.', request.requester, request.createdAt, 'gray'),
      historyEvent('Demande soumise', 'Demande envoyee pour validation.', request.requester, request.createdAt, 'yellow'),
    ],
    ...request,
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
  if (role === 'responsable_maintenance') return ['view', 'accept', 'reject', 'askInfo', 'transform', 'edit', 'delete'].includes(action)
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
  Object.assign(filters, { search: '', machine: '', line: '', priority: '', status: '', requester: '', period: '' })
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
        history: [...requests.value[index].history, historyEvent('Demande modifiee', 'Mise a jour des informations.', currentUser.name, '18/07/2026 14:30', 'gray')],
      }
    }
  } else {
    const nextNumber = String(requests.value.length + 1).padStart(3, '0')
    requests.value.unshift(createRequest({ ...request, id: `DM-${nextNumber}`, createdAt: '18/07/2026 14:45', interventionId: '' }))
  }
  closeFormModal()
  showToast(content.value.saved)
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
    request.status = 'Acceptee'
    request.priority = payload.priority
    request.validation = { ...request.validation, decision: 'Acceptee', by: currentUser.name, date: '18/07/2026', comment: payload.comment }
    request.history.push(historyEvent('Demande acceptee', content.value.technicianSuggested(payload.technician), currentUser.name, '18/07/2026 15:00', 'green'))
    showToast(content.value.accepted)
  }
  if (action === 'reject') {
    request.status = 'Refusee'
    request.validation = { ...request.validation, decision: 'Refusee', by: currentUser.name, date: '18/07/2026', refusalReason: payload.reason, comment: payload.comment }
    request.history.push(historyEvent('Demande refusee', payload.reason, currentUser.name, '18/07/2026 15:05', 'red'))
    showToast(content.value.rejected)
  }
  if (action === 'askInfo') {
    request.status = 'Informations demandees'
    request.validation = { ...request.validation, requestedInfo: payload.requestedInfo, comment: payload.comment }
    request.history.push(historyEvent('Informations demandees', payload.requestedInfo, currentUser.name, '18/07/2026 15:10', 'orange'))
    showToast(content.value.infoAsked)
  }
  closeValidationModal()
}

function transformRequestToIntervention(request) {
  if (!request || request.status !== 'Acceptee') return
  const nextId = `INT-${890 + requests.value.filter((item) => item.interventionId).length}`
  request.status = 'Intervention creee'
  request.interventionId = nextId
  request.history.push(historyEvent('Intervention creee', content.value.linkedIntervention(nextId), currentUser.name, '18/07/2026 15:20', 'green'))
  showToast(content.value.interventionCreated(nextId))
}

function deleteRequest(request) {
  if (!window.confirm(content.value.deleteConfirm(request.id))) return
  requests.value = requests.value.filter((item) => item.id !== request.id)
  showToast(content.value.deleted)
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
  background:
    radial-gradient(circle at 18% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
  box-sizing: border-box;
}

.requests-page[dir='rtl'] { padding-right: 88px; padding-left: 28px; }
.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 90;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  background: rgba(17, 27, 38, 0.94);
  border: 1px solid rgba(126, 146, 170, 0.3);
  border-radius: 8px;
  color: #f4f7fb;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
  cursor: pointer;
}
.requests-page[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(5, 10, 17, 0.54); backdrop-filter: blur(3px); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px !important; color: #bce39d !important; font-size: 11px; font-weight: 900; }
.page-header h1 { margin: 0; color: #f8fbff; font-size: 32px; font-weight: 900; letter-spacing: 0; }
.page-header p { margin: 6px 0 0; color: #aab7c7; font-size: 13px; }
.header-actions { display: flex; gap: 12px; }
.primary-button, .secondary-button { min-height: 44px; padding: 0 16px; border-radius: 8px; font-weight: 900; cursor: pointer; }
.primary-button { background: #5f8f2f; border: 1px solid rgba(131, 185, 92, 0.44); color: #f8fbff; }
.secondary-button { background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); color: #f2f6fb; }
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 11000;
  padding: 14px 18px;
  background: rgba(17, 27, 38, 0.96);
  border: 1px solid rgba(131, 185, 92, 0.38);
  border-radius: 8px;
  color: #f8fbff;
  font-weight: 900;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
}
.requests-page[dir='rtl'] .toast { right: auto; left: 24px; }
.toast-enter-active, .toast-leave-active { transition: 0.22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 960px) {
  .page-header { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 760px) {
  .requests-page,
  .requests-page[dir='rtl'] { padding: 88px 16px 32px; }
  .header-actions { flex-direction: column; width: 100%; }
  .header-actions button { width: 100%; }
}
</style>
