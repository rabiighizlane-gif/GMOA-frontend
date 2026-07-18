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
        <div>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
      </header>

      <AdminTopControls v-model="searchQuery" />

      <section class="metrics-grid" :aria-label="content.metricsLabel">
        <article v-for="metric in metrics" :key="metric.label" :class="metric.tone">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </article>
      </section>

      <section class="table-card" aria-labelledby="breakdowns-table-title">
        <div class="table-card-header">
          <div>
            <h2 id="breakdowns-table-title">{{ content.tableTitle }}</h2>
            <p>{{ filteredBreakdowns.length }} {{ content.results }}</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ content.columns.id }}</th>
                <th>{{ content.columns.machine }}</th>
                <th>{{ content.columns.description }}</th>
                <th>{{ content.columns.priority }}</th>
                <th>{{ content.columns.status }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="breakdown in filteredBreakdowns" :key="breakdown.id">
                <td>
                  <strong class="breakdown-id">{{ breakdown.id }}</strong>
                </td>
                <td>{{ breakdownMachineLabel(breakdown.machine) }}</td>
                <td>{{ breakdownDescriptionLabel(breakdown.description) }}</td>
                <td>
                  <span class="priority-pill" :class="breakdown.priority.toLowerCase()">
                    {{ priorityLabel(breakdown.priority) }}
                  </span>
                </td>
                <td>
                  <span class="status-pill" :class="breakdown.statusTone">{{ statusLabel(breakdown.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import Sidebar from '@/Components/sidebar.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const isSidebarOpen = ref(false)
const searchQuery = ref('')

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    title: 'Gestion des Pannes',
    subtitle: 'Suivi, priorisation et résolution des pannes sur les machines.',
    tableTitle: 'Liste des pannes',
    results: 'pannes',
    metricsLabel: 'Indicateurs pannes',
    metrics: {
      active: 'Pannes actives',
      critical: 'Critiques',
      resolved: 'Résolues',
      mttr: 'MTTR moyen',
    },
    columns: {
      id: 'ID Panne',
      machine: 'Machine Impactée',
      description: 'Description',
      priority: 'Gravité / Priorité',
      status: 'Statut',
    },
    priorities: {
      CRITICAL: 'Critique',
      WARNING: 'Avertissement',
      ATTENTION: 'Attention',
    },
    statuses: {
      'En cours': 'En cours',
      Résolu: 'Résolu',
    },
  },
  EN: {
    sidebarToggle: 'Show menu',
    title: 'Breakdown Management',
    subtitle: 'Track, prioritize, and resolve machine breakdowns.',
    tableTitle: 'Breakdown list',
    results: 'breakdowns',
    metricsLabel: 'Breakdown indicators',
    metrics: {
      active: 'Active breakdowns',
      critical: 'Critical',
      resolved: 'Resolved',
      mttr: 'Average MTTR',
    },
    columns: {
      id: 'Breakdown ID',
      machine: 'Impacted machine',
      description: 'Description',
      priority: 'Severity / Priority',
      status: 'Status',
    },
    priorities: {
      CRITICAL: 'Critical',
      WARNING: 'Warning',
      ATTENTION: 'Attention',
    },
    statuses: {
      'En cours': 'In progress',
      Résolu: 'Resolved',
    },
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    title: 'إدارة الأعطال',
    subtitle: 'تتبع أعطال الآلات وترتيب أولويتها وحلها.',
    tableTitle: 'لائحة الأعطال',
    results: 'أعطال',
    metricsLabel: 'مؤشرات الأعطال',
    metrics: {
      active: 'الأعطال النشطة',
      critical: 'حرجة',
      resolved: 'محلولة',
      mttr: 'متوسط MTTR',
    },
    columns: {
      id: 'معرف العطل',
      machine: 'الآلة المتأثرة',
      description: 'الوصف',
      priority: 'الخطورة / الأولوية',
      status: 'الحالة',
    },
    priorities: {
      CRITICAL: 'حرج',
      WARNING: 'تحذير',
      ATTENTION: 'انتباه',
    },
    statuses: {
      'En cours': 'قيد المعالجة',
      Résolu: 'محلول',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const machineLabels = {
  "Tour d'usinage M-102": { EN: 'CNC lathe M-102', AR: 'مخرطة صناعية M-102' },
  'Presse hydraulique M-215': { EN: 'Hydraulic press M-215', AR: 'مكبس هيدروليكي M-215' },
  'Convoyeur à bande M-309': { EN: 'Belt conveyor M-309', AR: 'ناقل بسير M-309' },
  'Pasteurisateur P-204': { EN: 'Pasteurizer P-204', AR: 'مبستر P-204' },
  'Remplisseuse R-118': { EN: 'Filling machine R-118', AR: 'آلة تعبئة R-118' },
}

const descriptionLabels = {
  'Surchauffe moteur': { EN: 'Motor overheating', AR: 'ارتفاع حرارة المحرك' },
  'Fuite hydraulique': { EN: 'Hydraulic leak', AR: 'تسرب هيدروليكي' },
  'Capteur de vitesse instable': { EN: 'Unstable speed sensor', AR: 'حساس السرعة غير مستقر' },
  'Arrêt automatique répété': { EN: 'Repeated automatic stop', AR: 'توقف تلقائي متكرر' },
  'Buse de dosage obstruée': { EN: 'Blocked dosing nozzle', AR: 'انسداد فوهة الجرعات' },
}

const breakdowns = [
  {
    id: 'P-801',
    machine: "Tour d'usinage M-102",
    description: 'Surchauffe moteur',
    priority: 'CRITICAL',
    status: 'En cours',
    statusTone: 'in-progress',
  },
  {
    id: 'P-802',
    machine: 'Presse hydraulique M-215',
    description: 'Fuite hydraulique',
    priority: 'WARNING',
    status: 'En cours',
    statusTone: 'in-progress',
  },
  {
    id: 'P-803',
    machine: 'Convoyeur à bande M-309',
    description: 'Capteur de vitesse instable',
    priority: 'ATTENTION',
    status: 'Résolu',
    statusTone: 'resolved',
  },
  {
    id: 'P-804',
    machine: 'Pasteurisateur P-204',
    description: 'Arrêt automatique répété',
    priority: 'CRITICAL',
    status: 'En cours',
    statusTone: 'in-progress',
  },
  {
    id: 'P-805',
    machine: 'Remplisseuse R-118',
    description: 'Buse de dosage obstruée',
    priority: 'WARNING',
    status: 'Résolu',
    statusTone: 'resolved',
  },
]

const filteredBreakdowns = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return breakdowns

  return breakdowns.filter((breakdown) =>
    [
      breakdown.id,
      breakdownMachineLabel(breakdown.machine),
      breakdownDescriptionLabel(breakdown.description),
      priorityLabel(breakdown.priority),
      statusLabel(breakdown.status),
    ].some((value) => String(value).toLowerCase().includes(query)),
  )
})

const metrics = computed(() => [
  { label: content.value.metrics.active, value: breakdowns.filter((item) => item.statusTone === 'in-progress').length, tone: 'danger' },
  { label: content.value.metrics.critical, value: breakdowns.filter((item) => item.priority === 'CRITICAL').length, tone: 'critical' },
  { label: content.value.metrics.resolved, value: breakdowns.filter((item) => item.statusTone === 'resolved').length, tone: 'resolved' },
  { label: content.value.metrics.mttr, value: '2h 40', tone: 'neutral' },
])

function priorityLabel(priority) {
  return content.value.priorities[priority] || priority
}

function statusLabel(status) {
  return content.value.statuses[status] || status
}

function breakdownMachineLabel(machine) {
  return machineLabels[machine]?.[language.value] || machine
}

function breakdownDescriptionLabel(description) {
  return descriptionLabels[description]?.[language.value] || description
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
  background: #f7f9f3;
  color: var(--sc-dark);
}

.pannes-page {
  min-height: 100vh;
  padding: 32px 28px 44px 88px;
}

[dir='rtl'] .pannes-page {
  padding-right: 88px;
  padding-left: 28px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 18px;
  margin-bottom: 20px;
  animation: panne-rise 0.48s ease both;
}

.page-header h1 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 30px;
  font-weight: 950;
  line-height: 1.1;
}

.page-header p {
  margin: 8px 0 0;
  color: var(--sc-muted);
  font-size: 15px;
  font-weight: 800;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.metrics-grid article {
  min-height: 88px;
  border: 1px solid var(--sc-border);
  border-radius: 14px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  padding: 16px;
  animation: panne-rise 0.5s ease both;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.metrics-grid article:nth-child(2) {
  animation-delay: 0.05s;
}

.metrics-grid article:nth-child(3) {
  animation-delay: 0.1s;
}

.metrics-grid article:nth-child(4) {
  animation-delay: 0.15s;
}

.metrics-grid article:hover {
  transform: translateY(-3px);
  border-color: rgba(106, 154, 42, 0.26);
  box-shadow: 0 18px 42px rgba(74, 10, 10, 0.1);
}

.metrics-grid span {
  display: block;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
}

.metrics-grid strong {
  display: block;
  margin-top: 9px;
  color: var(--sc-dark);
  font-size: 26px;
  font-weight: 950;
}

.metrics-grid .danger {
  border-color: rgba(227, 30, 36, 0.22);
}

.metrics-grid .critical strong {
  color: #e31e24;
}

.metrics-grid .resolved strong {
  color: #6a9a2a;
}

.table-card {
  overflow: hidden;
  margin-top: 18px;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  animation: panne-rise 0.56s ease 0.12s both;
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--sc-border);
}

.table-card-header h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 18px;
  font-weight: 950;
}

.table-card-header p {
  margin: 5px 0 0;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 850;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 22px;
  text-align: left;
  border-bottom: 1px solid var(--sc-border);
  vertical-align: middle;
}

[dir='rtl'] th,
[dir='rtl'] td {
  text-align: right;
}

th {
  color: var(--sc-muted);
  background: rgba(247, 249, 243, 0.72);
  font-size: 12px;
  font-weight: 950;
}

td {
  color: var(--sc-dark);
  font-size: 14px;
  font-weight: 800;
}

tbody tr {
  transition:
    background-color 0.16s ease,
    transform 0.16s ease;
}

tbody tr:hover {
  background: rgba(247, 249, 243, 0.86);
  transform: translateX(3px);
}

tbody tr:last-child td {
  border-bottom: 0;
}

.breakdown-id {
  color: var(--sc-dark);
  font-weight: 950;
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
}

.priority-pill.critical {
  background: rgba(227, 30, 36, 0.12);
  color: #e31e24;
  animation: critical-pulse 1.9s ease-in-out infinite;
}

.priority-pill.warning {
  background: rgba(255, 106, 0, 0.12);
  color: #ff6a00;
}

.priority-pill.attention {
  background: rgba(232, 179, 0, 0.16);
  color: #8a6b00;
}

.status-pill.in-progress {
  background: rgba(74, 10, 10, 0.08);
  color: var(--sc-dark);
}

.status-pill.resolved {
  background: rgba(182, 198, 91, 0.24);
  color: #6a9a2a;
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 50;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid var(--sc-border);
  border-radius: 16px;
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
  background: rgba(74, 10, 10, 0.28);
}

@keyframes panne-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes critical-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(227, 30, 36, 0);
  }

  50% {
    box-shadow: 0 0 0 4px rgba(227, 30, 36, 0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-header,
  .metrics-grid article,
  .table-card,
  .priority-pill.critical {
    animation: none;
  }

  .metrics-grid article,
  tbody tr {
    transition: none;
  }

  .metrics-grid article:hover,
  tbody tr:hover {
    transform: none;
  }
}

@media (max-width: 1180px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }
}

@media (max-width: 760px) {
  .pannes-page,
  [dir='rtl'] .pannes-page {
    padding: 88px 16px 32px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
