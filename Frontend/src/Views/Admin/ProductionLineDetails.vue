<template>
  <main class="line-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
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

    <section class="line-page">
      <div class="line-toolbar">
        <RouterLink class="back-link" to="/admin/production-lines">
          <ArrowLeft :size="17" aria-hidden="true" />
          <span>{{ content.back }}</span>
        </RouterLink>
      </div>

      <div v-if="loading" class="skeleton-page" :aria-label="content.loading">
        <span class="skeleton hero"></span>
        <span v-for="row in 5" :key="row" class="skeleton"></span>
      </div>
      <div v-else-if="errorMessage" class="state-panel error">{{ errorMessage }}</div>
      <section v-else-if="!line" class="state-panel">
        <Factory :size="42" aria-hidden="true" />
        <h1>{{ content.notFoundTitle }}</h1>
        <p>{{ content.notFoundText }}</p>
      </section>

      <template v-else>
        <header class="detail-header">
          <div class="title-block">
            <span class="title-icon" aria-hidden="true"><Factory :size="24" /></span>
            <div>
              <span class="domain-badge">{{ content.domain }}</span>
              <h1>{{ displayValue(line.name) }}</h1>
              <p>{{ displayValue(line.code) }} - {{ displayValue(line.department) }}</p>
            </div>
          </div>
          <ProductionLineStatusBadge :status="line.statusKey" />
        </header>

        <section class="kpi-grid" :aria-label="content.kpiLabel">
          <article v-for="item in infoCards" :key="item.label" class="kpi-card">
            <span class="kpi-icon" aria-hidden="true"><component :is="item.icon" :size="20" /></span>
            <div>
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
              <p>{{ item.help }}</p>
            </div>
          </article>
        </section>

        <section class="details-grid">
          <article class="dashboard-panel information-card">
            <header>
              <h2>{{ content.generalInfo }}</h2>
            </header>
            <dl class="details-list">
              <div>
                <dt>{{ content.fields.code }}</dt>
                <dd>{{ displayValue(line.code) }}</dd>
              </div>
              <div>
                <dt>{{ content.fields.name }}</dt>
                <dd>{{ displayValue(line.name) }}</dd>
              </div>
              <div>
                <dt>{{ content.fields.department }}</dt>
                <dd>{{ displayValue(line.department) }}</dd>
              </div>
              <div>
                <dt>{{ content.fields.manager }}</dt>
                <dd>
                  <span class="manager-inline" :class="{ empty: !line.manager }">
                    <UserCircle :size="18" aria-hidden="true" />
                    {{ line.manager || content.unassigned }}
                  </span>
                </dd>
              </div>
              <div class="wide">
                <dt>{{ content.fields.description }}</dt>
                <dd>{{ displayValue(line.description) }}</dd>
              </div>
              <div>
                <dt>{{ content.fields.createdAt }}</dt>
                <dd>{{ displayValue(line.createdAt) }}</dd>
              </div>
              <div>
                <dt>{{ content.fields.updatedAt }}</dt>
                <dd>{{ displayValue(line.updatedAt) }}</dd>
              </div>
            </dl>
          </article>

          <article class="dashboard-panel">
            <header>
              <h2>{{ content.zones }}</h2>
              <span>{{ zoneGroups.length }}</span>
            </header>
            <ul v-if="zoneGroups.length" class="zone-list">
              <li v-for="zone in zoneGroups" :key="zone.id">
                <span class="zone-icon" aria-hidden="true"><Grid3X3 :size="18" /></span>
                <div>
                  <strong>{{ displayValue(zone.name) }}</strong>
                  <small>{{ zone.machines_count }} {{ zone.machines_count === 1 ? content.machineSingular : content.machines }}</small>
                </div>
                <em>{{ displayValue(zone.code) }}</em>
              </li>
            </ul>
            <p v-else class="empty-copy">{{ content.noZones }}</p>
          </article>

          <article class="dashboard-panel machines-panel">
            <header>
              <h2>{{ content.machinesByZone }}</h2>
              <span>{{ line.machinesCount }}</span>
            </header>
            <div v-if="zoneGroups.length" class="machines-groups">
              <section v-for="zone in zoneGroups" :key="zone.id" class="machine-group">
                <header>
                  <h3>{{ displayValue(zone.name) }}</h3>
                  <span>{{ zone.machines_count }} {{ zone.machines_count === 1 ? content.machineSingular : content.machines }}</span>
                </header>

                <ul v-if="zone.machines.length" class="machine-list">
                  <li v-for="machine in zone.machines" :key="machine.id">
                    <div>
                      <strong>{{ displayValue(machine.code) }} - {{ displayValue(machine.name) }}</strong>
                      <span>{{ content.status }}: {{ displayValue(machine.status) }} - {{ content.periodicity }}: {{ displayValue(machine.periodicity) }}</span>
                    </div>
                    <RouterLink class="machine-link" :aria-label="content.fullMachine" :to="{ name: 'admin-machine-details', params: { id: machine.id } }">
                      <ExternalLink :size="16" aria-hidden="true" />
                      <span>{{ content.fullMachine }}</span>
                    </RouterLink>
                  </li>
                </ul>
                <p v-else class="empty-copy">{{ content.noMachines }}</p>
              </section>
            </div>
            <p v-else class="empty-copy">{{ content.noMachines }}</p>
          </article>

        </section>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, ExternalLink, Factory, Grid3X3, Layers3, UserCircle, Wrench } from '@lucide/vue'
