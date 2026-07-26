<template>
  <main class="pannes-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
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

    <section class="pannes-page">
      <header class="page-header">
        <div class="header-title">
          <span class="header-icon" aria-hidden="true">
            <Factory :size="26" stroke-width="2.4" />
          </span>
          <div>
            <span class="domain-badge">{{ content.badge }}</span>
            <h1>{{ content.title }}</h1>
            <p>{{ content.subtitle }}</p>
          </div>
        </div>
        <AdminTopControls v-model="filters.search" />
      </header>

      <section class="kpi-grid" :aria-label="content.metricsLabel">
        <article v-for="metric in metrics" :key="metric.label" class="kpi-card">
          <span class="kpi-icon" :class="metric.iconClass" aria-hidden="true">
            <component :is="metric.icon" :size="20" stroke-width="2.4" />
          </span>
          <div>
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
            <small>{{ metric.description }}</small>
          </div>
        </article>
      </section>

      <section class="filters-bar" :aria-label="content.filtersTitle">
        <label class="filter-field filter-field--search">
          <span>{{ content.filters.search }}</span>
          <div class="field-control">
            <Search :size="18" aria-hidden="true" />
            <input v-model="filters.search" type="search" :placeholder="content.searchPlaceholder" />
          </div>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.priority }}</span>
          <select v-model="filters.priority">
            <option value="">{{ content.allPriorities }}</option>
            <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.status }}</span>
          <select v-model="filters.status">
            <option value="">{{ content.allStatuses }}</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.line }}</span>
          <select v-model="filters.productionLine" :disabled="!productionLineOptions.length">
            <option value="">{{ content.allLines }}</option>
            <option v-for="option in productionLineOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.zone }}</span>
          <select v-model="filters.zone" :disabled="!zoneOptions.length">
            <option value="">{{ content.allZones }}</option>
            <option v-for="option in zoneOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.machine }}</span>
          <select v-model="filters.machine">
            <option value="">{{ content.allMachines }}</option>
            <option v-for="option in machineOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.technician }}</span>
          <select v-model="filters.technician" :disabled="!technicianOptions.length">
            <option value="">{{ content.allTechnicians }}</option>
            <option v-for="option in technicianOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ content.filters.date }}</span>
          <input v-model="filters.date" type="date" />
        </label>

        <label class="filter-field">
          <span>{{ content.filters.sort }}</span>
          <select v-model="sortKey">
            <option value="date_desc">{{ content.sort.dateDesc }}</option>
            <option value="priority_desc">{{ content.sort.priorityDesc }}</option>
            <option value="status_asc">{{ content.sort.statusAsc }}</option>
            <option value="machine_asc">{{ content.sort.machineAsc }}</option>
            <option value="downtime_desc">{{ content.sort.downtimeDesc }}</option>
          </select>
        </label>

        <button
          type="button"
          class="reset-button"
          :disabled="!hasActiveFilters"
          :aria-label="content.resetFilters"
          :title="content.resetFilters"
          @click="resetFilters"
        >
          <FilterX :size="18" aria-hidden="true" />
        </button>
      </section>

      <Transition name="drawer-fade">
        <div v-if="errorMessage || successMessage" :class="['feedback-banner', errorMessage ? 'error' : 'success']">
          {{ errorMessage || successMessage }}
        </div>
      </Transition>

      <section class="table-card" aria-labelledby="breakdowns-table-title">
        <div class="table-header">
          <div>
            <h2 id="breakdowns-table-title">{{ content.tableTitle }}</h2>
            <p>{{ content.tableSubtitle }}</p>
          </div>
          <div class="table-actions">
            <span class="results-pill">{{ filteredBreakdowns.length }} {{ content.results }}</span>
            <button type="button" class="primary-button" :disabled="isBusy" @click="openCreateModal">
              {{ content.actions.create }}
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="skeleton-list" aria-live="polite">
          <span v-for="item in 5" :key="item"></span>
        </div>

        <div v-else-if="!filteredBreakdowns.length" class="empty-state">
          <span class="empty-icon" aria-hidden="true">
            <AlertTriangle :size="34" stroke-width="2.1" />
          </span>
          <strong>{{ emptyStateTitle }}</strong>
          <p>{{ emptyStateDescription }}</p>
          <button type="button" class="secondary-button" @click="resetFilters">{{ content.resetFilters }}</button>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ content.columns.id }}</th>
                <th>{{ content.columns.machine }}</th>
                <th>{{ content.columns.line }}</th>
                <th>{{ content.columns.zone }}</th>
                <th>{{ content.columns.declaredAt }}</th>
                <th>{{ content.columns.technician }}</th>
                <th>{{ content.columns.downtime }}</th>
                <th>{{ content.columns.priority }}</th>
                <th>{{ content.columns.status }}</th>
                <th>{{ content.columns.actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="breakdown in filteredBreakdowns" :key="breakdown.id">
                <td>
                  <strong class="breakdown-id">{{ breakdown.id }}</strong>
                </td>
                <td>
                  <div class="machine-cell">
                    <strong>{{ breakdown.machineLabel }}</strong>
                    <small>{{ breakdown.descriptionLabel }}</small>
                  </div>
                </td>
                <td>{{ displayValue(breakdown.productionLine) }}</td>
                <td>{{ displayValue(breakdown.zone) }}</td>
                <td>
                  <span class="date-cell">
                    <CalendarDays :size="16" aria-hidden="true" />
                    {{ displayDate(breakdown.declarationDate) }}
                  </span>
                </td>
                <td>
                  <div class="technician-cell">
                    <span class="avatar" aria-hidden="true">{{ initials(breakdown.technician) }}</span>
                    <div>
                      <strong>{{ displayValue(breakdown.technician) }}</strong>
                      <small>{{ breakdown.technician ? content.assigned : content.unassigned }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="downtime-cell">
                    <Timer :size="16" aria-hidden="true" />
                    {{ displayValue(breakdown.downtime) }}
                  </span>
                </td>
                <td>
                  <span class="priority-pill" :class="breakdown.priorityTone">
                    {{ priorityLabel(breakdown.priority) }}
                  </span>
                </td>
                <td>
                  <span class="status-pill" :class="breakdown.statusTone">
                    <span aria-hidden="true"></span>
                    {{ statusLabel(breakdown.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      type="button"
                      :aria-label="`${content.actions.view} ${breakdown.id}`"
                      :title="content.actions.view"
                      @click="openDrawer(breakdown)"
                    >
                      <Eye :size="18" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      :aria-label="`${content.actions.edit} ${breakdown.id}`"
                      :title="content.actions.edit"
                      :disabled="isBusy"
                      @click="openEditModal(breakdown)"
                    >
                      <Pencil :size="18" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      class="danger-button"
                      :aria-label="`${content.actions.delete} ${breakdown.id}`"
                      :title="content.actions.delete"
                      :disabled="isBusy || deletingId === breakdown.rawId"
                      @click="confirmDelete(breakdown)"
                    >
                      <Trash2 :size="18" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredBreakdowns.length" class="mobile-list">
          <article v-for="breakdown in filteredBreakdowns" :key="`mobile-${breakdown.id}`" class="mobile-card">
            <div class="mobile-card-head">
              <div>
                <span>{{ breakdown.id }}</span>
                <strong>{{ breakdown.machineLabel }}</strong>
              </div>
              <button type="button" :aria-label="`${content.actions.view} ${breakdown.id}`" @click="openDrawer(breakdown)">
                <Eye :size="18" aria-hidden="true" />
              </button>
            </div>
            <p>{{ breakdown.descriptionLabel }}</p>
            <dl>
              <div>
                <dt>{{ content.columns.line }}</dt>
                <dd>{{ displayValue(breakdown.productionLine) }}</dd>
              </div>
              <div>
                <dt>{{ content.columns.zone }}</dt>
                <dd>{{ displayValue(breakdown.zone) }}</dd>
              </div>
              <div>
                <dt>{{ content.columns.technician }}</dt>
                <dd>{{ displayValue(breakdown.technician) }}</dd>
              </div>
              <div>
                <dt>{{ content.columns.downtime }}</dt>
                <dd>{{ displayValue(breakdown.downtime) }}</dd>
              </div>
            </dl>
            <div class="mobile-badges">
              <span class="priority-pill" :class="breakdown.priorityTone">{{ priorityLabel(breakdown.priority) }}</span>
              <span class="status-pill" :class="breakdown.statusTone">
                <span aria-hidden="true"></span>
                {{ statusLabel(breakdown.status) }}
              </span>
            </div>
            <div class="mobile-actions">
              <button type="button" :disabled="isBusy" @click="openEditModal(breakdown)">{{ content.actions.edit }}</button>
              <button type="button" class="danger-button" :disabled="isBusy || deletingId === breakdown.rawId" @click="confirmDelete(breakdown)">
                {{ content.actions.delete }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <Transition name="drawer-fade">
      <div v-if="selectedBreakdown" class="drawer-overlay" aria-hidden="true" @click="closeDrawer"></div>
    </Transition>

    <Transition name="drawer-slide">
      <aside v-if="selectedBreakdown" class="drawer" role="dialog" aria-modal="true" :aria-labelledby="drawerTitleId">
        <header class="drawer-header">
          <div>
            <span class="domain-badge">{{ selectedBreakdown.id }}</span>
            <h2 :id="drawerTitleId">{{ selectedBreakdown.machineLabel }}</h2>
            <p>{{ selectedBreakdown.descriptionLabel }}</p>
          </div>
          <button type="button" :aria-label="content.closeDrawer" :title="content.closeDrawer" @click="closeDrawer">
            <X :size="20" aria-hidden="true" />
          </button>
        </header>

        <div class="drawer-body">
          <section class="detail-card">
            <h3>
              <Activity :size="18" aria-hidden="true" />
              {{ content.drawer.info }}
            </h3>
            <div class="detail-grid">
              <div>
                <span>{{ content.columns.status }}</span>
                <strong>
                  <span class="status-pill" :class="selectedBreakdown.statusTone">
                    <span aria-hidden="true"></span>
                    {{ statusLabel(selectedBreakdown.status) }}
                  </span>
                </strong>
              </div>
              <div>
                <span>{{ content.columns.priority }}</span>
                <strong>
                  <span class="priority-pill" :class="selectedBreakdown.priorityTone">
                    {{ priorityLabel(selectedBreakdown.priority) }}
                  </span>
                </strong>
              </div>
              <div>
                <span>{{ content.columns.declaredAt }}</span>
                <strong>{{ displayDate(selectedBreakdown.declarationDate) }}</strong>
              </div>
              <div>
                <span>{{ content.columns.downtime }}</span>
                <strong>{{ displayValue(selectedBreakdown.downtime) }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <h3>
              <Factory :size="18" aria-hidden="true" />
              {{ content.drawer.asset }}
            </h3>
            <div class="detail-grid">
              <div>
                <span>{{ content.columns.machine }}</span>
                <strong>{{ selectedBreakdown.machineLabel }}</strong>
              </div>
              <div>
                <span>{{ content.columns.line }}</span>
                <strong>{{ displayValue(selectedBreakdown.productionLine) }}</strong>
              </div>
              <div>
                <span>{{ content.columns.zone }}</span>
                <strong>{{ displayValue(selectedBreakdown.zone) }}</strong>
              </div>
              <div>
                <span>{{ content.columns.technician }}</span>
                <strong>{{ displayValue(selectedBreakdown.technician) }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <h3>
              <History :size="18" aria-hidden="true" />
              {{ content.drawer.history }}
            </h3>
            <ol v-if="incidentHistory.length" class="history-list">
              <li v-for="event in incidentHistory" :key="`${event.date}-${event.title}`">
                <span aria-hidden="true"></span>
                <div>
                  <strong>{{ event.title }}</strong>
                  <p>{{ event.description }}</p>
                  <small>{{ displayDate(event.date) }} - {{ displayValue(event.author) }}</small>
                </div>
              </li>
            </ol>
            <p v-else class="empty-history">{{ content.drawer.emptyHistory }}</p>
          </section>
        </div>
      </aside>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="isFormOpen" class="modal-backdrop" role="presentation" @click.self="closeFormModal">
        <section class="breakdown-modal" role="dialog" aria-modal="true" :aria-label="formTitle">
          <header>
            <div>
              <p>{{ content.form.eyebrow }}</p>
              <h2>{{ formTitle }}</h2>
            </div>
            <button type="button" class="modal-close" :aria-label="content.closeDrawer" @click="closeFormModal">x</button>
          </header>

          <form class="breakdown-form" @submit.prevent="saveBreakdown">
            <label>
              <span>{{ content.form.code }}</span>
              <input v-model.trim="form.code" required />
            </label>

            <label>
              <span>{{ content.form.equipmentId }}</span>
              <input v-model.number="form.equipment_id" type="number" min="1" required />
            </label>

            <label>
              <span>{{ content.form.severity }}</span>
              <select v-model="form.severity">
                <option value="low">{{ content.form.severities.low }}</option>
                <option value="medium">{{ content.form.severities.medium }}</option>
                <option value="high">{{ content.form.severities.high }}</option>
                <option value="critical">{{ content.form.severities.critical }}</option>
              </select>
            </label>

            <label>
              <span>{{ content.form.status }}</span>
              <select v-model="form.status">
                <option value="reported">{{ content.form.statuses.reported }}</option>
                <option value="in_progress">{{ content.form.statuses.in_progress }}</option>
                <option value="resolved">{{ content.form.statuses.resolved }}</option>
                <option value="cancelled">{{ content.form.statuses.cancelled }}</option>
              </select>
            </label>

            <label>
              <span>{{ content.form.reportedBy }}</span>
              <input v-model.number="form.reported_by" type="number" min="1" />
            </label>

            <label>
              <span>{{ content.form.assignedTo }}</span>
              <input v-model.number="form.assigned_to" type="number" min="1" />
            </label>

            <label>
              <span>{{ content.form.reportedAt }}</span>
              <input v-model="form.reported_at" type="datetime-local" />
            </label>

            <label>
              <span>{{ content.form.resolvedAt }}</span>
              <input v-model="form.resolved_at" type="datetime-local" />
            </label>

            <label>
              <span>{{ content.form.downtime }}</span>
              <input v-model.number="form.downtime_minutes" type="number" min="0" />
            </label>

            <label class="wide">
              <span>{{ content.form.description }}</span>
              <textarea v-model.trim="form.description" required rows="4"></textarea>
            </label>

            <div class="modal-actions">
              <button type="button" class="secondary-button" :disabled="isSaving" @click="closeFormModal">
                {{ content.form.cancel }}
              </button>
              <button type="submit" class="primary-button" :disabled="isSaving">
                {{ isSaving ? content.form.saving : content.form.save }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Clock3,
  Eye,
  Factory,
  FilterX,
  History,
  Pencil,
  Search,
  Timer,
  Trash2,
  Wrench,
  X,
} from '@lucide/vue'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import Sidebar from '@/Components/sidebar.vue'
import { createBreakdown, deleteBreakdown, getBreakdowns, getBreakdownStats, updateBreakdown } from '@/services/breakdownsService'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const isSidebarOpen = ref(false)
const isLoading = ref(false)
const breakdowns = ref([])
const breakdownStats = ref({
  total: 0,
  active: 0,
  resolved: 0,
  critical: 0,
  average_downtime_minutes: 0,
})
const errorMessage = ref('')
const successMessage = ref('')
const selectedBreakdown = ref(null)
const editingBreakdown = ref(null)
const isFormOpen = ref(false)
const isSaving = ref(false)
const deletingId = ref(null)
const sortKey = ref('date_desc')
const drawerTitleId = 'breakdown-detail-title'

const emptyForm = {
  code: '',
  equipment_id: '',
  description: '',
  severity: 'medium',
  status: 'reported',
  reported_by: '',
  assigned_to: '',
  reported_at: '',
  resolved_at: '',
  downtime_minutes: 0,
}

const form = reactive({ ...emptyForm })

const filters = reactive({
  search: '',
  priority: '',
  status: '',
  productionLine: '',
  zone: '',
  machine: '',
  technician: '',
  date: '',
})

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    badge: 'Maintenance corrective',
    title: 'Gestion des Pannes',
    subtitle: "Pilotez les incidents machines, les priorites et les impacts de production dans une vue CMMS compacte.",
    searchPlaceholder: 'Rechercher panne, machine, ligne, zone...',
    tableTitle: 'Incidents de production',
    tableSubtitle: 'Vue operationnelle des pannes, affectations, durees d arret et etat de traitement.',
    results: 'pannes',
    metricsLabel: 'Indicateurs pannes',
    filtersTitle: 'Filtres avances des pannes',
    allPriorities: 'Toutes priorites',
    allStatuses: 'Tous statuts',
    allLines: 'Toutes lignes',
    allZones: 'Toutes zones',
    allMachines: 'Toutes machines',
    allTechnicians: 'Tous techniciens',
    resetFilters: 'Reinitialiser les filtres',
    closeDrawer: 'Fermer la fiche panne',
    assigned: 'Technicien affecte',
    unassigned: 'A affecter',
    emptyTitle: 'Aucune panne enregistrée',
    noResultsTitle: 'Aucune panne ne correspond aux filtres',
    emptyDescription: 'Aucune panne reelle n est disponible dans la base de donnees.',
    filteredEmptyDescription: 'Ajustez les filtres pour retrouver les pannes enregistrees.',
    loadError: 'Impossible de charger les pannes.',
    createSuccess: 'Panne creee avec succes.',
    updateSuccess: 'Panne modifiee avec succes.',
    deleteSuccess: 'Panne supprimee avec succes.',
    deleteConfirm: (code) => `Supprimer la panne ${code} ?`,
    metrics: {
      active: ['Pannes actives', 'Incidents en traitement'],
      critical: ['Critiques', 'Priorite immediate'],
      resolved: ['Resolues', 'Incidents clotures'],
      downtime: ['Arret moyen', 'Impact production'],
    },
    filters: {
      search: 'Recherche',
      priority: 'Priorite',
      status: 'Statut',
      line: 'Ligne',
      zone: 'Zone',
      machine: 'Machine',
      technician: 'Technicien',
      date: 'Date',
      sort: 'Tri',
    },
    sort: {
      dateDesc: 'Date recente',
      priorityDesc: 'Priorite haute',
      statusAsc: 'Statut',
      machineAsc: 'Machine A-Z',
      downtimeDesc: 'Arret le plus long',
    },
    columns: {
      id: 'ID',
      machine: 'Machine',
      line: 'Ligne',
      zone: 'Zone',
      declaredAt: 'Declaration',
      technician: 'Technicien',
      downtime: 'Arret',
      priority: 'Priorite',
      status: 'Statut',
      actions: 'Actions',
    },
    actions: {
      create: 'Ajouter une panne',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
    },
    priorities: {
      CRITICAL: 'Critique',
      WARNING: 'Haute',
      ATTENTION: 'Moyenne',
      LOW: 'Faible',
    },
    statuses: {
      'En cours': 'En cours',
      'Resolue': 'Resolue',
      'Résolu': 'Resolue',
      Resolu: 'Resolue',
      Ouverte: 'Ouverte',
      Planifiee: 'Planifiee',
    },
    drawer: {
      info: 'Synthese incident',
      asset: 'Actif impacte',
      history: 'Historique complet',
      emptyHistory: "Aucun historique detaille n'est disponible pour cette panne.",
    },
    form: {
      eyebrow: 'Gestion des pannes',
      createTitle: 'Ajouter une panne',
      editTitle: 'Modifier la panne',
      code: 'Code panne',
      equipmentId: 'ID machine',
      severity: 'Priorite',
      status: 'Statut',
      reportedBy: 'ID declarant',
      assignedTo: 'ID technicien',
      reportedAt: 'Date declaration',
      resolvedAt: 'Date resolution',
      downtime: 'Arret en minutes',
      description: 'Description',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      severities: { low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' },
      statuses: { reported: 'Declaree', in_progress: 'En cours', resolved: 'Resolue', cancelled: 'Annulee' },
    },
  },
  EN: {
    sidebarToggle: 'Show menu',
    badge: 'Corrective maintenance',
    title: 'Breakdown Management',
    subtitle: 'Control machine incidents, priorities, and production impact in a compact CMMS workspace.',
    searchPlaceholder: 'Search breakdown, machine, line, zone...',
    tableTitle: 'Production incidents',
    tableSubtitle: 'Operational view of breakdowns, assignments, downtime, and processing status.',
    results: 'breakdowns',
    metricsLabel: 'Breakdown indicators',
    filtersTitle: 'Advanced breakdown filters',
    allPriorities: 'All priorities',
    allStatuses: 'All statuses',
    allLines: 'All lines',
    allZones: 'All zones',
    allMachines: 'All machines',
    allTechnicians: 'All technicians',
    resetFilters: 'Reset filters',
    closeDrawer: 'Close breakdown sheet',
    assigned: 'Assigned technician',
    unassigned: 'Needs assignment',
    emptyTitle: 'No breakdown recorded',
    noResultsTitle: 'No breakdown matches the filters',
    emptyDescription: 'No real breakdown is available in the database.',
    filteredEmptyDescription: 'Adjust filters to find recorded breakdowns.',
    loadError: 'Unable to load breakdowns.',
    createSuccess: 'Breakdown created successfully.',
    updateSuccess: 'Breakdown updated successfully.',
    deleteSuccess: 'Breakdown deleted successfully.',
    deleteConfirm: (code) => `Delete breakdown ${code}?`,
    metrics: {
      active: ['Active breakdowns', 'Incidents in progress'],
      critical: ['Critical', 'Immediate priority'],
      resolved: ['Resolved', 'Closed incidents'],
      downtime: ['Average downtime', 'Production impact'],
    },
    filters: {
      search: 'Search',
      priority: 'Priority',
      status: 'Status',
      line: 'Line',
      zone: 'Zone',
      machine: 'Machine',
      technician: 'Technician',
      date: 'Date',
      sort: 'Sort',
    },
    sort: {
      dateDesc: 'Newest date',
      priorityDesc: 'Highest priority',
      statusAsc: 'Status',
      machineAsc: 'Machine A-Z',
      downtimeDesc: 'Longest downtime',
    },
    columns: {
      id: 'ID',
      machine: 'Machine',
      line: 'Line',
      zone: 'Zone',
      declaredAt: 'Declared',
      technician: 'Technician',
      downtime: 'Downtime',
      priority: 'Priority',
      status: 'Status',
      actions: 'Actions',
    },
    actions: {
      create: 'Add breakdown',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
    },
    priorities: {
      CRITICAL: 'Critical',
      WARNING: 'High',
      ATTENTION: 'Medium',
      LOW: 'Low',
    },
    statuses: {
      'En cours': 'In progress',
      'Resolue': 'Resolved',
      'Résolu': 'Resolved',
      Resolu: 'Resolved',
      Ouverte: 'Open',
      Planifiee: 'Planned',
    },
    drawer: {
      info: 'Incident summary',
      asset: 'Impacted asset',
      history: 'Complete history',
      emptyHistory: 'No detailed history is available for this breakdown.',
    },
    form: {
      eyebrow: 'Breakdown management',
      createTitle: 'Add breakdown',
      editTitle: 'Edit breakdown',
      code: 'Breakdown code',
      equipmentId: 'Machine ID',
      severity: 'Priority',
      status: 'Status',
      reportedBy: 'Reporter ID',
      assignedTo: 'Technician ID',
      reportedAt: 'Declaration date',
      resolvedAt: 'Resolution date',
      downtime: 'Downtime in minutes',
      description: 'Description',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      severities: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' },
      statuses: { reported: 'Reported', in_progress: 'In progress', resolved: 'Resolved', cancelled: 'Cancelled' },
    },
  },
  AR: {
    sidebarToggle: 'Show menu',
    badge: 'Maintenance corrective',
    title: 'Gestion des Pannes',
    subtitle: "Pilotez les incidents machines, les priorites et les impacts de production dans une vue CMMS compacte.",
    searchPlaceholder: 'Rechercher panne, machine, ligne, zone...',
    tableTitle: 'Incidents de production',
    tableSubtitle: 'Vue operationnelle des pannes, affectations, durees d arret et etat de traitement.',
    results: 'pannes',
    metricsLabel: 'Indicateurs pannes',
    filtersTitle: 'Filtres avances des pannes',
    allPriorities: 'Toutes priorites',
    allStatuses: 'Tous statuts',
    allLines: 'Toutes lignes',
    allZones: 'Toutes zones',
    allMachines: 'Toutes machines',
    allTechnicians: 'Tous techniciens',
    resetFilters: 'Reinitialiser les filtres',
    closeDrawer: 'Fermer la fiche panne',
    assigned: 'Technicien affecte',
    unassigned: 'A affecter',
    emptyTitle: 'Aucune panne enregistrée',
    noResultsTitle: 'Aucune panne ne correspond aux filtres',
    emptyDescription: 'Aucune panne reelle n est disponible dans la base de donnees.',
    filteredEmptyDescription: 'Ajustez les filtres pour retrouver les pannes enregistrees.',
    loadError: 'Impossible de charger les pannes.',
    createSuccess: 'Panne creee avec succes.',
    updateSuccess: 'Panne modifiee avec succes.',
    deleteSuccess: 'Panne supprimee avec succes.',
    deleteConfirm: (code) => `Supprimer la panne ${code} ?`,
    metrics: {
      active: ['Pannes actives', 'Incidents en traitement'],
      critical: ['Critiques', 'Priorite immediate'],
      resolved: ['Resolues', 'Incidents clotures'],
      downtime: ['Arret moyen', 'Impact production'],
    },
    filters: {
      search: 'Recherche',
      priority: 'Priorite',
      status: 'Statut',
      line: 'Ligne',
      zone: 'Zone',
      machine: 'Machine',
      technician: 'Technicien',
      date: 'Date',
      sort: 'Tri',
    },
    sort: {
      dateDesc: 'Date recente',
      priorityDesc: 'Priorite haute',
      statusAsc: 'Statut',
      machineAsc: 'Machine A-Z',
      downtimeDesc: 'Arret le plus long',
    },
    columns: {
      id: 'ID',
      machine: 'Machine',
      line: 'Ligne',
      zone: 'Zone',
      declaredAt: 'Declaration',
      technician: 'Technicien',
      downtime: 'Arret',
      priority: 'Priorite',
      status: 'Statut',
      actions: 'Actions',
    },
    actions: {
      create: 'Ajouter une panne',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
    },
    priorities: {
      CRITICAL: 'Critique',
      WARNING: 'Haute',
      ATTENTION: 'Moyenne',
      LOW: 'Faible',
    },
    statuses: {
      'En cours': 'En cours',
      'Resolue': 'Resolue',
      'Résolu': 'Resolue',
      Resolu: 'Resolue',
      Ouverte: 'Ouverte',
      Planifiee: 'Planifiee',
    },
    drawer: {
      info: 'Synthese incident',
      asset: 'Actif impacte',
      history: 'Historique complet',
      emptyHistory: "Aucun historique detaille n'est disponible pour cette panne.",
    },
    form: {
      eyebrow: 'Gestion des pannes',
      createTitle: 'Ajouter une panne',
      editTitle: 'Modifier la panne',
      code: 'Code panne',
      equipmentId: 'ID machine',
      severity: 'Priorite',
      status: 'Statut',
      reportedBy: 'ID declarant',
      assignedTo: 'ID technicien',
      reportedAt: 'Date declaration',
      resolvedAt: 'Date resolution',
      downtime: 'Arret en minutes',
      description: 'Description',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      severities: { low: 'Faible', medium: 'Moyenne', high: 'Haute', critical: 'Critique' },
      statuses: { reported: 'Declaree', in_progress: 'En cours', resolved: 'Resolue', cancelled: 'Annulee' },
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const normalizedBreakdowns = computed(() => breakdowns.value.map(normalizeBreakdown))
const emptyStateTitle = computed(() => (normalizedBreakdowns.value.length ? content.value.noResultsTitle : content.value.emptyTitle))
const emptyStateDescription = computed(() =>
  normalizedBreakdowns.value.length ? content.value.filteredEmptyDescription : content.value.emptyDescription,
)
const formTitle = computed(() => (editingBreakdown.value ? content.value.form.editTitle : content.value.form.createTitle))
const isBusy = computed(() => isLoading.value || isSaving.value || deletingId.value !== null)

const priorityOptions = computed(() =>
  uniqueValues(normalizedBreakdowns.value.map((item) => item.priority)).map((value) => ({
    value,
    label: priorityLabel(value),
  })),
)

const statusOptions = computed(() =>
  uniqueValues(normalizedBreakdowns.value.map((item) => item.status)).map((value) => ({
    value,
    label: statusLabel(value),
  })),
)

const productionLineOptions = computed(() => uniqueValues(normalizedBreakdowns.value.map((item) => item.productionLine)))
const zoneOptions = computed(() => uniqueValues(normalizedBreakdowns.value.map((item) => item.zone)))
const machineOptions = computed(() => uniqueValues(normalizedBreakdowns.value.map((item) => item.machineLabel)))
const technicianOptions = computed(() => uniqueValues(normalizedBreakdowns.value.map((item) => item.technician)))

const hasActiveFilters = computed(() => Object.values(filters).some((value) => String(value || '').trim()))

const filteredBreakdowns = computed(() => {
  const query = filters.search.trim().toLowerCase()

  return [...normalizedBreakdowns.value]
    .filter((breakdown) => {
      const matchesSearch =
        !query ||
        [
          breakdown.id,
          breakdown.machineLabel,
          breakdown.descriptionLabel,
          breakdown.priority,
          priorityLabel(breakdown.priority),
          breakdown.status,
          statusLabel(breakdown.status),
          breakdown.productionLine,
          breakdown.zone,
          breakdown.technician,
        ].some((value) => String(value || '').toLowerCase().includes(query))

      return (
        matchesSearch &&
        (!filters.priority || breakdown.priority === filters.priority) &&
        (!filters.status || breakdown.status === filters.status) &&
        (!filters.productionLine || breakdown.productionLine === filters.productionLine) &&
        (!filters.zone || breakdown.zone === filters.zone) &&
        (!filters.machine || breakdown.machineLabel === filters.machine) &&
        (!filters.technician || breakdown.technician === filters.technician) &&
        (!filters.date || normalizeDateKey(breakdown.declarationDate) === filters.date)
      )
    })
    .sort(sortBreakdowns)
})

const metrics = computed(() => [
  {
    label: content.value.metrics.active[0],
    description: content.value.metrics.active[1],
    value: breakdownStats.value.active || 0,
    icon: Wrench,
    iconClass: 'kpi-icon--red',
  },
  {
    label: content.value.metrics.critical[0],
    description: content.value.metrics.critical[1],
    value: breakdownStats.value.critical || 0,
    icon: AlertTriangle,
    iconClass: 'kpi-icon--yellow',
  },
  {
    label: content.value.metrics.resolved[0],
    description: content.value.metrics.resolved[1],
    value: breakdownStats.value.resolved || 0,
    icon: Activity,
    iconClass: '',
  },
  {
    label: content.value.metrics.downtime[0],
    description: content.value.metrics.downtime[1],
    value: formatDuration(breakdownStats.value.average_downtime_minutes || 0),
    icon: Clock3,
    iconClass: 'kpi-icon--orange',
  },
])

const incidentHistory = computed(() => {
  if (!selectedBreakdown.value || !Array.isArray(selectedBreakdown.value.history)) return []
  return selectedBreakdown.value.history
})

onMounted(() => {
  loadBreakdowns()
})

async function loadBreakdowns() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [breakdownsResult, statsResult] = await Promise.all([
      getBreakdowns(),
      getBreakdownStats(),
    ])

    breakdowns.value = breakdownsResult
    breakdownStats.value = {
      total: Number(statsResult.total || 0),
      active: Number(statsResult.active || 0),
      resolved: Number(statsResult.resolved || 0),
      critical: Number(statsResult.critical || 0),
      average_downtime_minutes: Number(statsResult.average_downtime_minutes || 0),
    }
  } catch (error) {
    breakdowns.value = []
    breakdownStats.value = {
      total: 0,
      active: 0,
      resolved: 0,
      critical: 0,
      average_downtime_minutes: 0,
    }
    errorMessage.value = error.message || content.value.loadError
  } finally {
    isLoading.value = false
  }
}

function normalizeBreakdown(breakdown) {
  const equipment = breakdown.equipment || breakdown.machine || {}
  const machine = equipment?.code
    ? `${equipment.code} - ${equipment.name || ''}`.trim()
    : equipment?.name || breakdown.equipment_name || breakdown.machine_name || breakdown.machine || ''
  const description = breakdown.description || breakdown.title || breakdown.issue || ''
  const priority = normalizePriority(breakdown.priority || breakdown.severity)
  const status = normalizeStatus(breakdown.status)

  return {
    ...breakdown,
    rawId: breakdown.id,
    id: breakdown.code || breakdown.id,
    machine,
    machineLabel: breakdownMachineLabel(machine),
    descriptionLabel: breakdownDescriptionLabel(description),
    priority,
    priorityTone: priority.toLowerCase(),
    status,
    statusTone: breakdown.statusTone || statusTone(status),
    equipmentId: breakdown.equipment_id || equipment?.id || '',
    rawCode: breakdown.code || '',
    rawSeverity: breakdown.severity || breakdown.priority || 'medium',
    rawStatus: breakdown.status || 'reported',
    reportedById: breakdown.reported_by?.id || breakdown.reported_by_id || '',
    assignedToId: breakdown.assigned_to?.id || breakdown.assigned_to_id || '',
    productionLine:
      breakdown.production_line?.name ||
      breakdown.productionLine?.name ||
      breakdown.production_line_name ||
      breakdown.productionLine ||
      breakdown.line ||
      '',
    zone: breakdown.zone?.name || breakdown.production_zone?.name || breakdown.production_zone_name || breakdown.zone_name || breakdown.productionZone || '',
    declarationDate: breakdown.reported_at || breakdown.declaration_date || breakdown.declared_at || breakdown.created_at || breakdown.date || '',
    technician:
      formatPerson(breakdown.technician) ||
      formatPerson(breakdown.assigned_technician) ||
      formatPerson(breakdown.assignedTechnician) ||
      formatPerson(breakdown.assigned_to) ||
      '',
    downtime: breakdown.downtime || breakdown.downtime_duration || breakdown.duration || breakdown.stop_duration || formatDuration(breakdown.downtime_minutes || 0),
    downtimeMinutes: Number(breakdown.downtime_minutes || 0),
    resolvedAt: breakdown.resolved_at || '',
    history: Array.isArray(breakdown.history) ? breakdown.history : [],
  }
}

function priorityLabel(priority) {
  return content.value.priorities[priority] || priority || '-'
}

function statusLabel(status) {
  return content.value.statuses[status] || status || '-'
}

function breakdownMachineLabel(machine) {
  return machine || '-'
}

function breakdownDescriptionLabel(description) {
  return description || '-'
}

function normalizePriority(value) {
  const normalized = String(value || '').trim().toUpperCase()
  if (['CRITICAL', 'CRITIQUE', 'URGENT'].includes(normalized)) return 'CRITICAL'
  if (['HIGH', 'WARNING', 'HAUTE'].includes(normalized)) return 'WARNING'
  if (['MEDIUM', 'ATTENTION', 'MOYENNE'].includes(normalized)) return 'ATTENTION'
  if (['LOW', 'FAIBLE'].includes(normalized)) return 'LOW'
  return normalized || 'ATTENTION'
}

function normalizeStatus(value) {
  const normalized = String(value || '').trim()
  const withoutAccent = normalized
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

  if (['reported', 'declaree', 'declare', 'ouverte', 'ouvert', 'open'].includes(withoutAccent)) return 'Ouverte'
  if (['in_progress', 'en cours', 'processing'].includes(withoutAccent)) return 'En cours'
  if (['resolu', 'resolue', 'resolved', 'cloture', 'cloturee'].includes(withoutAccent)) return 'Resolu'
  if (['planifiee', 'planifie', 'planned'].includes(withoutAccent)) return 'Planifiee'
  return normalized || 'En cours'
}

function statusTone(status) {
  const key = normalizeStatus(status)
  if (key === 'Resolu') return 'resolved'
  if (key === 'Planifiee') return 'planned'
  if (key === 'Ouverte') return 'open'
  return 'in-progress'
}

function formatPerson(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return [value.first_name, value.last_name].filter(Boolean).join(' ') || value.name || value.full_name || ''
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

function displayValue(value) {
  return value || '-'
}

function displayDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(language.value === 'EN' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function normalizeDateKey(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function initials(value) {
  if (!value) return '-'
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function parseDowntime(value) {
  if (!value) return 0
  if (typeof value === 'number') return value

  const text = String(value).toLowerCase()
  const hours = Number(text.match(/(\d+(?:[.,]\d+)?)\s*h/)?.[1]?.replace(',', '.') || 0)
  const minutes = Number(text.match(/(\d+(?:[.,]\d+)?)\s*m/)?.[1]?.replace(',', '.') || 0)
  return hours * 60 + minutes
}

function formatDuration(minutes) {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  if (!hours) return `${rest} min`
  if (!rest) return `${hours} h`
  return `${hours} h ${rest}`
}

function priorityWeight(priority) {
  return {
    CRITICAL: 4,
    WARNING: 3,
    ATTENTION: 2,
    LOW: 1,
  }[priority] || 0
}

function sortBreakdowns(a, b) {
  if (sortKey.value === 'priority_desc') return priorityWeight(b.priority) - priorityWeight(a.priority)
  if (sortKey.value === 'status_asc') return statusLabel(a.status).localeCompare(statusLabel(b.status))
  if (sortKey.value === 'machine_asc') return a.machineLabel.localeCompare(b.machineLabel)
  if (sortKey.value === 'downtime_desc') return parseDowntime(b.downtime) - parseDowntime(a.downtime)

  return new Date(b.declarationDate || 0).getTime() - new Date(a.declarationDate || 0).getTime()
}

function resetFilters() {
  Object.assign(filters, {
    search: '',
    priority: '',
    status: '',
    productionLine: '',
    zone: '',
    machine: '',
    technician: '',
    date: '',
  })
}

function openCreateModal() {
  editingBreakdown.value = null
  Object.assign(form, { ...emptyForm })
  errorMessage.value = ''
  successMessage.value = ''
  isFormOpen.value = true
}

function openEditModal(breakdown) {
  editingBreakdown.value = breakdown
  Object.assign(form, {
    code: breakdown.rawCode || breakdown.id || '',
    equipment_id: breakdown.equipmentId || '',
    description: breakdown.description || '',
    severity: normalizeFormSeverity(breakdown.rawSeverity),
    status: normalizeFormStatus(breakdown.rawStatus),
    reported_by: breakdown.reportedById || '',
    assigned_to: breakdown.assignedToId || '',
    reported_at: toDateTimeLocal(breakdown.declarationDate),
    resolved_at: toDateTimeLocal(breakdown.resolvedAt),
    downtime_minutes: Number(breakdown.downtimeMinutes || 0),
  })
  errorMessage.value = ''
  successMessage.value = ''
  closeDrawer()
  isFormOpen.value = true
}

function closeFormModal() {
  isFormOpen.value = false
  editingBreakdown.value = null
  Object.assign(form, { ...emptyForm })
}

async function saveBreakdown() {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = buildBreakdownPayload()

    if (editingBreakdown.value) {
      await updateBreakdown(editingBreakdown.value.rawId, payload)
      successMessage.value = content.value.updateSuccess
    } else {
      await createBreakdown(payload)
      successMessage.value = content.value.createSuccess
    }

    closeFormModal()
    await loadBreakdowns()
  } catch (error) {
    errorMessage.value = error.message || content.value.loadError
  } finally {
    isSaving.value = false
  }
}

async function confirmDelete(breakdown) {
  if (!window.confirm(content.value.deleteConfirm(breakdown.id))) return

  deletingId.value = breakdown.rawId
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteBreakdown(breakdown.rawId)
    successMessage.value = content.value.deleteSuccess
    if (selectedBreakdown.value?.rawId === breakdown.rawId) closeDrawer()
    await loadBreakdowns()
  } catch (error) {
    errorMessage.value = error.message || content.value.loadError
  } finally {
    deletingId.value = null
  }
}

function buildBreakdownPayload() {
  return {
    code: form.code,
    equipment_id: form.equipment_id,
    description: form.description,
    severity: form.severity,
    status: form.status,
    reported_by: optionalId(form.reported_by),
    assigned_to: optionalId(form.assigned_to),
    reported_at: fromDateTimeLocal(form.reported_at),
    resolved_at: fromDateTimeLocal(form.resolved_at),
    downtime_minutes: Number(form.downtime_minutes || 0),
  }
}

function optionalId(value) {
  return value ? Number(value) : null
}

function normalizeFormSeverity(value) {
  const normalized = String(value || 'medium').toLowerCase()
  if (['low', 'medium', 'high', 'critical'].includes(normalized)) return normalized
  if (normalized === 'warning' || normalized === 'haute') return 'high'
  if (normalized === 'attention' || normalized === 'moyenne') return 'medium'
  if (normalized === 'critique') return 'critical'
  return 'medium'
}

function normalizeFormStatus(value) {
  const normalized = String(value || 'reported')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

  if (['reported', 'declaree', 'declare', 'ouverte', 'ouvert', 'open'].includes(normalized)) return 'reported'
  if (['in_progress', 'en cours', 'processing'].includes(normalized)) return 'in_progress'
  if (['resolved', 'resolu', 'resolue', 'cloture', 'cloturee'].includes(normalized)) return 'resolved'
  if (['cancelled', 'canceled', 'annulee', 'annule'].includes(normalized)) return 'cancelled'
  return 'reported'
}

function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromDateTimeLocal(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function openDrawer(breakdown) {
  selectedBreakdown.value = breakdown
}

function closeDrawer() {
  selectedBreakdown.value = null
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.pannes-layout {
  min-height: 100vh;
  background: var(--sc-bg);
  color: var(--sc-dark);
}

.pannes-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 28px 28px 38px 88px;
}

.pannes-page *,
.pannes-page *::before,
.pannes-page *::after {
  box-sizing: border-box;
}

[dir='rtl'] .pannes-page {
  padding-right: 88px;
  padding-left: 28px;
}

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 18px;
  animation: panne-rise 0.42s ease both;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.header-icon {
  width: 58px;
  height: 58px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  color: var(--sc-primary);
  box-shadow: var(--sc-shadow);
}

.domain-badge,
.results-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  border-radius: 999px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  padding: 0 12px;
  font-size: 12px;
  font-weight: 950;
}

.page-header h1 {
  margin: 10px 0 0;
  color: var(--sc-dark);
  font-size: clamp(30px, 3.2vw, 40px);
  font-weight: 950;
  line-height: 1.05;
  letter-spacing: 0;
}

.page-header p {
  max-width: 760px;
  margin: 10px 0 0;
  color: var(--sc-muted);
  font-size: 15px;
  font-weight: 800;
}

.pannes-page :deep(.admin-top-controls) {
  max-width: 100%;
  min-width: 0;
  justify-content: flex-end;
}

.pannes-page :deep(.notification-control),
.pannes-page :deep(.date-control),
.pannes-page :deep(.time-control),
.pannes-page :deep(.live-control),
.pannes-page :deep(.language-button) {
  min-height: 44px;
  border-radius: 14px;
}

.pannes-page :deep(.date-control) {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pannes-page :deep(.search-control) {
  display: none;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-width: 0;
  min-height: 88px;
  overflow: hidden;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  padding: 14px;
  animation: panne-rise 0.48s ease both;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.kpi-card:nth-child(2) {
  animation-delay: 0.04s;
}

.kpi-card:nth-child(3) {
  animation-delay: 0.08s;
}

.kpi-card:nth-child(4) {
  animation-delay: 0.12s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(106, 154, 42, 0.28);
  box-shadow: 0 16px 38px rgba(74, 10, 10, 0.09);
}

.kpi-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.kpi-icon--red {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.kpi-icon--yellow {
  background: var(--sc-soft-attention);
  color: #ad7a00;
}

.kpi-icon--orange {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.kpi-card strong,
.kpi-card span,
.kpi-card small {
  display: block;
  min-width: 0;
}

.kpi-card strong {
  color: var(--sc-dark);
  font-size: 24px;
  font-weight: 950;
  line-height: 1;
}

.kpi-card span {
  margin-top: 5px;
  color: var(--sc-dark);
  font-size: 12px;
  font-weight: 950;
  line-height: 1.2;
}

.kpi-card small {
  margin-top: 4px;
  color: var(--sc-muted);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.25;
}

.filters-bar {
  display: grid;
  grid-template-columns: minmax(240px, 1.6fr) repeat(4, minmax(130px, 1fr)) 46px;
  gap: 12px;
  align-items: end;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  padding: 14px;
  margin-bottom: 18px;
}

.filter-field {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.filter-field--search {
  grid-column: span 2;
}

.filter-field span {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
}

.field-control {
  position: relative;
}

.field-control svg {
  position: absolute;
  top: 50%;
  left: 14px;
  color: var(--sc-muted);
  transform: translateY(-50%);
}

[dir='rtl'] .field-control svg {
  right: 14px;
  left: auto;
}

.filter-field input,
.filter-field select {
  width: 100%;
  height: 44px;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 850;
  outline: none;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.field-control input {
  padding-left: 42px;
}

[dir='rtl'] .field-control input {
  padding-right: 42px;
  padding-left: 12px;
}

.filter-field input:focus,
.filter-field select:focus,
.action-buttons button:focus-visible,
.reset-button:focus-visible,
.drawer button:focus-visible {
  border-color: rgba(106, 154, 42, 0.42);
  box-shadow: 0 0 0 4px var(--sc-soft-primary);
}

.filter-field select:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.reset-button,
.primary-button,
.secondary-button,
.action-buttons button,
.drawer-header button,
.mobile-card-head button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  color: var(--sc-primary);
  cursor: pointer;
  transition:
    transform 0.16s ease,
    background-color 0.16s ease,
    border-color 0.16s ease;
}

.primary-button {
  min-height: 42px;
  border-color: var(--sc-primary);
  background: var(--sc-primary);
  color: var(--sc-surface);
  padding: 0 15px;
  font-size: 13px;
  font-weight: 950;
  white-space: nowrap;
}

.primary-button:hover {
  border-color: var(--sc-primary);
  background: var(--sc-primary);
  box-shadow: 0 12px 24px rgba(106, 154, 42, 0.18);
}

.primary-button:disabled,
.secondary-button:disabled,
.action-buttons button:disabled {
  opacity: 0.55;
  cursor: wait;
  transform: none;
}

.reset-button {
  width: 46px;
  height: 44px;
}

.reset-button:hover,
.secondary-button:hover,
.action-buttons button:hover,
.drawer-header button:hover,
.mobile-card-head button:hover {
  transform: translateY(-1px);
  border-color: rgba(106, 154, 42, 0.3);
  background: var(--sc-soft-primary);
}

.reset-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.table-card {
  overflow: hidden;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  animation: panne-rise 0.54s ease 0.08s both;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--sc-border);
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.table-header h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 20px;
  font-weight: 950;
}

.feedback-banner {
  min-height: 44px;
  display: flex;
  align-items: center;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 900;
}

.feedback-banner.error {
  border-color: rgba(227, 30, 36, 0.24);
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.feedback-banner.success {
  border-color: rgba(106, 154, 42, 0.26);
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.table-header p {
  margin: 6px 0 0;
  color: var(--sc-muted);
  font-size: 13px;
  font-weight: 800;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1180px;
  border-collapse: separate;
  border-spacing: 0 8px;
  padding: 8px 10px 10px;
}

th,
td {
  padding: 14px 12px;
  text-align: left;
  vertical-align: middle;
}

[dir='rtl'] th,
[dir='rtl'] td {
  text-align: right;
}

th {
  color: var(--sc-muted);
  background: var(--sc-bg);
  font-size: 12px;
  font-weight: 950;
}

th:first-child {
  border-radius: 8px 0 0 8px;
}

th:last-child {
  border-radius: 0 8px 8px 0;
}

tbody tr {
  background: var(--sc-surface);
  box-shadow: inset 0 0 0 1px var(--sc-border);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

tbody tr:nth-child(even) {
  background: rgba(247, 249, 243, 0.68);
}

tbody tr:hover {
  transform: translateY(-1px);
  background: var(--sc-bg);
  box-shadow:
    inset 0 0 0 1px rgba(106, 154, 42, 0.24),
    0 10px 26px rgba(74, 10, 10, 0.07);
}

td {
  color: var(--sc-dark);
  font-size: 13px;
  font-weight: 850;
}

td:first-child {
  border-radius: 8px 0 0 8px;
}

td:last-child {
  border-radius: 0 8px 8px 0;
}

.breakdown-id {
  color: var(--sc-dark);
  font-weight: 950;
}

.machine-cell,
.technician-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.machine-cell {
  align-items: flex-start;
  flex-direction: column;
  gap: 3px;
}

.machine-cell strong,
.technician-cell strong {
  color: var(--sc-dark);
  font-size: 14px;
  font-weight: 950;
}

.machine-cell small,
.technician-cell small {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 800;
}

.avatar {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--sc-bg);
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
}

.date-cell,
.downtime-cell {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--sc-muted);
  font-weight: 900;
}

.priority-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 950;
  white-space: nowrap;
}

.priority-pill.critical {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.priority-pill.warning {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.priority-pill.attention {
  background: var(--sc-soft-attention);
  color: #ad7a00;
}

.priority-pill.low {
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.status-pill {
  gap: 7px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.status-pill > span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
}

.status-pill.in-progress {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.status-pill.resolved {
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.status-pill.open {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.status-pill.planned {
  background: var(--sc-soft-attention);
  color: #ad7a00;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons button {
  width: 38px;
  height: 38px;
}

.action-buttons .danger-button {
  color: var(--sc-danger);
}

.action-buttons .danger-button:hover {
  border-color: rgba(227, 30, 36, 0.28);
  background: var(--sc-soft-danger);
}

.skeleton-list {
  display: grid;
  gap: 10px;
  padding: 18px;
}

.skeleton-list span {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--sc-bg), var(--sc-surface), var(--sc-bg));
  background-size: 220% 100%;
  animation: skeleton 1.1s ease-in-out infinite;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 290px;
  padding: 34px 18px;
  text-align: center;
}

.empty-icon {
  width: 78px;
  height: 78px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.empty-state strong {
  color: var(--sc-dark);
  font-size: 20px;
  font-weight: 950;
}

.empty-state p {
  max-width: 460px;
  margin: 0;
  color: var(--sc-muted);
  font-size: 14px;
  font-weight: 800;
}

.secondary-button {
  min-height: 42px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 950;
}

.mobile-list {
  display: none;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(3px);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(3px);
  padding: 24px;
}

.breakdown-modal {
  width: min(860px, 100%);
  max-height: min(820px, calc(100vh - 48px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  box-shadow: 0 24px 70px rgba(17, 24, 39, 0.2);
}

.breakdown-modal header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--sc-border);
}

.breakdown-modal header p {
  margin: 0 0 6px;
  color: var(--sc-primary);
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
}

.breakdown-modal h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 22px;
  font-weight: 950;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-bg);
  color: var(--sc-dark);
  cursor: pointer;
}

.breakdown-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  overflow-y: auto;
  padding: 20px 22px 22px;
}

.breakdown-form label {
  display: grid;
  gap: 7px;
}

.breakdown-form label.wide,
.modal-actions {
  grid-column: 1 / -1;
}

.breakdown-form label span {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
}

.breakdown-form input,
.breakdown-form select,
.breakdown-form textarea {
  width: 100%;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-bg);
  color: var(--sc-dark);
  padding: 0 13px;
  font-size: 14px;
  font-weight: 800;
  outline: none;
}

.breakdown-form input,
.breakdown-form select {
  height: 42px;
}

.breakdown-form textarea {
  min-height: 104px;
  padding-block: 12px;
  resize: vertical;
}

.breakdown-form input:focus,
.breakdown-form select:focus,
.breakdown-form textarea:focus {
  border-color: rgba(106, 154, 42, 0.42);
  box-shadow: 0 0 0 4px var(--sc-soft-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 90;
  width: min(560px, 100vw);
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--sc-border);
  background: var(--sc-surface);
  color: var(--sc-dark);
  box-shadow: -24px 0 70px rgba(17, 24, 39, 0.18);
}

[dir='rtl'] .drawer {
  right: auto;
  left: 0;
  border-right: 1px solid var(--sc-border);
  border-left: 0;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 24px;
  border-bottom: 1px solid var(--sc-border);
}

.drawer-header h2 {
  margin: 10px 0 6px;
  color: var(--sc-dark);
  font-size: 24px;
  font-weight: 950;
}

.drawer-header p {
  margin: 0;
  color: var(--sc-muted);
  font-size: 14px;
  font-weight: 800;
}

.drawer-header button {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
}

.drawer-body {
  display: grid;
  gap: 14px;
  overflow-y: auto;
  padding: 18px;
}

.detail-card {
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-surface);
  padding: 16px;
}

.detail-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  color: var(--sc-dark);
  font-size: 15px;
  font-weight: 950;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-grid div {
  min-height: 72px;
  border: 1px solid var(--sc-border);
  border-radius: 8px;
  background: var(--sc-bg);
  padding: 12px;
}

.detail-grid span,
.detail-grid strong {
  display: block;
}

.detail-grid span {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
}

.detail-grid strong {
  margin-top: 6px;
  color: var(--sc-dark);
  font-size: 14px;
  font-weight: 950;
}

.history-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.history-list li {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  gap: 10px;
}

.history-list li > span {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 999px;
  background: var(--sc-primary);
  box-shadow: 0 0 0 4px var(--sc-soft-primary);
}

.history-list strong,
.history-list p,
.history-list small {
  display: block;
}

.history-list strong {
  color: var(--sc-dark);
  font-size: 14px;
  font-weight: 950;
}

.history-list p,
.empty-history {
  margin: 4px 0 0;
  color: var(--sc-muted);
  font-size: 13px;
  font-weight: 800;
}

.history-list small {
  margin-top: 4px;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 800;
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
  border: 1px solid var(--sc-border);
  border-radius: 12px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  box-shadow: var(--sc-shadow);
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
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(3px);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active,
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to,
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

[dir='rtl'] .drawer-slide-enter-from,
[dir='rtl'] .drawer-slide-leave-to {
  transform: translateX(-100%);
}

@keyframes panne-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-header,
  .kpi-card,
  .table-card,
  .skeleton-list span {
    animation: none;
  }

  .kpi-card,
  tbody tr,
  .reset-button,
  .secondary-button,
  .action-buttons button,
  .drawer-header button,
  .mobile-card-head button,
  .drawer-fade-enter-active,
  .drawer-fade-leave-active,
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: none;
  }

  .kpi-card:hover,
  tbody tr:hover,
  .reset-button:hover,
  .secondary-button:hover,
  .action-buttons button:hover,
  .drawer-header button:hover,
  .mobile-card-head button:hover {
    transform: none;
  }
}

@media (max-width: 1320px) {
  .filters-bar {
    grid-template-columns: repeat(3, minmax(160px, 1fr)) 46px;
  }

  .filter-field--search {
    grid-column: span 2;
  }
}

@media (max-width: 1120px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .pannes-page :deep(.admin-top-controls) {
    justify-content: flex-start;
    width: 100%;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
}

@media (max-width: 760px) {
  .pannes-page,
  [dir='rtl'] .pannes-page {
    padding: 88px 16px 32px;
  }

  .header-title {
    align-items: flex-start;
  }

  .header-icon {
    width: 54px;
    height: 54px;
  }

  .kpi-grid,
  .filters-bar {
    grid-template-columns: 1fr;
  }

  .filter-field--search {
    grid-column: auto;
  }

  .table-wrap {
    display: none;
  }

  .mobile-list {
    display: grid;
    gap: 12px;
    padding: 12px;
  }

  .mobile-card {
    border: 1px solid var(--sc-border);
    border-radius: 8px;
    background: var(--sc-surface);
    padding: 14px;
  }

  .mobile-card-head,
  .mobile-badges {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .mobile-card-head span,
  .mobile-card-head strong {
    display: block;
  }

  .mobile-card-head span {
    color: var(--sc-muted);
    font-size: 12px;
    font-weight: 900;
  }

  .mobile-card-head strong {
    margin-top: 2px;
    color: var(--sc-dark);
    font-size: 15px;
    font-weight: 950;
  }

  .mobile-card-head button {
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
  }

  .mobile-card p {
    margin: 10px 0;
    color: var(--sc-muted);
    font-size: 13px;
    font-weight: 800;
  }

  .mobile-card dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 0 0 12px;
  }

  .mobile-card dt {
    color: var(--sc-muted);
    font-size: 11px;
    font-weight: 900;
  }

  .mobile-card dd {
    margin: 3px 0 0;
    color: var(--sc-dark);
    font-size: 13px;
    font-weight: 950;
  }

  .mobile-badges {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .mobile-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .mobile-actions button {
    min-height: 38px;
    flex: 1;
    border: 1px solid var(--sc-border);
    border-radius: 8px;
    background: var(--sc-surface);
    color: var(--sc-primary);
    font-size: 12px;
    font-weight: 950;
  }

  .mobile-actions .danger-button {
    color: var(--sc-danger);
  }

  .drawer {
    width: 100vw;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-backdrop {
    padding: 12px;
  }

  .breakdown-form {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
