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
  background:
    radial-gradient(circle at 20% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}

.pannes-page {
  min-height: 100vh;
  padding: 28px 28px 38px 88px;
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
  color: #f8fbff;
  font-size: 30px;
  font-weight: 950;
  line-height: 1.1;
}

.page-header p {
  margin: 8px 0 0;
  color: #aab7c7;
  font-size: 15px;
  font-weight: 800;
}

.pannes-page :deep(.admin-top-controls) {
  margin-bottom: 4px;
}

.pannes-page :deep(.search-control input),
.pannes-page :deep(.notification-control),
.pannes-page :deep(.date-control),
.pannes-page :deep(.time-control),
.pannes-page :deep(.live-control),
.pannes-page :deep(.language-button) {
  min-height: 42px;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 14px;
  background: rgba(19, 29, 42, 0.9);
  color: #f5f8fc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 28px rgba(0, 0, 0, 0.2);
}

.pannes-page :deep(.search-control input) {
  height: 42px;
  color: #dbe4ef;
  font-size: 13px;
}

.pannes-page :deep(.search-control input::placeholder) {
  color: #8795a7;
}

.pannes-page :deep(.search-control span) {
  color: #5b9bd7;
}

.pannes-page :deep(.live-control) {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 16px;
  color: #f4d96a;
}

.pannes-page :deep(.language-button) {
  height: 42px;
  min-width: 86px;
  font-size: 13px;
}

.pannes-page :deep(.language-menu) {
  border-color: rgba(126, 146, 170, 0.24);
  border-radius: 12px;
  background: #121c28;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
}

.pannes-page :deep(.language-menu button) {
  color: #e7edf5;
}

.pannes-page :deep(.language-menu button:hover) {
  background: rgba(75, 153, 212, 0.16);
  color: #cfe9ff;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.metrics-grid article {
  min-height: 88px;
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(131, 185, 92, 0.08), rgba(18, 28, 39, 0.02)),
    rgba(18, 28, 39, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
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
  transform: translateY(-2px);
  border-color: rgba(91, 155, 215, 0.46);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 22px 46px rgba(0, 0, 0, 0.28);
}

.metrics-grid span {
  display: block;
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 900;
}

.metrics-grid strong {
  display: block;
  margin-top: 9px;
  color: #f8fbff;
  font-size: 26px;
  font-weight: 950;
}

.metrics-grid .danger {
  border-color: rgba(220, 55, 71, 0.32);
}

.metrics-grid .critical strong {
  color: #ff7f8e;
}

.metrics-grid .resolved strong {
  color: #83b95c;
}

.table-card {
  overflow: hidden;
  margin-top: 18px;
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background: rgba(17, 27, 38, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
  animation: panne-rise 0.56s ease 0.12s both;
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

.table-card-header h2 {
  margin: 0;
  color: #f8fbff;
  font-size: 18px;
  font-weight: 950;
}

.table-card-header p {
  margin: 5px 0 0;
  color: #8d9aab;
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
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
  vertical-align: middle;
}

[dir='rtl'] th,
[dir='rtl'] td {
  text-align: right;
}

th {
  color: #aeb9c8;
  background: rgba(43, 55, 68, 0.72);
  font-size: 12px;
  font-weight: 950;
}

td {
  color: #f4f7fb;
  font-size: 14px;
  font-weight: 800;
}

tbody tr {
  transition:
    background-color 0.16s ease,
    transform 0.16s ease;
}

tbody tr:hover {
  background: rgba(35, 49, 64, 0.92);
  transform: translateX(3px);
}

tbody tr:last-child td {
  border-bottom: 0;
}

.breakdown-id {
  color: #f8fbff;
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
  background: rgba(220, 55, 71, 0.18);
  color: #ff7f8e;
  animation: critical-pulse 1.9s ease-in-out infinite;
}

.priority-pill.warning {
  background: rgba(228, 171, 68, 0.18);
  color: #ffd27b;
}

.priority-pill.attention {
  background: rgba(228, 171, 68, 0.16);
  color: #e4ab44;
}

.status-pill.in-progress {
  background: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

.status-pill.resolved {
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
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
