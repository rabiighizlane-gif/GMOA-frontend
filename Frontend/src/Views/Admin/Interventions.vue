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
        <div class="light-title-icon" aria-hidden="true">
          <InterventionIcon name="wrench" />
        </div>
        <div>
          <nav :aria-label="content.breadcrumbLabel">
            <span>{{ content.home }}</span>
            <strong>&gt;</strong>
            <span>{{ content.title }}</span>
          </nav>
          <span class="light-domain-badge">{{ content.domain }}</span>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
        <div class="light-header-actions">
          <button type="button" class="ghost-action light-export-button" @click="exportCurrentRows">
            <InterventionIcon name="download" />
            {{ content.filters.export }}
          </button>
          <button v-if="canManageInterventions" type="button" class="primary-action light-create-button" @click="openCreateModal">
            <InterventionIcon name="plus" />
            {{ content.filters.create }}
          </button>
        </div>
        <AdminTopControls v-model="globalSearch" />
      </header>

      <KPICards :cards="kpiCards" />

      <FiltersBar
        v-model="filters"
        :can-create="canManageInterventions"
        :content="content.filters"
        :equipment-options="equipmentOptions"
        :has-active-filters="hasActiveFilters"
        :loading="loading"
        :line-options="lineOptions"
        :results-count="pagination.total"
        :technicians="technicianOptions"
        :zone-options="filteredZoneOptions"
        @create="openCreateModal"
        @export="exportCurrentRows"
        @refresh="refreshAll"
        @reset="resetFilters"
      />

      <p v-if="successMessage" class="state-message success">{{ successMessage }}</p>

      <section v-if="errorMessage" class="state-card" role="alert">
        <strong>{{ errorMessage }}</strong>
        <button type="button" @click="refreshAll">{{ content.retry }}</button>
      </section>

      <section v-if="loading" class="skeleton-card" aria-label="Chargement">
        <span v-for="item in 5" :key="item"></span>
      </section>

      <section v-else-if="!errorMessage && !interventionRows.length" class="empty-card">
        <div class="empty-illustration" aria-hidden="true">
          <InterventionIcon name="wrench" />
        </div>
        <h2>{{ content.empty.title }}</h2>
        <p>{{ content.empty.text }}</p>
        <button v-if="canManageInterventions" type="button" @click="openCreateModal">
          <InterventionIcon name="plus" />
          {{ content.empty.action }}
        </button>
      </section>

      <InterventionTable
        v-else
        :can-manage="canManageInterventions"
        :content="content.table"
        :pagination="pagination"
        :rows="interventionRows"
        @delete="removeIntervention"
        @edit="openEditModal"
        @page-change="changePage"
        @sort="changeSort"
        @view="openDrawer"
      />
    </section>

    <InterventionDrawer :intervention="selectedIntervention" @close="selectedIntervention = null" />

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="formOpen" class="modal-layer" @click.self="closeForm">
          <form class="modal-panel" @submit.prevent="submitForm">
            <header>
              <div>
                <span>{{ editingIntervention ? content.form.editBadge : content.form.createBadge }}</span>
                <h2>{{ editingIntervention ? content.form.editTitle : content.form.createTitle }}</h2>
              </div>
              <button type="button" :aria-label="content.form.close" @click="closeForm">
                <InterventionIcon name="x" />
              </button>
            </header>

            <div class="form-grid">
              <label>
                <span>{{ content.form.code }}</span>
                <input v-model.trim="form.code" required />
              </label>
              <label>
                <span>{{ content.form.equipment }}</span>
                <select v-model="form.equipment_id" required>
                  <option value="">{{ content.form.selectEquipment }}</option>
                  <option v-for="equipment in equipmentOptions" :key="equipment.id" :value="equipment.id">
                    {{ equipment.code }} - {{ equipment.name }}
                  </option>
                </select>
              </label>
              <label>
                <span>{{ content.form.type }}</span>
                <select v-model="form.type">
                  <option v-for="option in typeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label>
                <span>{{ content.form.priority }}</span>
                <select v-model="form.priority">
                  <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label>
                <span>{{ content.form.status }}</span>
                <select v-model="form.status">
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label>
                <span>{{ content.form.technician }}</span>
                <select v-model="form.assigned_technician_id">
                  <option value="">{{ content.notAssigned }}</option>
                  <option v-for="technician in technicianOptions" :key="technician.id" :value="technician.id">
                    {{ displayUser(technician) }}
                  </option>
                </select>
              </label>
              <label>
                <span>{{ content.form.scheduledAt }}</span>
                <input v-model="form.scheduled_at" type="datetime-local" />
              </label>
              <label>
                <span>{{ content.form.duration }}</span>
                <input v-model.number="form.duration_minutes" min="0" type="number" />
              </label>
              <label class="full">
                <span>{{ content.form.description }}</span>
                <textarea v-model.trim="form.description" required rows="4"></textarea>
              </label>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>

            <footer>
              <button type="button" class="ghost-action" @click="closeForm">{{ content.form.cancel }}</button>
              <button type="submit" class="primary-action" :disabled="saving">
                {{ saving ? content.form.saving : content.form.save }}
              </button>
            </footer>
          </form>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import FiltersBar from '@/Components/Interventions/FiltersBar.vue'
