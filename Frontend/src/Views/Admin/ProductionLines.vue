<template>
  <main class="lines-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" :aria-label="content.sidebarToggle" :aria-expanded="isSidebarOpen" @click="toggleSidebar">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="lines-page">
      <header class="business-header">
        <div class="title-block">
          <span class="title-icon" aria-hidden="true"><Factory :size="24" /></span>
          <div>
            <div class="eyebrow-row">
              <span class="domain-badge">{{ content.domain }}</span>
            </div>
            <h1>{{ content.title }}</h1>
            <p>{{ content.subtitle }}</p>
          </div>
        </div>
        <button v-if="canManageLines" type="button" class="primary-button header-add-button" :disabled="isBusy" @click="openCreateModal">
          <Plus :size="18" aria-hidden="true" />
          <span>{{ content.addLineFull }}</span>
        </button>
      </header>

      <section class="kpi-grid" :aria-label="content.kpiLabel">
        <article v-for="card in kpiCards" :key="card.label" :class="['kpi-card', { loading }]">
          <span class="kpi-icon" aria-hidden="true"><component :is="card.icon" :size="20" /></span>
          <div>
            <strong>{{ card.value }}</strong>
            <span>{{ card.label }}</span>
            <p>{{ card.help }}</p>
          </div>
        </article>
      </section>

      <section :class="['action-bar', { loading }]" :aria-label="content.actionsBar">
        <label class="search-field">
          <span>{{ content.search }}</span>
          <Search class="field-icon" :size="18" aria-hidden="true" />
          <input v-model="searchQuery" type="search" :placeholder="content.searchPlaceholder" />
          <button v-if="searchQuery" type="button" class="clear-search" :aria-label="content.clearSearch" @click="searchQuery = ''">
            <X :size="15" aria-hidden="true" />
          </button>
        </label>

        <label class="filter-field">
          <span>{{ content.statusFilter }}</span>
          <select v-model="statusFilter">
            <option value="">{{ content.allStatuses }}</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">{{ status.label }}</option>
          </select>
        </label>

        <div class="toolbar-buttons">
          <button v-if="hasActiveFilters" type="button" class="secondary-button" @click="resetFilters">{{ content.reset }}</button>
          <span class="results-counter">{{ resultsText }}</span>
          <button type="button" class="icon-button" :aria-label="content.refresh" :data-tooltip="content.refresh" :disabled="loading" @click="loadProductionLines">
            <RefreshCcw :class="{ spinning: loading }" :size="18" aria-hidden="true" />
          </button>
          <button type="button" class="icon-button" :aria-label="content.export" :data-tooltip="content.export" :disabled="!filteredLines.length" @click="exportLines">
            <Download :size="18" aria-hidden="true" />
          </button>
          <button v-if="canManageLines" type="button" class="primary-button" :disabled="isBusy" @click="openCreateModal">
            <Plus :size="18" aria-hidden="true" />
            <span>{{ content.addLine }}</span>
          </button>
        </div>
      </section>

      <Transition name="fade">
        <div v-if="successMessage" class="message success">{{ successMessage }}</div>
      </Transition>
      <Transition name="fade">
        <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
      </Transition>

      <section class="table-panel" aria-labelledby="lines-table-title">
        <div class="panel-header">
          <div>
            <h2 id="lines-table-title">{{ content.tableTitle }}</h2>
            <p>{{ content.tableSubtitle }}</p>
          </div>
          <span>{{ filteredLines.length }} {{ content.results }}</span>
        </div>

        <div v-if="loading" class="skeleton-wrap" :aria-label="content.loading">
          <span v-for="row in 5" :key="row" class="skeleton-row"></span>
        </div>
        <div v-else-if="filteredLines.length === 0" class="empty-state">
          <div class="empty-illustration" aria-hidden="true">
            <Factory :size="54" />
            <span></span>
          </div>
          <strong>{{ emptyStateTitle }}</strong>
          <p>{{ emptyStateText }}</p>
          <button v-if="hasActiveFilters" type="button" class="secondary-button" @click="resetFilters">{{ content.resetFilters }}</button>
          <button v-else-if="canManageLines" type="button" class="primary-button" :disabled="isBusy" @click="openCreateModal">
            <Plus :size="18" aria-hidden="true" />
            <span>{{ content.addLineFull }}</span>
          </button>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ content.columns.id }}</th>
                <th>{{ content.columns.code }}</th>
                <th>{{ content.columns.name }}</th>
                <th>{{ content.columns.zones }}</th>
                <th>{{ content.columns.machines }}</th>
                <th>{{ content.columns.manager }}</th>
                <th>{{ content.columns.status }}</th>
                <th>{{ content.columns.actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in filteredLines" :key="line.id" :class="['line-row', getLineWorkTone(line)]">
                <td data-label="ID"><strong>{{ displayValue(line.id) }}</strong></td>
                <td :data-label="content.columns.code"><strong class="code-chip">{{ displayValue(line.code) }}</strong></td>
                <td :data-label="content.columns.name">
                  <div class="line-name">
                    <strong>{{ displayValue(line.name) }}</strong>
                    <span>{{ displayValue(line.department) }}</span>
                  </div>
                </td>
                <td :data-label="content.columns.zones">
                  <span class="count-cell"><Grid3X3 :size="15" aria-hidden="true" />{{ formatZoneCount(line.zonesCount) }}</span>
                </td>
                <td :data-label="content.columns.machines">
                  <span class="count-cell"><Wrench :size="15" aria-hidden="true" />{{ formatMachineCount(line.machinesCount) }}</span>
                </td>
                <td :data-label="content.columns.manager">
                  <div class="manager-cell" :class="{ empty: !line.manager }">
                    <span class="manager-avatar" aria-hidden="true">{{ managerInitials(line.manager) }}</span>
                    <div>
                      <strong>{{ line.manager || content.unassigned }}</strong>
                      <button v-if="!line.manager && canManageLines" type="button" class="assign-button" @click="openEditModal(line)">{{ content.assignManager }}</button>
                    </div>
                  </div>
                </td>
                <td :data-label="content.columns.status">
                  <ProductionLineStatusBadge :status="line.statusKey" />
                </td>
                <td :data-label="content.columns.actions">
                  <div class="action-group">
                    <RouterLink class="icon-action" :aria-label="content.view" :data-tooltip="content.view" :to="{ name: 'admin-production-line-details', params: { id: line.id } }">
                      <Eye :size="17" aria-hidden="true" />
                      <span>{{ content.view }}</span>
                    </RouterLink>
                    <button v-if="canManageLines" type="button" class="icon-action" :aria-label="content.edit" :data-tooltip="content.edit" @click="openEditModal(line)">
                      <Pencil :size="17" aria-hidden="true" />
                      <span>{{ content.edit }}</span>
                    </button>
                    <button v-if="canManageLines" type="button" class="icon-action danger" :aria-label="content.delete" :data-tooltip="content.delete" :disabled="deletingId === line.id" @click="confirmDelete(line)">
                      <Loader2 v-if="deletingId === line.id" class="spinning" :size="17" aria-hidden="true" />
                      <Trash2 v-else :size="17" aria-hidden="true" />
                      <span>{{ content.delete }}</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <ProductionLinesTree :lines="filteredLines" />

      <Transition name="modal-fade">
        <div v-if="isFormOpen" class="modal-backdrop" role="presentation" @click.self="closeForm">
          <section class="line-modal" role="dialog" aria-modal="true" :aria-label="formTitle">
            <header>
              <div>
                <p>{{ content.formEyebrow }}</p>
                <h2>{{ formTitle }}</h2>
              </div>
              <button type="button" class="modal-close" :aria-label="content.cancel" @click="closeForm">×</button>
            </header>

            <form class="line-form" @submit.prevent="saveLine">
              <label>
                <span>{{ content.fields.code }}</span>
                <input v-model.trim="form.code" required />
              </label>
              <label>
                <span>{{ content.fields.name }}</span>
                <input v-model.trim="form.name" required />
              </label>
              <label>
                <span>{{ content.fields.department }}</span>
                <input v-model.trim="form.department" />
              </label>
              <label>
                <span>{{ content.fields.manager }}</span>
                <input v-model.number="form.responsible_user_id" type="number" min="1" :placeholder="content.fields.managerPlaceholder" />
              </label>
              <label>
                <span>{{ content.fields.status }}</span>
                <select v-model="form.status">
                  <option v-for="status in statusOptions" :key="status.value" :value="status.value">{{ status.label }}</option>
                </select>
              </label>
              <label class="wide">
                <span>{{ content.fields.description }}</span>
                <textarea v-model.trim="form.description" rows="4"></textarea>
              </label>

              <div class="modal-actions">
                <button type="button" class="cancel-button" @click="closeForm">{{ content.cancel }}</button>
                <button type="submit" class="save-button" :disabled="saving">{{ saving ? content.saving : content.save }}</button>
              </div>
            </form>
          </section>
        </div>
      </Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Activity, Download, Eye, Factory, Grid3X3, Loader2, Pencil, Plus, RefreshCcw, Search, Trash2, Wrench, X } from '@lucide/vue'
import ProductionLineStatusBadge from '@/Components/ProductionLines/ProductionLineStatusBadge.vue'
import ProductionLinesTree from '@/Components/ProductionLines/ProductionLinesTree.vue'
import Sidebar from '@/Components/sidebar.vue'
import {
  createProductionLine,
  deleteProductionLine,
  getProductionLines,
  updateProductionLine,
} from '@/services/productionLinesService'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const linesList = ref([])
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const isFormOpen = ref(false)
const editingLine = ref(null)
const language = computed(() => languageStore.language)
const currentUserRole = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return String(user.role || '').toLowerCase().replace(/[\s_-]+/g, '')
  } catch {
    return ''
  }
})