import ProductionLineStatusBadge from '@/Components/ProductionLines/ProductionLineStatusBadge.vue'
import Sidebar from '@/Components/sidebar.vue'
import { getProductionLineById } from '@/services/productionLinesService'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const line = ref(null)
const language = computed(() => languageStore.language)

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    back: 'Retour aux lignes',
    domain: 'Production',
    kpiLabel: 'Indicateurs detail ligne',
    loading: 'Chargement de la ligne de production...',
    notFoundTitle: 'Ligne introuvable',
    notFoundText: "Aucune donnee reelle n'est disponible pour cette ligne de production.",
    loadError: 'Impossible de charger la ligne de production.',
    generalInfo: 'Informations',
    zones: 'Zones',
    machinesByZone: 'Machines',
    machines: 'machines',
    machineSingular: 'machine',
    noZones: 'Aucune zone rattachee a cette ligne.',
    noMachines: 'Aucune machine rattachee.',
    unassigned: 'Non affecte',
    status: 'Statut',
    periodicity: 'Periodicite',
    fullMachine: 'Fiche machine',
    fields: { id: 'ID Ligne', code: 'Code', name: 'Nom de la ligne', department: 'Departement ou atelier', manager: 'Responsable', status: 'Statut', description: 'Description', createdAt: 'Date de creation', updatedAt: 'Derniere modification', zones: 'Zones', machines: 'Machines', activeMachines: 'Machines actives', maintenanceMachines: 'Machines en maintenance' },
    kpis: {
      status: 'Etat operationnel',
      zones: 'Zones rattachees',
      machines: 'Machines associees',
      activeMachines: 'En fonctionnement',
      maintenanceMachines: 'A surveiller',
    },
    statuses: { active: 'Active', stopped: 'Arretee', maintenance: 'Maintenance' },
  },
}
pageContent.EN = {
  ...pageContent.FR,
  back: 'Back to lines',
  loading: 'Loading production line...',
  notFoundTitle: 'Line not found',
  notFoundText: 'No real data is available for this production line.',
  loadError: 'Unable to load the production line.',
  generalInfo: 'Information',
  zones: 'Zones',
  machinesByZone: 'Machines',
  machineSingular: 'machine',
  noZones: 'No zone attached to this line.',
  noMachines: 'No machine attached.',
  unassigned: 'Unassigned',
  status: 'Status',
  periodicity: 'Periodicity',
  fullMachine: 'Machine record',
  fields: { id: 'Line ID', code: 'Code', name: 'Line name', department: 'Department or workshop', manager: 'Manager', status: 'Status', description: 'Description', createdAt: 'Created at', updatedAt: 'Last update', zones: 'Zones', machines: 'Machines', activeMachines: 'Active machines', maintenanceMachines: 'Machines in maintenance' },
  kpis: {
    status: 'Operational state',
    zones: 'Attached zones',
    machines: 'Linked machines',
    activeMachines: 'Running',
    maintenanceMachines: 'To monitor',
  },
  statuses: { active: 'Active', stopped: 'Stopped', maintenance: 'Maintenance' },
}
pageContent.AR = pageContent.FR