import InterventionDrawer from '@/Components/Interventions/InterventionDrawer.vue'
import InterventionIcon from '@/Components/Interventions/InterventionIcon.vue'
import InterventionTable from '@/Components/Interventions/InterventionTable.vue'
import KPICards from '@/Components/Interventions/KPICards.vue'
import Sidebar from '@/Components/sidebar.vue'
import { useLanguageStore } from '@/stores/language'
import { getEquipments } from '@/services/equipmentService'
import {
  createIntervention,
  deleteIntervention,
  getInterventionById,
  getInterventionStats,
  getInterventions,
  updateIntervention,
} from '@/services/interventionsService'
import { getProductionLines } from '@/services/productionLinesService'
import { getUsers } from '@/services/usersService'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const globalSearch = ref('')
const selectedIntervention = ref(null)
const isSidebarOpen = ref(false)
const storedUser = ref(localStorage.getItem('user'))
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const formError = ref('')
const formOpen = ref(false)
const editingIntervention = ref(null)
const interventions = ref([])
const stats = ref({})
const pagination = ref({ page: 1, limit: 10, total: 0, total_pages: 0 })
const equipmentOptions = ref([])
const lineOptions = ref([])
const userOptions = ref([])
let filterTimer = null

const filters = ref({
  search: '',
  date: '',
  technician_id: '',
  status: '',
  type: '',
  priority: '',
  production_line_id: '',
  production_zone_id: '',
  equipment_id: '',
  sort_by: 'created_at',
  sort_order: 'desc',
})

const form = ref(defaultForm())

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    breadcrumbLabel: "Fil d'Ariane",
    home: 'Accueil',
    domain: 'Maintenance',
    title: 'Interventions',
    subtitle: "Planifiez, affectez et suivez les interventions de maintenance de l'usine.",
    retry: 'Reessayer',
    notAssigned: 'Non affecte',
    noValue: '-',
    empty: {
      title: 'Aucune intervention enregistree',
      text: 'Les interventions apparaitront ici des leur creation ou leur planification.',
      action: 'Creer une intervention',
    },
    kpis: {
      total: ['Interventions totales', 'Depuis PostgreSQL'],
      inProgress: ['En cours', 'Statut actif'],
      done: ['Terminees', 'Cloturees ou fermees'],
      pending: ['En attente', 'A planifier'],
      technicians: ['Techniciens actifs', 'Affectations reelles'],
      average: ["Temps moyen d'intervention", 'Duree calculee'],
    },
    filters: {
      search: 'Rechercher intervention, machine, ligne, zone...',
      date: 'Date',
      technician: 'Technicien',
      status: 'Statut',
      type: 'Type',
      priority: 'Priorite',
      line: 'Ligne',
      zone: 'Zone',
      equipment: 'Machine',
      sort: 'Tri',
      all: 'Tous',
      export: 'Export',
      create: 'Nouvelle intervention',
      advanced: 'Filtres avances',
      reset: 'Reinitialiser',
      refresh: 'Actualiser',
      clearSearch: 'Vider la recherche',
      found: (count) => `${count} ${count === 1 ? 'intervention trouvee' : 'interventions trouvees'}`,
    },
    table: {
      title: 'Liste des interventions',
      subtitle: "Suivi des interventions, des affectations et de leur etat d'avancement.",
      count: (count) => `${count} interventions trouvees`,
      page: (current, total) => `Page ${current} / ${total}`,
      columns: {
        code: 'Code',
        machine: 'Machine',
        line: 'Ligne',
        zone: 'Zone',
        type: 'Type',
        priority: 'Priorite',
        technicianName: 'Technicien',
        start: 'Debut',
        end: 'Fin',
        duration: 'Duree',
        status: 'Statut',
        actions: 'Actions',
      },
      previous: 'Precedent',
      next: 'Suivant',
      of: 'sur',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      deleteConfirm: "Supprimer cette intervention ?",
      assign: 'Affecter',
      statusAction: 'Changer le statut',
      plannedStart: 'Debut',
      plannedEnd: 'Fin',
      notCompleted: 'Non terminee',
    },
    form: {
      createBadge: 'Creation',
      editBadge: 'Modification',
      createTitle: 'Nouvelle intervention',
      editTitle: 'Modifier intervention',
      close: 'Fermer',
      code: 'Code',
      equipment: 'Machine',
      selectEquipment: 'Selectionner une machine',
      type: 'Type',
      priority: 'Priorite',
      status: 'Statut',
      technician: 'Technicien',
      scheduledAt: 'Planifiee le',
      duration: 'Duree minutes',
      description: 'Description',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)