const emptyForm = {
  code: '',
  name: '',
  department: '',
  responsible_user_id: null,
  status: 'active',
  description: '',
}
const form = reactive({ ...emptyForm })

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    domain: 'Production',
    title: 'Lignes de production',
    subtitle: "Organisez, consultez et gerez les lignes de production de l'usine.",
    addLineFull: 'Ajouter une ligne',
    kpiLabel: 'Indicateurs lignes de production',
    kpis: {
      total: ['Total lignes', 'Parc industriel structure'],
      active: ['Lignes actives', 'Disponibles pour production'],
      zones: ['Zones', 'Secteurs rattaches'],
      machines: ['Machines', 'Equipements associes'],
    },
    actionsBar: 'Actions lignes de production',
    search: 'Recherche',
    searchPlaceholder: 'Rechercher par ID, code, nom ou responsable...',
    clearSearch: 'Vider la recherche',
    reset: 'Reinitialiser',
    resetFilters: 'Reinitialiser les filtres',
    refresh: 'Actualiser',
    export: 'Exporter',
    tableTitle: 'Tableau Lignes de production',
    tableSubtitle: 'Vue synthetique des lignes, de leurs zones, de leurs machines et de leur etat actuel.',
    results: 'lignes',
    loading: 'Chargement des lignes de production...',
    emptyTitle: 'Aucune ligne de production',
    emptyText: 'Commencez par enregistrer la premiere ligne de production de votre usine.',
    noResultsTitle: 'Aucun resultat trouve',
    noResultsText: 'Modifiez votre recherche ou reinitialisez les filtres.',
    loadError: 'Impossible de charger les lignes de production.',
    exportReady: 'Export des lignes pret.',
    createSuccess: 'Ligne de production creee avec succes.',
    updateSuccess: 'Ligne de production modifiee avec succes.',
    deleteSuccess: 'Ligne de production supprimee avec succes.',
    confirmDelete: 'Supprimer cette ligne de production ?',
    unassigned: 'Non affecte',
    assignManager: 'Affecter un responsable',
    statusFilter: 'Statut',
    allStatuses: 'Tous les statuts',
    addLine: 'Ajouter',
    editLine: 'Modifier la ligne',
    formEyebrow: 'Gestion des lignes',
    cancel: 'Annuler',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    view: 'Voir',
    edit: 'Modifier',
    delete: 'Supprimer',
    columns: { id: 'ID Ligne', code: 'Code', name: 'Nom de la ligne', zones: 'Zones', machines: 'Machines', manager: 'Responsable', status: 'Statut', actions: 'Actions' },
    fields: { code: 'Code', name: 'Nom de la ligne', department: 'Departement ou atelier', manager: 'ID responsable', managerPlaceholder: 'Optionnel, ex: 3', status: 'Statut', description: 'Description' },
    statuses: { active: 'Active', stopped: 'Arretee', maintenance: 'Maintenance' },
  },
}
pageContent.EN = {
  ...pageContent.FR,
  domain: 'Production',
  title: 'Production lines',
  subtitle: 'Organize, inspect and manage factory production lines.',
  kpis: {
    total: ['Total lines', 'Structured industrial fleet'],
    active: ['Active lines', 'Ready for production'],
    zones: ['Zones', 'Attached sectors'],
    machines: ['Machines', 'Linked equipment'],
  },
  search: 'Search',
  searchPlaceholder: 'Search by code or name...',
  addLineFull: 'Add production line',
  clearSearch: 'Clear search',
  reset: 'Reset',
  resetFilters: 'Reset filters',
  refresh: 'Refresh',
  export: 'Export',
  tableTitle: 'Production lines table',
  tableSubtitle: 'Operational view of lines, zones, machines and managers.',
  results: 'lines',
  loading: 'Loading production lines...',
  emptyTitle: 'No production line found',
  emptyText: 'Add a line to structure production zones and machines.',
  noResultsTitle: 'No result found',
  noResultsText: 'Change your search or reset filters.',
  loadError: 'Unable to load production lines.',
  exportReady: 'Production lines export ready.',
  createSuccess: 'Production line created successfully.',
  updateSuccess: 'Production line updated successfully.',
  deleteSuccess: 'Production line deleted successfully.',
  confirmDelete: 'Delete this production line?',
  unassigned: 'Unassigned',
  assignManager: 'Assign a manager',
  statusFilter: 'Status',
  allStatuses: 'All statuses',
  addLine: 'Add',
  editLine: 'Edit line',
  formEyebrow: 'Line management',
  cancel: 'Cancel',
  save: 'Save',
  saving: 'Saving...',
  view: 'View',
  edit: 'Edit',
  delete: 'Delete',
  columns: { id: 'Line ID', code: 'Code', name: 'Line name', zones: 'Zones', machines: 'Machines', manager: 'Manager', status: 'Status', actions: 'Actions' },
  fields: { code: 'Code', name: 'Line name', department: 'Department or workshop', manager: 'Manager ID', managerPlaceholder: 'Optional, e.g. 3', status: 'Status', description: 'Description' },
  statuses: { active: 'Active', stopped: 'Stopped', maintenance: 'Maintenance' },
}
pageContent.AR = pageContent.FR