const content = computed(() => pageContent[language.value] || pageContent.FR)

const zoneGroups = computed(() => line.value?.zones || [])
const infoCards = computed(() => {
  if (!line.value) return []

  return [
    { icon: Grid3X3, label: content.value.fields.zones, value: line.value.zonesCount, help: content.value.kpis.zones },
    { icon: Wrench, label: content.value.fields.machines, value: line.value.machinesCount, help: content.value.kpis.machines },
    { icon: Factory, label: content.value.fields.activeMachines, value: line.value.activeMachinesCount, help: content.value.kpis.activeMachines },
    { icon: Layers3, label: content.value.fields.maintenanceMachines, value: line.value.maintenanceMachinesCount, help: content.value.kpis.maintenanceMachines },
  ]
})

onMounted(loadLine)

async function loadLine() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getProductionLineById(route.params.id)
    line.value = data ? normalizeProductionLine(data) : null
  } catch (error) {
    line.value = null
    errorMessage.value = error.message || content.value.loadError
  } finally {
    loading.value = false
  }
}

function normalizeProductionLine(data) {
  const zones = normalizeZones(data)
  const flatMachines = normalizeMachines(data.machines || data.equipments || [])
  const groupedZones = zones.length ? zones.map(normalizeZone) : buildZoneGroupsFromMachines(flatMachines)
  const machinesCount = numberOrFallback(
    data.machines_count ?? data.machinesCount ?? data.equipments_count ?? data.equipmentsCount,
    groupedZones.reduce((total, zone) => total + zone.machines.length, 0),
  )

  return {
    id: data.id ?? data.line_id ?? data.lineId ?? data.code,
    code: data.code ?? data.line_code ?? data.lineCode ?? '',
    name: data.name ?? data.label ?? data.line_name ?? data.lineName ?? '',
    department: data.department ?? data.workshop ?? data.atelier ?? '',
    description: data.description ?? '',
    createdAt: data.created_at ?? data.createdAt ?? '',
    updatedAt: data.updated_at ?? data.updatedAt ?? '',
    manager: formatResponsible(data.responsible ?? data.manager ?? data.responsible_name ?? data.manager_name),
    statusKey: normalizeStatus(data.status),
    zonesCount: numberOrFallback(data.zones_count ?? data.zonesCount, groupedZones.length),
    machinesCount,
    activeMachinesCount: countMachinesByStatus(groupedZones, 'active'),
    maintenanceMachinesCount: countMachinesByStatus(groupedZones, 'maintenance'),
    zones: groupedZones,
  }
}

function countMachinesByStatus(zones, status) {
  return zones.reduce(
    (total, zone) => total + zone.machines.filter((machine) => normalizeStatus(machine.status) === status).length,
    0,
  )
}

function normalizeZones(data) {
  const zones = data.zones || data.production_zones || data.productionZones || []
  return Array.isArray(zones) ? zones : []
}

function normalizeZone(zone) {
  const machines = normalizeMachines(zone.machines || zone.equipments || [])

  return {
    id: zone.id ?? zone.zone_id ?? zone.zoneId ?? zone.code ?? zone.name,
    code: zone.code ?? zone.zone_code ?? zone.zoneCode ?? '',
    name: zone.name ?? zone.label ?? zone.zone_name ?? zone.zoneName ?? '',
    machines_count: Number(zone.machines_count ?? zone.machine_count ?? zone.machineCount ?? machines.length ?? 0),
    machines,
  }
}