const currentUserRole = computed(() => {
  try {
    const user = JSON.parse(storedUser.value || '{}')
    return String(user.role || '').toLowerCase()
  } catch {
    return ''
  }
})
const canManageInterventions = computed(() => ['super_admin', 'admin'].includes(currentUserRole.value))
const hasActiveFilters = computed(() =>
  Boolean(
    filters.value.search ||
      filters.value.date ||
      filters.value.technician_id ||
      filters.value.status ||
      filters.value.type ||
      filters.value.priority ||
      filters.value.production_line_id ||
      filters.value.production_zone_id ||
      filters.value.equipment_id,
  ),
)

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'planned', label: 'Planifiee' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminee' },
  { value: 'closed', label: 'Fermee' },
  { value: 'cancelled', label: 'Annulee' },
]
const typeOptions = [
  { value: 'corrective', label: 'Corrective' },
  { value: 'preventive', label: 'Preventive' },
  { value: 'improvement', label: 'Amelioration' },
  { value: 'inspection', label: 'Inspection' },
]
const priorityOptions = [
  { value: 'critical', label: 'Critique' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
]

const technicianOptions = computed(() =>
  userOptions.value.filter((user) => ['technician', 'admin', 'super_admin'].includes(String(user.role || '').toLowerCase())),
)
const filteredZoneOptions = computed(() => {
  const zones = lineOptions.value.flatMap((line) =>
    Array.isArray(line.zones)
      ? line.zones.map((zone) => ({ ...zone, production_line_id: zone.production_line_id || line.id }))
      : [],
  )

  if (!filters.value.production_line_id) return zones
  return zones.filter((zone) => Number(zone.production_line_id) === Number(filters.value.production_line_id))
})
const interventionRows = computed(() => interventions.value.map(normalizeInterventionRow))
const kpiCards = computed(() => [
  {
    icon: 'activity',
    title: content.value.kpis.total[0],
    value: Number(stats.value.total_interventions || 0),
    evolution: content.value.kpis.total[1],
    tone: 'primary',
  },
  {
    icon: 'clock',
    title: content.value.kpis.inProgress[0],
    value: Number(stats.value.in_progress_interventions || 0),
    evolution: content.value.kpis.inProgress[1],
    tone: 'attention',
  },
  {
    icon: 'check',
    title: content.value.kpis.done[0],
    value: Number(stats.value.completed_interventions || 0),
    evolution: content.value.kpis.done[1],
    tone: 'primary',
  },
  {
    icon: 'pause',
    title: content.value.kpis.pending[0],
    value: Number(stats.value.pending_interventions || 0),
    evolution: content.value.kpis.pending[1],
    tone: 'danger',
  },
  {
    icon: 'users',
    title: content.value.kpis.technicians[0],
    value: Number(stats.value.active_technicians || 0),
    evolution: content.value.kpis.technicians[1],
    tone: 'primary',
  },
  {
    icon: 'timer',
    title: content.value.kpis.average[0],
    value: formatDuration(stats.value.average_intervention_minutes),
    evolution: content.value.kpis.average[1],
    tone: 'warning',
  },
])

watch(globalSearch, (value) => {
  filters.value = { ...filters.value, search: value }
})

watch(
  filters,
  () => {
    window.clearTimeout(filterTimer)
    filterTimer = window.setTimeout(() => {
      loadInterventions(1)
    }, 300)
  },
  { deep: true },
)

onMounted(() => {
  refreshAll()
})

function defaultForm() {
  return {
    code: '',
    equipment_id: '',
    type: 'corrective',
    priority: 'medium',
    status: 'pending',
    description: '',
    assigned_technician_id: '',
    scheduled_at: '',
    duration_minutes: '',
  }
}

async function refreshAll() {
  await Promise.all([loadInterventions(), loadStats(), loadReferenceData()])
}

async function loadInterventions(page = pagination.value.page || 1) {
  loading.value = true
  errorMessage.value = ''

  try {
    const params = buildQueryParams(page)
    const response = await getInterventions(params)
    interventions.value = response.interventions
    pagination.value = response.pagination || {
      page,
      limit: params.limit,
      total: response.interventions.length,
      total_pages: response.interventions.length ? 1 : 0,
    }
  } catch (error) {
    interventions.value = []
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await getInterventionStats()
  } catch (error) {
    stats.value = {}
    if (!errorMessage.value) errorMessage.value = error.message
  }
}

async function loadReferenceData() {
  const [equipmentsResult, linesResult, usersResult] = await Promise.allSettled([
    getEquipments(),
    getProductionLines(),
    getUsers(),
  ])

  equipmentOptions.value = equipmentsResult.status === 'fulfilled' ? equipmentsResult.value : []
  lineOptions.value = linesResult.status === 'fulfilled' ? linesResult.value : []
  userOptions.value = usersResult.status === 'fulfilled' ? usersResult.value : []
}

function buildQueryParams(page) {
  const params = {
    page,
    limit: pagination.value.limit || 10,
    sort_by: filters.value.sort_by || 'created_at',
    sort_order: filters.value.sort_order || 'desc',
  }

  const fields = [
    'search',
    'status',
    'type',
    'priority',
    'equipment_id',
    'production_line_id',
    'production_zone_id',
    'technician_id',
  ]

  fields.forEach((field) => {
    if (filters.value[field]) params[field] = filters.value[field]
  })

  if (filters.value.date) {
    params.date_from = filters.value.date
    params.date_to = filters.value.date
  }

  return params
}

function normalizeInterventionRow(intervention) {
  const technicianName = intervention.technician ? displayUser(intervention.technician) : content.value.notAssigned
  const equipment = intervention.equipment
    ? `${intervention.equipment.code || ''} ${intervention.equipment.name || ''}`.trim()
    : content.value.noValue

  return {
    ...intervention,
    raw: intervention,
    code: intervention.code || `#${intervention.id}`,
    machine: equipment || content.value.noValue,
    line: formatNested(intervention.production_line),
    zone: formatNested(intervention.production_zone),
    typeLabel: displayOption(typeOptions, intervention.type),
    priorityLabel: displayOption(priorityOptions, intervention.priority),
    technician: {
      name: technicianName,
      initials: initials(technicianName),
      color: intervention.technician ? '#6A9A2A' : '#6b7280',
    },
    start: formatDateTime(intervention.started_at || intervention.scheduled_at) || 'Non planifiee',
    end: formatDateTime(intervention.completed_at) || content.value.noValue,
    duration: formatDuration(intervention.duration_minutes),
    statusLabel: displayOption(statusOptions, intervention.status),
  }
}

function formatNested(value) {
  if (!value) return content.value.noValue
  return `${value.code || ''} ${value.name || ''}`.trim() || content.value.noValue
}

function displayOption(options, value) {
  return options.find((option) => option.value === value)?.label || value || content.value.noValue
}

function displayUser(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || content.value.notAssigned
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '--'
}

function formatDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDuration(value) {
  const minutes = Number(value || 0)
  if (!minutes) return content.value.noValue
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest} min`
  return `${hours}h ${String(rest).padStart(2, '0')}`
}

async function openDrawer(row) {
  try {
    selectedIntervention.value = normalizeInterventionRow(await getInterventionById(row.raw?.id || row.id))
  } catch (error) {
    errorMessage.value = error.message
  }
}

function openCreateModal() {
  editingIntervention.value = null
  form.value = defaultForm()
  formError.value = ''
  formOpen.value = true
}

function openEditModal(row) {
  const intervention = row.raw || row
  editingIntervention.value = intervention
  form.value = {
    code: intervention.code || '',
    equipment_id: intervention.equipment?.id || '',
    type: intervention.type || 'corrective',
    priority: intervention.priority || 'medium',
    status: intervention.status || 'pending',
    description: intervention.description || '',
    assigned_technician_id: intervention.technician?.id || '',
    scheduled_at: toDatetimeLocal(intervention.scheduled_at),
    duration_minutes: intervention.duration_minutes ?? '',
  }
  formError.value = ''
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  formError.value = ''
}

async function submitForm() {
  saving.value = true
  formError.value = ''

  try {
    const payload = normalizeFormPayload()
    if (editingIntervention.value) {
      await updateIntervention(editingIntervention.value.id, payload)
      successMessage.value = 'Intervention modifiee avec succes.'
    } else {
      await createIntervention(payload)
      successMessage.value = 'Intervention creee avec succes.'
    }
    closeForm()
    await Promise.all([loadInterventions(), loadStats()])
  } catch (error) {
    formError.value = error.message
  } finally {
    saving.value = false
  }
}

function normalizeFormPayload() {
  return {
    code: form.value.code,
    equipment_id: form.value.equipment_id,
    type: form.value.type,
    priority: form.value.priority,
    status: form.value.status,
    description: form.value.description,
    assigned_technician_id: form.value.assigned_technician_id || null,
    scheduled_at: form.value.scheduled_at || null,
    duration_minutes: form.value.duration_minutes === '' ? null : Number(form.value.duration_minutes),
  }
}

async function removeIntervention(row) {
  if (!window.confirm(content.value.table.deleteConfirm)) return

  try {
    await deleteIntervention(row.raw?.id || row.id)
    successMessage.value = 'Intervention supprimee avec succes.'
    await Promise.all([loadInterventions(), loadStats()])
  } catch (error) {
    errorMessage.value = error.message
  }
}

function changePage(page) {
  loadInterventions(page)
}

function changeSort(sort) {
  filters.value = {
    ...filters.value,
    sort_by: sort.key,
    sort_order: sort.direction,
  }
}

function resetFilters() {
  filters.value = {
    search: '',
    date: '',
    technician_id: '',
    status: '',
    type: '',
    priority: '',
    production_line_id: '',
    production_zone_id: '',
    equipment_id: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  }
  globalSearch.value = ''
}

function exportCurrentRows() {
  if (!interventionRows.value.length) {
    successMessage.value = 'Aucune intervention reelle a exporter.'
    return
  }

  const headers = ['code', 'machine', 'line', 'zone', 'type', 'priority', 'technician', 'start', 'end', 'duration', 'status']
  const csv = [
    headers.join(';'),
    ...interventionRows.value.map((row) =>
      [
        row.code,
        row.machine,
        row.line,
        row.zone,
        row.typeLabel,
        row.priorityLabel,
        row.technician.name,
        row.start,
        row.end,
        row.duration,
        row.statusLabel,
      ]
        .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'interventions.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function toDatetimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
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
  background:
    radial-gradient(circle at 20% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}

.interventions-page {
  min-height: 100vh;
  display: grid;
  gap: 20px;
  padding: 28px 28px 38px 88px;
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
  color: #aab7c7;
  font-size: 12px;
  font-weight: 900;
}

h1,
p {
  margin: 0;
}

h1 {
  margin-top: 10px;
  color: #f8fbff;
  font-size: 34px;
  font-weight: 950;
  letter-spacing: 0;
}

.page-header p {
  margin-top: 8px;
  color: #aab7c7;
  font-size: 15px;
  font-weight: 820;
}

.sidebar-toggle {
  position: fixed;
  top: 22px;
  left: 22px;
  z-index: 50;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid rgba(126, 146, 170, 0.22);
  border-radius: 12px;
  background: rgba(28, 40, 54, 0.9);
  color: #d9e4ef;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
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
  background: rgba(5, 10, 18, 0.56);
  backdrop-filter: blur(3px);
}

.state-card,
.empty-card,
.skeleton-card,
.state-message {
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background: rgba(17, 27, 38, 0.9);
  padding: 22px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #ffb4be;
}

.state-card button,
.empty-card button,
.primary-action {
  border: 1px solid rgba(131, 185, 92, 0.44);
  border-radius: 12px;
  background: #5f8f2f;
  color: #f8fbff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 950;
  min-height: 42px;
  padding: 0 16px;
}

.state-message.success {
  color: #bce39d;
}

.skeleton-card {
  display: grid;
  gap: 12px;
}

.skeleton-card span {
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(126,146,170,.12), rgba(126,146,170,.26), rgba(126,146,170,.12));
  animation: shimmer 1.2s ease-in-out infinite;
}

.empty-card {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
}

.empty-card h2 {
  margin: 0;
  color: #f8fbff;
  font-size: 22px;
  font-weight: 950;
}

.empty-card p {
  color: #aab7c7;
  font-weight: 820;
}

.empty-illustration {
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
  font-size: 32px;
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  background: rgba(5, 10, 18, 0.62);
  backdrop-filter: blur(3px);
  padding: 18px;
}

.modal-panel {
  width: min(760px, 96vw);
  max-height: 92vh;
  overflow: auto;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(31,43,57,.98), rgba(16,25,36,.98)), #101924;
  color: #f4f7fb;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.44);
}

.modal-panel header,
.modal-panel footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

.modal-panel footer {
  border-top: 1px solid rgba(116, 135, 158, 0.15);
  border-bottom: 0;
}

.modal-panel header span {
  color: #bce39d;
  font-size: 12px;
  font-weight: 950;
}

.modal-panel h2 {
  margin: 5px 0 0;
  color: #f8fbff;
  font-size: 21px;
  font-weight: 950;
}

.modal-panel header button,
.ghost-action {
  min-height: 40px;
  border: 1px solid rgba(210, 221, 234, 0.28);
  border-radius: 10px;
  background: rgba(13, 21, 32, 0.82);
  color: #f2f6fb;
  cursor: pointer;
  padding: 0 14px;
  font-weight: 900;
}

.modal-panel header button {
  width: 40px;
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 20px;
}

.form-grid label {
  display: grid;
  gap: 7px;
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 900;
}

.form-grid label.full {
  grid-column: 1 / -1;
}

.form-grid input,
.form-grid select,
.form-grid textarea {
  width: 100%;
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.72);
  color: #f4f7fb;
  outline: none;
  padding: 12px;
  font-size: 13px;
  font-weight: 850;
}

.form-error {
  color: #ffb4be;
  padding: 0 20px 18px;
  font-weight: 850;
}

.primary-action:disabled {
  opacity: 0.7;
  cursor: progress;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.interventions-page :deep(.admin-top-controls) {
  justify-content: flex-end;
}

.light-title-icon,
.light-domain-badge,
.light-header-actions {
  display: none;
}

.interventions-page :deep(.search-control input),
.interventions-page :deep(.notification-control),
.interventions-page :deep(.date-control),
.interventions-page :deep(.time-control),
.interventions-page :deep(.live-control),
.interventions-page :deep(.language-button) {
  min-height: 42px;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 14px;
  background: rgba(19, 29, 42, 0.9);
  color: #f5f8fc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 28px rgba(0, 0, 0, 0.2);
}

@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
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

  .form-grid {
    grid-template-columns: 1fr;
  }
}

:global(html[data-theme='light']) .interventions-layout,
:global(html[data-theme='light']) .interventions-page {
  background: #f7f9f3 !important;
  background-image: none !important;
  color: #4a0a0a !important;
}

:global(html[data-theme='light']) .interventions-page {
  gap: 18px;
}

:global(html[data-theme='light']) .page-header {
  align-items: center;
}

:global(html[data-theme='light']) .page-header nav {
  display: none;
}

:global(html[data-theme='light']) .light-title-icon {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid rgba(106, 154, 42, 0.22);
  border-radius: 16px;
  background: #ffffff;
  color: #6a9a2a;
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.07);
  font-size: 25px;
}

:global(html[data-theme='light']) .light-domain-badge {
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #e3edcf;
  color: #6a9a2a;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 950;
}

:global(html[data-theme='light']) .page-header h1 {
  margin-top: 7px;
  color: #4a0a0a !important;
  font-size: 32px;
}

:global(html[data-theme='light']) .page-header p {
  max-width: 700px;
  color: #53667f !important;
  line-height: 1.55;
}

:global(html[data-theme='light']) .light-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

:global(html[data-theme='light']) .light-export-button,
:global(html[data-theme='light']) .light-create-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
}

:global(html[data-theme='light']) .light-export-button {
  border: 1px solid #dfe5d6;
  background: #ffffff;
  color: #4a0a0a;
}

:global(html[data-theme='light']) .light-create-button {
  border: 1px solid #6a9a2a;
  background: #6a9a2a;
  color: #ffffff;
}

:global(html[data-theme='light']) .page-header > .admin-top-controls,
:global(html[data-theme='light']) .interventions-page :deep(.admin-top-controls) {
  display: none;
}

:global(html[data-theme='light']) .interventions-page :deep(.kpi-grid) {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

:global(html[data-theme='light']) .interventions-page :deep(.kpi-card) {
  min-height: 96px;
  align-items: center;
  border-color: #edf0e8;
  background: #ffffff;
  background-image: none;
  box-shadow: 0 10px 26px rgba(74, 10, 10, 0.05);
  padding: 14px;
}

:global(html[data-theme='light']) .interventions-page :deep(.kpi-card:nth-child(n+5)) {
  display: none;
}

:global(html[data-theme='light']) .interventions-page :deep(.kpi-card strong) {
  color: #4a0a0a;
  font-size: 24px;
}

:global(html[data-theme='light']) .interventions-page :deep(.kpi-card p) {
  color: #4a0a0a;
  font-size: 12px;
}

:global(html[data-theme='light']) .interventions-page :deep(.kpi-card small) {
  color: #53667f;
}

:global(html[data-theme='light']) .state-card,
:global(html[data-theme='light']) .empty-card,
:global(html[data-theme='light']) .skeleton-card,
:global(html[data-theme='light']) .state-message {
  border-color: #edf0e8;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.06);
  color: #4a0a0a;
}

:global(html[data-theme='light']) .empty-card h2 {
  color: #4a0a0a;
}

:global(html[data-theme='light']) .empty-card p {
  color: #53667f;
}

:global(html[data-theme='light']) .modal-panel {
  border-color: #edf0e8;
  background: #ffffff;
  background-image: none;
  color: #4a0a0a;
}

:global(html[data-theme='light']) .modal-panel h2 {
  color: #4a0a0a;
}

:global(html[data-theme='light']) .form-grid input,
:global(html[data-theme='light']) .form-grid select,
:global(html[data-theme='light']) .form-grid textarea {
  border-color: #dfe5d6;
  background: #f7f9f3;
  color: #4a0a0a;
}

@media (max-width: 1180px) {
  :global(html[data-theme='light']) .interventions-page :deep(.kpi-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  :global(html[data-theme='light']) .page-header {
    align-items: flex-start;
  }

  :global(html[data-theme='light']) .light-header-actions {
    width: 100%;
    flex-wrap: wrap;
    margin-left: 0;
  }

  :global(html[data-theme='light']) .light-export-button,
  :global(html[data-theme='light']) .light-create-button {
    flex: 1 1 180px;
  }

  :global(html[data-theme='light']) .interventions-page :deep(.kpi-grid) {
    grid-template-columns: 1fr;
  }
}
</style>