const content = computed(() => pageContent[language.value] || pageContent.FR)
const statusOptions = computed(() => [
  { value: 'active', label: content.value.statuses.active },
  { value: 'stopped', label: content.value.statuses.stopped },
  { value: 'maintenance', label: content.value.statuses.maintenance },
])
const formTitle = computed(() => (editingLine.value ? content.value.editLine : content.value.addLine))
const canManageLines = computed(() => ['admin', 'superadmin'].includes(currentUserRole.value))
const isBusy = computed(() => loading.value || saving.value || deletingId.value !== null)
const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim() || statusFilter.value))
const activeLinesCount = computed(() => linesList.value.filter((line) => line.statusKey === 'active').length)
const totalZonesCount = computed(() => linesList.value.reduce((total, line) => total + line.zonesCount, 0))
const totalMachinesCount = computed(() => linesList.value.reduce((total, line) => total + line.machinesCount, 0))
const kpiCards = computed(() => [
  { icon: Factory, value: linesList.value.length, label: content.value.kpis.total[0], help: content.value.kpis.total[1] },
  { icon: Activity, value: activeLinesCount.value, label: content.value.kpis.active[0], help: content.value.kpis.active[1] },
  { icon: Grid3X3, value: totalZonesCount.value, label: content.value.kpis.zones[0], help: content.value.kpis.zones[1] },
  { icon: Wrench, value: totalMachinesCount.value, label: content.value.kpis.machines[0], help: content.value.kpis.machines[1] },
])