function normalizeMachines(machines) {
  return Array.isArray(machines)
    ? machines.map((machine) => ({
        id: machine.id ?? machine.equipment_id ?? machine.equipmentId ?? machine.code,
        code: machine.code ?? '',
        name: machine.name ?? machine.label ?? '',
        status: machine.status ?? '',
        periodicity: machine.periodicity ?? machine.frequency ?? '',
        zoneId: machine.zone_id ?? machine.zoneId ?? machine.zone?.id ?? null,
        zoneCode: machine.zone?.code ?? '',
        zoneName: machine.zone?.name ?? machine.zone_name ?? '',
      }))
    : []
}

function formatResponsible(responsible) {
  if (!responsible) return ''
  if (typeof responsible === 'string') return responsible

  const fullName = [responsible.first_name, responsible.last_name].filter(Boolean).join(' ').trim()
  return responsible.name || fullName || responsible.email || ''
}

function buildZoneGroupsFromMachines(machines) {
  const groups = new Map()

  machines.forEach((machine) => {
    const id = machine.zoneId ?? machine.zoneCode ?? machine.zoneName ?? 'unassigned'
    const existing = groups.get(id) || {
      id,
      code: machine.zoneCode,
      name: machine.zoneName || content.value.noZones,
      machines_count: 0,
      machines: [],
    }

    existing.machines.push(machine)
    existing.machines_count = existing.machines.length
    groups.set(id, existing)
  })

  return [...groups.values()]
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

function displayValue(value) {
  return value || '-'
}
</script>

<style scoped>
.line-layout { min-height: 100vh; background: var(--sc-bg); color: var(--sc-dark); }
.line-page { display: flex; flex-direction: column; gap: 18px; min-height: 100vh; padding: 32px 28px 44px 88px; }
[dir='rtl'] .line-page { padding-right: 88px; padding-left: 28px; }
.line-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.back-link, .machine-link { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid rgba(106, 154, 42, 0.28); border-radius: 8px; background: var(--sc-surface); color: var(--sc-primary); padding: 0 13px; font-size: 13px; font-weight: 950; text-decoration: none; transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease; }
.back-link:hover, .machine-link:hover { background: var(--sc-soft-primary); transform: translateY(-1px); box-shadow: var(--sc-shadow); }
.detail-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: var(--sc-shadow); padding: 20px; }
.title-block { display: flex; align-items: flex-start; gap: 14px; }
.title-icon { width: 54px; height: 54px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(106, 154, 42, 0.22); border-radius: 8px; background: var(--sc-bg); color: var(--sc-primary); }
.domain-badge { min-height: 26px; display: inline-flex; align-items: center; border-radius: 999px; background: var(--sc-soft-secondary); color: var(--sc-primary); padding: 0 10px; font-size: 12px; font-weight: 950; }
.detail-header h1 { margin: 8px 0 0; color: var(--sc-dark); font-size: 30px; font-weight: 950; letter-spacing: 0; }
.detail-header p { margin: 6px 0 0; color: var(--sc-muted); font-size: 14px; font-weight: 800; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.kpi-card { min-height: 112px; display: flex; gap: 14px; border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: 0 14px 34px rgba(74, 10, 10, 0.07); padding: 16px; transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
.kpi-card:hover { transform: translateY(-2px); border-color: rgba(106, 154, 42, 0.34); box-shadow: 0 18px 42px rgba(74, 10, 10, 0.1); }
.kpi-icon { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--sc-soft-secondary); color: var(--sc-primary); flex: 0 0 auto; }
.kpi-card strong { display: block; color: var(--sc-dark); font-size: 23px; font-weight: 950; line-height: 1.1; }
.kpi-card span { display: block; margin-top: 7px; color: var(--sc-dark); font-size: 13px; font-weight: 950; }
.kpi-card p { margin: 5px 0 0; color: var(--sc-muted); font-size: 12px; font-weight: 750; line-height: 1.35; }
.details-grid { display: grid; grid-template-columns: minmax(360px, 1fr) minmax(360px, 1fr); gap: 14px; }
.dashboard-panel, .state-panel { border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-surface); box-shadow: var(--sc-shadow); padding: 18px; }
.machines-panel { grid-column: 1 / -1; }
.dashboard-panel > header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dashboard-panel h2, .state-panel h1 { margin: 0; color: var(--sc-dark); font-size: 18px; font-weight: 950; }
.dashboard-panel > header > span { border-radius: 999px; background: var(--sc-soft-secondary); color: var(--sc-primary); padding: 5px 10px; font-size: 12px; font-weight: 950; }
.state-panel { display: grid; gap: 8px; justify-items: start; color: var(--sc-muted); font-size: 14px; font-weight: 850; }
.state-panel.error { color: var(--sc-danger); }
.state-panel svg { color: var(--sc-primary); }
.state-panel p { margin: 0; color: var(--sc-muted); font-size: 14px; font-weight: 760; }
.details-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0 0; }
.details-list div { border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-bg); padding: 12px; }
.details-list .wide { grid-column: 1 / -1; }
.details-list dt, .details-list dd { margin: 0; }
.details-list dt, .zone-list span, .zone-list small, .machine-list span, .empty-copy { display: block; color: var(--sc-muted); font-size: 12px; font-weight: 800; }
.details-list dd, .zone-list strong, .machine-list strong { display: block; margin-top: 7px; color: var(--sc-dark); font-size: 15px; font-weight: 950; line-height: 1.24; }
.manager-inline { display: inline-flex; align-items: center; gap: 7px; }
.manager-inline.empty { color: var(--sc-muted); }
.zone-list, .machine-list { display: grid; gap: 0; margin: 14px 0 0; padding: 0; list-style: none; }
.zone-list li, .machine-list li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--sc-border); transition: background 0.16s ease; }
.zone-list li:last-child, .machine-list li:last-child { border-bottom: 0; }
.zone-list li:hover, .machine-list li:hover { background: var(--sc-bg); }
.zone-icon { width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--sc-soft-secondary); color: var(--sc-primary); flex: 0 0 auto; }
.zone-list em { color: var(--sc-muted); font-size: 12px; font-style: normal; font-weight: 950; }
.machines-groups { display: grid; gap: 14px; margin-top: 16px; }
.machine-group { border: 1px solid var(--sc-border); border-radius: 8px; background: var(--sc-bg); padding: 14px; }
.machine-group header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.machine-group h3 { margin: 0; color: var(--sc-dark); font-size: 15px; font-weight: 950; }
.machine-group header span { border-radius: 999px; background: var(--sc-soft-secondary); color: var(--sc-primary); padding: 5px 10px; font-size: 12px; font-weight: 950; }
.machine-link { flex: 0 0 auto; min-height: 34px; }
.empty-copy { margin: 14px 0 0; font-size: 13px; line-height: 1.45; }
.skeleton-page { display: grid; gap: 12px; }
.skeleton { height: 86px; border-radius: 8px; background: linear-gradient(90deg, var(--sc-surface), rgba(106, 154, 42, 0.12), var(--sc-surface)); background-size: 220% 100%; animation: shimmer 1.25s ease-in-out infinite; }
.skeleton.hero { height: 124px; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; border: 1px solid var(--sc-border); border-radius: 16px; background: var(--sc-surface); color: var(--sc-dark); box-shadow: var(--sc-shadow); }
[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; border-radius: 999px; background: currentColor; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74, 10, 10, 0.28); }
@keyframes shimmer { to { background-position: -220% 0; } }
@media (max-width: 1180px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .details-grid { grid-template-columns: 1fr; }
}
@media (max-width: 780px) {
  .line-page, [dir='rtl'] .line-page { padding: 88px 16px 32px; }
  .detail-header { align-items: flex-start; flex-direction: column; }
  .detail-header h1 { font-size: 25px; }
  .title-block { align-items: center; }
  .kpi-grid, .details-list { grid-template-columns: 1fr; }
  .machine-list li, .zone-list li { align-items: flex-start; flex-direction: column; }
  .machine-link { width: 100%; }
}
</style>