const filteredLines = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return linesList.value.filter((line) => {
    const matchesQuery = !query || [line.id, line.code, line.name, line.manager].some((value) => String(value || '').toLowerCase().includes(query))
    const matchesStatus = !statusFilter.value || line.statusKey === statusFilter.value

    return matchesQuery && matchesStatus
  })
})
const resultsText = computed(() => {
  const count = filteredLines.value.length
  return count === 1 ? '1 ligne trouvee' : `${count} lignes trouvees`
})
const emptyStateTitle = computed(() => (hasActiveFilters.value ? content.value.noResultsTitle : content.value.emptyTitle))
const emptyStateText = computed(() => (hasActiveFilters.value ? content.value.noResultsText : content.value.emptyText))

onMounted(loadProductionLines)

async function loadProductionLines() {
  loading.value = true
  errorMessage.value = ''

  try {
    const lines = await getProductionLines()
    linesList.value = lines.map(normalizeProductionLine)
  } catch (error) {
    linesList.value = []
    errorMessage.value = error.message || content.value.loadError
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
}

function normalizeProductionLine(line) {
  const zones = normalizeZones(line)
  const machinesCount = numberOrFallback(
    line.machines_count ?? line.machinesCount ?? line.equipments_count ?? line.equipmentsCount,
    zones.reduce((total, zone) => total + normalizeMachines(zone).length, 0),
  )

  return {
    raw: line,
    id: line.id ?? line.line_id ?? line.lineId ?? line.code,
    code: line.code ?? line.line_code ?? line.lineCode ?? '',
    name: line.name ?? line.label ?? line.line_name ?? line.lineName ?? '',
    department: line.department ?? line.workshop ?? line.atelier ?? '',
    description: line.description ?? '',
    manager: formatResponsible(line.responsible ?? line.manager ?? line.responsible_name ?? line.manager_name),
    responsibleUserId: line.responsible_user_id ?? line.responsibleUserId ?? line.responsible?.id ?? line.manager?.id ?? null,
    statusKey: normalizeStatus(line.status),
    zonesCount: numberOrFallback(line.zones_count ?? line.zonesCount, zones.length),
    machinesCount,
  }
}

function normalizeZones(line) {
  const zones = line.zones || line.production_zones || line.productionZones || []
  return Array.isArray(zones) ? zones : []
}

function normalizeMachines(zone) {
  const machines = zone.machines || zone.equipments || []
  return Array.isArray(machines) ? machines : []
}

function formatResponsible(responsible) {
  if (!responsible) return ''
  if (typeof responsible === 'string') return responsible

  const fullName = [responsible.first_name, responsible.last_name].filter(Boolean).join(' ').trim()
  return responsible.name || fullName || responsible.email || ''
}

function normalizeStatus(status) {
  const value = String(status || 'active').trim().toLowerCase()

  if (['stopped', 'stop', 'arret', 'arretee', 'arrêtée', 'inactive', 'down'].includes(value)) return 'stopped'
  if (['maintenance', 'in_maintenance', 'en maintenance'].includes(value)) return 'maintenance'
  return 'active'
}

function numberOrFallback(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function openCreateModal() {
  editingLine.value = null
  Object.assign(form, emptyForm)
  isFormOpen.value = true
}

function openEditModal(line) {
  editingLine.value = line
  Object.assign(form, {
    code: line.code,
    name: line.name,
    department: line.department,
    responsible_user_id: line.responsibleUserId,
    status: line.statusKey,
    description: line.description,
  })
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editingLine.value = null
  Object.assign(form, emptyForm)
}

async function saveLine() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      code: form.code,
      name: form.name,
      department: form.department || null,
      description: form.description || null,
      responsible_user_id: form.responsible_user_id || null,
      status: form.status,
    }

    if (editingLine.value) {
      await updateProductionLine(editingLine.value.id, payload)
      successMessage.value = content.value.updateSuccess
    } else {
      await createProductionLine(payload)
      successMessage.value = content.value.createSuccess
    }

    closeForm()
    await loadProductionLines()
  } catch (error) {
    errorMessage.value = error.message || content.value.loadError
  } finally {
    saving.value = false
  }
}

async function confirmDelete(line) {
  if (!window.confirm(content.value.confirmDelete)) return

  deletingId.value = line.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteProductionLine(line.id)
    successMessage.value = content.value.deleteSuccess
    await loadProductionLines()
  } catch (error) {
    errorMessage.value = error.message || content.value.loadError
  } finally {
    deletingId.value = null
  }
}

function exportLines() {
  const rows = filteredLines.value.map((line) => ({
    id: line.id,
    code: line.code,
    name: line.name,
    zones: line.zonesCount,
    machines: line.machinesCount,
    manager: line.manager || content.value.unassigned,
    status: statusLabel(line.statusKey),
  }))
  const header = Object.keys(rows[0] || {}).join(',')
  const body = rows.map((row) => Object.values(row).map(csvCell).join(',')).join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)
  link.download = 'lignes-production.csv'
  link.click()
  URL.revokeObjectURL(link.href)
  successMessage.value = content.value.exportReady
}

function formatZoneCount(count) {
  return count === 1 ? '1 zone' : `${count} zones`
}

function formatMachineCount(count) {
  return count === 1 ? '1 machine' : `${count} machines`
}

function managerInitials(name) {
  if (!name) return ''
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function getLineWorkTone(line) {
  if (line.statusKey === 'maintenance') return 'technician-tone'
  if (line.statusKey === 'stopped') return 'operator-tone'
  return 'admin-tone'
}

function statusLabel(status) {
  return content.value.statuses[status] || status
}

function displayValue(value) {
  return value || '-'
}
</script>

<style scoped>
.lines-layout { min-height: 100vh; background: var(--sc-bg); color: var(--sc-dark); }
.lines-page { display: flex; flex-direction: column; gap: 18px; min-height: 100vh; padding: 28px 28px 48px 88px; }
[dir='rtl'] .lines-page { padding-right: 88px; padding-left: 28px; }
.business-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.title-block { display: flex; align-items: flex-start; gap: 14px; }
.title-icon { width: 54px; height: 54px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(106, 154, 42, 0.22); border-radius: 16px; background: var(--sc-surface); color: var(--sc-primary); box-shadow: var(--sc-shadow); }
.eyebrow-row { display: flex; gap: 8px; margin-bottom: 6px; }
.domain-badge { min-height: 26px; display: inline-flex; align-items: center; border-radius: 999px; background: var(--sc-soft-secondary); color: var(--sc-primary); padding: 0 10px; font-size: 12px; font-weight: 950; }
.business-header h1 { margin: 0; color: var(--sc-dark); font-size: 32px; font-weight: 950; letter-spacing: 0; }
.business-header p { margin: 7px 0 0; max-width: 680px; color: var(--sc-muted); font-size: 15px; font-weight: 750; line-height: 1.55; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.kpi-card { min-height: 116px; display: flex; gap: 14px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: 0 14px 34px rgba(74, 10, 10, 0.07); padding: 16px; transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
.kpi-card:hover { transform: translateY(-2px); border-color: rgba(106, 154, 42, 0.34); box-shadow: 0 18px 42px rgba(74, 10, 10, 0.1); }
.kpi-card.loading .kpi-icon,
.kpi-card.loading strong,
.kpi-card.loading span,
.kpi-card.loading p,
.action-bar.loading .search-field,
.action-bar.loading .filter-field {
  color: transparent;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--sc-bg), rgba(106, 154, 42, 0.12), var(--sc-bg));
  background-size: 220% 100%;
  animation: shimmer 1.25s ease-in-out infinite;
}
.kpi-icon { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--sc-soft-secondary); color: var(--sc-primary); flex: 0 0 auto; }
.kpi-card strong { display: block; color: var(--sc-dark); font-size: 26px; font-weight: 950; line-height: 1; }
.kpi-card span { display: block; margin-top: 7px; color: var(--sc-dark); font-size: 13px; font-weight: 950; }
.kpi-card p { margin: 5px 0 0; color: var(--sc-muted); font-size: 12px; font-weight: 750; line-height: 1.35; }
.action-bar { display: grid; grid-template-columns: minmax(260px, 1fr) 220px auto; align-items: end; gap: 12px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: var(--sc-shadow); padding: 14px; }
.search-field, .filter-field { display: grid; gap: 6px; color: var(--sc-muted); font-size: 12px; font-weight: 950; }
.search-field { position: relative; }
.search-field input, .filter-field select { width: 100%; height: 44px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-bg); color: var(--sc-dark); padding: 0 13px; font-size: 14px; font-weight: 820; outline: none; transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease; }
.search-field input { padding-left: 42px; }
[dir='rtl'] .search-field input { padding-right: 42px; padding-left: 13px; }
.field-icon { position: absolute; left: 13px; bottom: 13px; color: var(--sc-muted); pointer-events: none; }
[dir='rtl'] .field-icon { right: 13px; left: auto; }
.clear-search { position: absolute; right: 10px; bottom: 10px; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: var(--sc-surface); color: var(--sc-muted); cursor: pointer; }
[dir='rtl'] .clear-search { right: auto; left: 10px; }
.search-field input:focus, .filter-field select:focus, .line-form input:focus, .line-form select:focus, .line-form textarea:focus, .icon-button:focus-visible, .icon-action:focus-visible, .primary-button:focus-visible { border-color: rgba(106, 154, 42, 0.48); box-shadow: 0 0 0 4px var(--sc-soft-secondary); }
.toolbar-buttons { display: flex; align-items: center; justify-content: flex-end; gap: 9px; }
.primary-button, .save-button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 8px; background: var(--sc-primary); color: var(--sc-surface); padding: 0 16px; font-size: 14px; font-weight: 950; cursor: pointer; white-space: nowrap; transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease; }
.primary-button:hover, .save-button:hover { transform: translateY(-1px); box-shadow: 0 14px 26px rgba(106, 154, 42, 0.2); }
.secondary-button { min-height: 42px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); color: var(--sc-dark); padding: 0 13px; font-size: 13px; font-weight: 950; cursor: pointer; }
.secondary-button:hover { background: var(--sc-soft-primary); }
.results-counter { min-height: 42px; display: inline-flex; align-items: center; border-radius: 999px; background: var(--sc-bg); color: var(--sc-muted); padding: 0 12px; font-size: 12px; font-weight: 950; white-space: nowrap; }
.icon-button, .icon-action { position: relative; width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); color: var(--sc-primary); cursor: pointer; text-decoration: none; transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease; }
.icon-action span { display: none; }
.icon-button:hover, .icon-action:hover { transform: translateY(-1px); border-color: rgba(106, 154, 42, 0.36); background: var(--sc-soft-primary); }
.icon-action.danger { color: var(--sc-danger); }
.icon-action.danger:hover { border-color: rgba(227, 30, 36, 0.32); background: var(--sc-soft-danger); }
.icon-button::after, .icon-action::after { content: attr(data-tooltip); position: absolute; right: 50%; bottom: calc(100% + 8px); z-index: 8; opacity: 0; visibility: hidden; transform: translate(50%, 4px); border-radius: 6px; background: var(--sc-dark); color: var(--sc-surface); padding: 6px 8px; font-size: 11px; font-weight: 850; white-space: nowrap; transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease; pointer-events: none; }
.icon-button:hover::after, .icon-action:hover::after, .icon-button:focus-visible::after, .icon-action:focus-visible::after { opacity: 1; visibility: visible; transform: translate(50%, 0); }
.icon-button:disabled, .icon-action:disabled, .save-button:disabled { opacity: 0.55; cursor: wait; transform: none; }
.spinning { animation: spin 0.8s linear infinite; }
.message { border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); padding: 12px 14px; font-size: 13px; font-weight: 850; }
.message.success { color: var(--sc-primary); }
.message.error { color: var(--sc-danger); }
.table-panel { overflow: hidden; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: 0 16px 38px rgba(74, 10, 10, 0.08); }
.panel-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px; border-bottom: 1px solid var(--sc-border); }
.panel-header h2 { margin: 0; color: var(--sc-dark); font-size: 20px; font-weight: 950; }
.panel-header p { margin: 6px 0 0; color: var(--sc-muted); font-size: 14px; font-weight: 750; }
.panel-header > span { min-height: 34px; display: inline-flex; align-items: center; border-radius: 999px; background: var(--sc-soft-secondary); color: var(--sc-primary); padding: 0 12px; font-size: 13px; font-weight: 950; white-space: nowrap; }
.skeleton-wrap { display: grid; gap: 10px; padding: 20px; }
.skeleton-row { height: 54px; border-radius: 8px; background: linear-gradient(90deg, var(--sc-bg), rgba(106, 154, 42, 0.12), var(--sc-bg)); background-size: 220% 100%; animation: shimmer 1.25s ease-in-out infinite; }
.table-wrap { overflow-x: auto; padding: 8px; }
table { width: 100%; min-width: 1100px; border-collapse: separate; border-spacing: 0 6px; }
th, td { padding: 15px 16px; text-align: left; font-size: 14px; }
[dir='rtl'] th, [dir='rtl'] td { text-align: right; }
th { color: var(--sc-muted); font-weight: 950; background: transparent; }
td { color: var(--sc-dark); font-weight: 760; background: var(--sc-surface); border-top: 1px solid transparent; border-bottom: 1px solid transparent; transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease; }
tbody tr:nth-child(even) td { background: rgba(106, 154, 42, 0.035); }
tbody tr:hover td { background: var(--sc-bg); border-color: rgba(106, 154, 42, 0.18); }
tbody td:first-child { border-left: 1px solid transparent; border-radius: 8px 0 0 8px; }
tbody td:last-child { border-right: 1px solid transparent; border-radius: 0 8px 8px 0; }
.line-row.operator-tone td:first-child { border-left-color: var(--sc-danger); }
.line-row.technician-tone td:first-child { border-left-color: var(--sc-warning); }
.line-row.admin-tone td:first-child { border-left-color: var(--sc-primary); }
.line-name strong { display: block; color: var(--sc-dark); font-weight: 950; }
.line-name span { display: block; margin-top: 4px; color: var(--sc-muted); font-size: 12px; font-weight: 760; }
.code-chip { border-radius: 6px; background: var(--sc-bg); color: var(--sc-dark); padding: 5px 8px; }
.manager-cell { display: flex; align-items: center; gap: 10px; }
.manager-avatar { width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--sc-soft-secondary); color: var(--sc-primary); flex: 0 0 auto; }
.manager-cell.empty .manager-avatar { background: #eef0f2; color: var(--sc-muted); }
.manager-cell strong { display: block; color: var(--sc-dark); font-weight: 900; }
.manager-cell small { display: block; margin-top: 3px; color: var(--sc-muted); font-size: 11px; font-weight: 800; }
.assign-button { display: block; margin-top: 3px; border: 0; background: transparent; color: var(--sc-primary); padding: 0; font-size: 11px; font-weight: 950; cursor: pointer; }
.count-cell { display: inline-flex; align-items: center; gap: 7px; color: var(--sc-dark); font-weight: 900; }
.count-cell svg { color: var(--sc-primary); }
.status-badge { min-height: 30px; display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 0 11px; font-size: 12px; font-weight: 950; }
.status-badge i { width: 8px; height: 8px; border-radius: 50%; }
.status-badge.active { background: var(--sc-soft-secondary); color: var(--sc-primary); }
.status-badge.active i { background: var(--sc-primary); }
.status-badge.stopped { background: var(--sc-soft-danger); color: var(--sc-danger); }
.status-badge.stopped i { background: var(--sc-danger); }
.status-badge.maintenance { background: var(--sc-soft-warning); color: var(--sc-warning); }
.status-badge.maintenance i { background: var(--sc-warning); }
.action-group { display: flex; flex-wrap: wrap; gap: 8px; }
.empty-state { min-height: 360px; display: grid; place-items: center; justify-items: center; align-content: center; padding: 36px 20px; text-align: center; }
.empty-illustration { position: relative; width: 118px; height: 92px; display: grid; place-items: center; border: 1px solid rgba(106, 154, 42, 0.2); border-radius: 8px; background: var(--sc-bg); color: var(--sc-primary); }
.empty-illustration span { position: absolute; right: 18px; bottom: 16px; width: 56px; height: 8px; border-radius: 999px; background: var(--sc-soft-secondary); box-shadow: -22px -18px 0 rgba(106, 154, 42, 0.11); }
.empty-state strong { margin-top: 18px; color: var(--sc-dark); font-size: 18px; font-weight: 950; }
.empty-state p { margin: 8px auto 18px; max-width: 520px; color: var(--sc-muted); font-size: 14px; font-weight: 760; line-height: 1.55; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; border: 1px solid var(--sc-border); border-radius: 16px; background: var(--sc-surface); color: var(--sc-dark); box-shadow: var(--sc-shadow); }
[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; border-radius: 999px; background: currentColor; }
.sidebar-backdrop, .modal-backdrop { position: fixed; inset: 0; }
.sidebar-backdrop { z-index: 35; background: rgba(74, 10, 10, 0.28); }
.modal-backdrop { z-index: 120; display: grid; place-items: center; background: rgba(74, 10, 10, 0.34); padding: 24px; }
.line-modal { width: min(900px, 100%); max-height: min(820px, calc(100vh - 48px)); overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: 0 24px 70px rgba(74, 10, 10, 0.22); }
.line-modal header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px; border-bottom: 1px solid var(--sc-border); }
.line-modal header p { margin: 0 0 6px; color: var(--sc-primary); font-size: 12px; font-weight: 950; text-transform: uppercase; }
.line-modal h2 { margin: 0; color: var(--sc-dark); font-size: 22px; font-weight: 950; }
.modal-close { width: 36px; height: 36px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-bg); color: var(--sc-dark); font-size: 24px; font-weight: 700; line-height: 1; cursor: pointer; }
.line-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; overflow-y: auto; padding: 22px 24px 24px; }
.line-form label { display: grid; gap: 7px; }
.line-form label.wide, .modal-actions { grid-column: 1 / -1; }
.line-form label span { color: var(--sc-muted); font-size: 12px; font-weight: 950; }
.line-form input, .line-form select, .line-form textarea { width: 100%; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-bg); color: var(--sc-dark); padding: 0 13px; font-size: 14px; font-weight: 800; outline: none; }
.line-form input, .line-form select { height: 42px; }
.line-form textarea { min-height: 106px; padding-block: 12px; resize: vertical; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 6px; }
.cancel-button { min-height: 42px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); color: var(--sc-dark); padding: 0 16px; font-size: 14px; font-weight: 950; cursor: pointer; }
.fade-enter-active, .fade-leave-active, .modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.fade-enter-from, .fade-leave-to, .modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: translateY(6px); }
@keyframes shimmer { to { background-position: -220% 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1180px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .action-bar { grid-template-columns: 1fr 220px; }
  .toolbar-buttons { grid-column: 1 / -1; }
}
@media (max-width: 780px) {
  .lines-page, [dir='rtl'] .lines-page { padding: 88px 16px 32px; }
  .business-header, .panel-header { align-items: flex-start; flex-direction: column; }
  .title-block { align-items: center; }
  .business-header h1 { font-size: 26px; }
  .kpi-grid, .action-bar, .line-form { grid-template-columns: 1fr; }
  .toolbar-buttons, .primary-button { width: 100%; }
  .header-add-button { width: 100%; }
  .icon-button { flex: 1; }
  .table-wrap { padding: 12px; }
  table, thead, tbody, tr, th, td { display: block; min-width: 0; width: 100%; }
  thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  table { border-spacing: 0; }
  tbody { display: grid; gap: 12px; }
  tbody tr { display: grid; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: var(--sc-shadow); overflow: hidden; }
  tbody tr:nth-child(even) td, tbody tr:hover td, td { background: transparent; border: 0; }
  td { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 14px; }
  td::before { content: attr(data-label); color: var(--sc-muted); font-size: 12px; font-weight: 950; }
  td:first-child, td:last-child { border-radius: 0; }
  .line-row.operator-tone, .line-row.technician-tone, .line-row.admin-tone { border-left: 5px solid var(--sc-primary); }
  .line-row.operator-tone { border-left-color: var(--sc-danger); }
  .line-row.technician-tone { border-left-color: var(--sc-warning); }
  .action-group { justify-content: flex-end; }
  .icon-action { width: auto; min-width: 98px; gap: 7px; padding: 0 10px; }
  .icon-action span { display: inline; }
  .modal-backdrop { padding: 12px; }
  .modal-actions { flex-direction: column-reverse; }
}
</style>
