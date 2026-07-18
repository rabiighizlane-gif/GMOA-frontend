<template>
  <main class="reports-page">
    <button type="button" class="sidebar-toggle" aria-label="Afficher le menu" @click="openSidebar">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="page-header">
      <div>
        <p class="breadcrumb">Accueil / Rapports</p>
        <h1>Rapports</h1>
        <p>Analyse, suivi et export des données de maintenance</p>
      </div>

      <ExportActions
        v-model:period="selectedPeriod"
        v-model:report-type="selectedReportType"
        :report-types="reportTypes"
        @export-pdf="exportReport('PDF')"
        @export-excel="exportReport('Excel')"
        @generate="generateReport"
      />
    </section>

    <div class="view-switcher" aria-label="Mode d'affichage">
      <button :class="{ active: activeView === 'analytics' }" type="button" @click="activeView = 'analytics'">
        Vue analytique
      </button>
      <button :class="{ active: activeView === 'generated' }" type="button" @click="activeView = 'generated'">
        Rapports générés
      </button>
    </div>

    <template v-if="activeView === 'analytics'">
      <ReportsKPICards :cards="kpiCards" />

      <ReportsFiltersBar
        :filters="filters"
        @update-filter="updateFilter"
        @apply="applyFilters"
        @reset="resetFilters"
      />

      <ReportsTypeSelector v-model="selectedReportType" :types="reportTypes" />

      <ReportsChartsSection :report-type="selectedReportType" />

      <ReportsTable :title="tableConfig.title" :columns="tableConfig.columns" :rows="tableConfig.rows" />
    </template>

    <section v-else class="history-card">
      <div class="history-header">
        <div>
          <h2>Historique des rapports</h2>
          <p>{{ generatedReports.length }} rapport(s) généré(s)</p>
        </div>
        <button type="button" @click="generateReport">Générer un rapport</button>
      </div>

      <div class="history-list">
        <article v-for="report in generatedReports" :key="report.id" class="history-row">
          <div>
            <strong>{{ report.title }}</strong>
            <span>{{ report.format }} · Généré le {{ report.generatedAt }} · Par {{ report.generatedBy }}</span>
          </div>
          <button type="button" @click="downloadReport(report.format, report)">Télécharger</button>
        </article>
      </div>
    </section>

    <ReportPreviewDrawer
      :open="previewOpen"
      :report="currentPreviewReport"
      @close="previewOpen = false"
      @download="downloadReport"
    />

    <Transition name="toast">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Sidebar from '@/Components/sidebar.vue'
import ExportActions from '@/Components/Reports/ExportActions.vue'
import ReportPreviewDrawer from '@/Components/Reports/ReportPreviewDrawer.vue'
import ReportsChartsSection from '@/Components/Reports/ReportsChartsSection.vue'
import ReportsFiltersBar from '@/Components/Reports/ReportsFiltersBar.vue'
import ReportsKPICards from '@/Components/Reports/ReportsKPICards.vue'
import ReportsTable from '@/Components/Reports/ReportsTable.vue'
import ReportsTypeSelector from '@/Components/Reports/ReportsTypeSelector.vue'

const isSidebarOpen = ref(false)
const activeView = ref('analytics')
const selectedPeriod = ref('Juillet 2026')
const selectedReportType = ref('interventions')
const previewOpen = ref(false)
const currentPreviewReport = ref(null)
const toastMessage = ref('')

const filters = reactive({
  period: '',
  line: '',
  machine: '',
  technician: '',
  maintenanceType: '',
  status: '',
  priority: '',
})

const reportTypes = [
  { id: 'interventions', icon: '🔧', label: 'Rapport des interventions', description: 'Durée, technicien, type, statut, coûts, machine' },
  { id: 'breakdowns', icon: '⚠️', label: 'Rapport des pannes', description: 'Causes, criticité, durée d’arrêt, machines' },
  { id: 'machines', icon: '⚙️', label: 'Rapport des machines', description: 'Disponibilité, pannes, MTBF, MTTR, état' },
  { id: 'preventive', icon: '📅', label: 'Maintenance préventive', description: 'Planning, échéances, retards, réalisation' },
  { id: 'spareParts', icon: '📦', label: 'Pièces de rechange', description: 'Stock, consommation, ruptures, valeur' },
  { id: 'technicians', icon: '👨‍🔧', label: 'Performance techniciens', description: 'Interventions, temps moyen, clôtures, charge' },
  { id: 'costs', icon: '💰', label: 'Coûts de maintenance', description: 'Coûts par machine, ligne, pièce ou période' },
]

const kpiCards = [
  { icon: 'I', label: 'Interventions', value: '128', description: 'Total période', color: 'green' },
  { icon: '%', label: 'Disponibilité', value: '92 %', description: 'Moyenne machines', color: 'green' },
  { icon: 'B', label: 'MTBF', value: '185 h', description: 'Temps moyen entre pannes', color: 'yellow' },
  { icon: 'R', label: 'MTTR', value: '2 h 35', description: 'Temps moyen de réparation', color: 'orange' },
  { icon: 'P', label: 'Pannes critiques', value: '12', description: 'À prioriser', color: 'red' },
  { icon: 'DH', label: 'Coût maintenance', value: '48 600 DH', description: 'Coût consolidé', color: 'yellow' },
]

const generatedReports = ref([
  {
    id: 'RPT-2026-07',
    title: 'Rapport mensuel - Juillet 2026',
    format: 'PDF',
    generatedAt: '18/07/2026',
    generatedBy: 'Super Admin',
  },
  {
    id: 'RPT-2026-Q2',
    title: 'Rapport interventions - T2 2026',
    format: 'Excel',
    generatedAt: '12/07/2026',
    generatedBy: 'Super Admin',
  },
])

const activeReportLabel = computed(
  () => reportTypes.find((type) => type.id === selectedReportType.value)?.label || 'Rapport maintenance',
)

const tableConfig = computed(() => {
  const configs = {
    interventions: {
      title: 'Tableau récapitulatif des interventions',
      columns: ['ID', 'Machine', 'Technicien', 'Type', 'Durée', 'Coût', 'Statut', 'Date'],
      rows: [
        {
          id: 'INT-887',
          ID: 'INT-887',
          Machine: 'Remplisseuse R-118',
          Technicien: 'Nabil',
          Type: 'Corrective',
          Durée: '5 h 40',
          Coût: '2 400 DH',
          Statut: 'Terminée',
          Date: '14/07/2026',
        },
        {
          id: 'INT-888',
          ID: 'INT-888',
          Machine: 'Pasteurisateur P-204',
          Technicien: 'Karim',
          Type: 'Corrective',
          Durée: '2 h 35',
          Coût: '1 150 DH',
          Statut: 'Terminée',
          Date: '17/07/2026',
        },
        {
          id: 'INT-890',
          ID: 'INT-890',
          Machine: 'Convoyeur M-309',
          Technicien: 'Youssef',
          Type: 'Préventive',
          Durée: '1 h 20',
          Coût: '680 DH',
          Statut: 'En cours',
          Date: '18/07/2026',
        },
      ],
    },
    breakdowns: {
      title: 'Tableau récapitulatif des pannes',
      columns: ['ID panne', 'Machine', 'Cause', "Durée d'arrêt", 'Criticité', 'Intervention liée', 'Date'],
      rows: [
        {
          id: 'P-801',
          'ID panne': 'P-801',
          Machine: "Tour d'usinage M-102",
          Cause: 'Surchauffe moteur',
          "Durée d'arrêt": '3 h 10',
          Criticité: 'Critique',
          'Intervention liée': 'INT-888',
          Date: '17/07/2026',
        },
        {
          id: 'P-802',
          'ID panne': 'P-802',
          Machine: 'Presse hydraulique M-215',
          Cause: 'Fuite hydraulique',
          "Durée d'arrêt": '2 h 00',
          Criticité: 'Haute',
          'Intervention liée': 'INT-887',
          Date: '15/07/2026',
        },
      ],
    },
    machines: {
      title: 'Tableau récapitulatif des machines',
      columns: ['Machine', 'Ligne', 'Disponibilité', 'Pannes', 'MTBF', 'MTTR', 'Statut'],
      rows: [
        {
          id: 'M-102',
          Machine: "Tour d'usinage M-102",
          Ligne: 'Ligne Production 1',
          Disponibilité: '96 %',
          Pannes: '2',
          MTBF: '210 h',
          MTTR: '1 h 45',
          Statut: 'En service',
        },
        {
          id: 'M-215',
          Machine: 'Presse hydraulique M-215',
          Ligne: 'Ligne Production 2',
          Disponibilité: '88 %',
          Pannes: '5',
          MTBF: '145 h',
          MTTR: '3 h 20',
          Statut: 'Sous surveillance',
        },
      ],
    },
    preventive: {
      title: 'Tableau maintenance préventive',
      columns: ['Plan', 'Machine', 'Fréquence', 'Dernier contrôle', 'Prochaine échéance', 'Responsable', 'Statut'],
      rows: [
        {
          id: 'MP-001',
          Plan: 'Graissage du moteur',
          Machine: 'Convoyeur M-309',
          Fréquence: 'Mensuelle',
          'Dernier contrôle': '20/06/2026',
          'Prochaine échéance': '20/07/2026',
          Responsable: 'Nabil',
          Statut: 'Planifiée',
        },
        {
          id: 'MP-002',
          Plan: 'Contrôle température',
          Machine: 'Pasteurisateur P-204',
          Fréquence: 'Hebdomadaire',
          'Dernier contrôle': '10/07/2026',
          'Prochaine échéance': '17/07/2026',
          Responsable: 'Sara',
          Statut: 'En retard',
        },
      ],
    },
    spareParts: {
      title: 'Tableau pièces de rechange',
      columns: ['Référence', 'Pièce', 'Catégorie', 'Stock actuel', 'Seuil minimum', 'Fournisseur', 'Statut'],
      rows: [
        {
          id: 'PR-004',
          Référence: 'PR-004',
          Pièce: 'Fusible industriel',
          Catégorie: 'Électrique',
          'Stock actuel': '42 / 60',
          'Seuil minimum': '15',
          Fournisseur: 'Schneider Electric',
          Statut: 'Disponible',
        },
        {
          id: 'PR-002',
          Référence: 'PR-002',
          Pièce: 'Filtre à huile',
          Catégorie: 'Filtration',
          'Stock actuel': '3 / 20',
          'Seuil minimum': '5',
          Fournisseur: 'TotalEnergies Maroc',
          Statut: 'Stock faible',
        },
      ],
    },
    technicians: {
      title: 'Tableau performance techniciens',
      columns: ['Technicien', 'Interventions', 'Clôturées', 'Temps moyen', 'SLA', 'Charge'],
      rows: [
        { id: 'Nabil', Technicien: 'Nabil', Interventions: '28', Clôturées: '26', 'Temps moyen': '2 h 10', SLA: '94 %', Charge: 'Élevée' },
        { id: 'Sara', Technicien: 'Sara', Interventions: '18', Clôturées: '17', 'Temps moyen': '1 h 55', SLA: '96 %', Charge: 'Normale' },
      ],
    },
    costs: {
      title: 'Tableau coûts de maintenance',
      columns: ['Ligne', 'Corrective', 'Préventive', 'Pièces', 'Main-d’oeuvre', 'Total'],
      rows: [
        {
          id: 'LP-01',
          Ligne: 'Ligne Production 1',
          Corrective: '8 400 DH',
          Préventive: '4 000 DH',
          Pièces: '5 200 DH',
          'Main-d’oeuvre': '1 000 DH',
          Total: '18 600 DH',
        },
        {
          id: 'LC-01',
          Ligne: 'Ligne Conditionnement',
          Corrective: '5 100 DH',
          Préventive: '2 800 DH',
          Pièces: '1 700 DH',
          'Main-d’oeuvre': '0 DH',
          Total: '9 600 DH',
        },
      ],
    },
  }

  return configs[selectedReportType.value] || configs.interventions
})

function openSidebar() {
  isSidebarOpen.value = true
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function updateFilter({ key, value }) {
  filters[key] = value
}

function applyFilters() {
  showToast('Filtres appliqués.')
}

function resetFilters() {
  Object.keys(filters).forEach((key) => {
    filters[key] = ''
  })
  showToast('Filtres réinitialisés.')
}

function generateReport() {
  currentPreviewReport.value = {
    title: activeReportLabel.value,
    period: selectedPeriod.value,
    generatedAt: '18/07/2026 20:15',
    generatedBy: 'Super Admin',
    kpis: kpiCards.map(({ label, value }) => ({ label, value })),
    rowsCount: tableConfig.value.rows.length,
  }

  previewOpen.value = true

  generatedReports.value.unshift({
    id: `RPT-${Date.now()}`,
    title: `${activeReportLabel.value} - ${selectedPeriod.value}`,
    format: 'PDF',
    generatedAt: '18/07/2026',
    generatedBy: 'Super Admin',
  })
}

function exportReport(format) {
  downloadReport(format)
}

function downloadReport(format, report = null) {
  const normalizedFormat = String(format || 'PDF').toUpperCase()
  const payload = buildReportPayload(report)

  if (normalizedFormat === 'EXCEL') {
    downloadBlob(createCsvContent(payload), `${slugify(payload.title)}.csv`, 'text/csv;charset=utf-8')
    showToast('Fichier Excel téléchargé.')
    return
  }

  downloadBlob(createPdfContent(payload), `${slugify(payload.title)}.pdf`, 'application/pdf')
  showToast('Fichier PDF téléchargé.')
}

function showToast(message) {
  toastMessage.value = message
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}

function buildReportPayload(report = null) {
  return {
    title: report?.title || `${activeReportLabel.value} - ${selectedPeriod.value}`,
    period: selectedPeriod.value,
    generatedAt: report?.generatedAt || '18/07/2026',
    generatedBy: report?.generatedBy || 'Super Admin',
    kpis: kpiCards.map(({ label, value }) => ({ label, value })),
    columns: tableConfig.value.columns,
    rows: tableConfig.value.rows,
  }
}

function createCsvContent(payload) {
  const intro = [
    ['SmartCalyx'],
    [payload.title],
    ['Période', payload.period],
    ['Généré le', payload.generatedAt],
    ['Généré par', payload.generatedBy],
    [],
    ['Résumé KPI'],
    ...payload.kpis.map((item) => [item.label, item.value]),
    [],
    payload.columns,
    ...payload.rows.map((row) => payload.columns.map((column) => row[column] || '')),
  ]

  return `\uFEFF${intro.map((line) => line.map(escapeCsvCell).join(';')).join('\n')}`
}

function createPdfContent(payload) {
  const lines = [
    'SmartCalyx',
    payload.title,
    `Periode: ${payload.period}`,
    `Genere le: ${payload.generatedAt}`,
    `Genere par: ${payload.generatedBy}`,
    '',
    'Resume KPI',
    ...payload.kpis.map((item) => `${item.label}: ${item.value}`),
    '',
    'Tableau recapitulatif',
    payload.columns.join(' | '),
    ...payload.rows.slice(0, 10).map((row) => payload.columns.map((column) => row[column] || '-').join(' | ')),
    '',
    'Signature / validation: Responsable Maintenance',
  ]

  return buildSimplePdf(lines)
}

function buildSimplePdf(lines) {
  const pageWidth = 595
  const pageHeight = 842
  const content = [
    'BT',
    '/F1 11 Tf',
    '50 790 Td',
    ...lines.flatMap((line, index) => {
      const sizeCommand = index === 0 ? ['/F1 18 Tf'] : index === 1 ? ['/F1 15 Tf'] : index === 6 ? ['/F1 13 Tf'] : ['/F1 10 Tf']
      return [...sizeCommand, `(${escapePdfText(toPdfText(line)).slice(0, 118)}) Tj`, '0 -18 Td']
    }),
    'ET',
  ].join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function escapePdfText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function toPdfText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
}

function slugify(value) {
  return toPdfText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'rapport-smartcalyx'
}
</script>

<style scoped>
.reports-page {
  min-height: 100vh;
  padding: 46px 38px 56px 116px;
  background: #f7f9f3;
  color: #4a0a0a;
  font-family: Arial, Helvetica, sans-serif;
}

.sidebar-toggle {
  position: fixed;
  top: 130px;
  left: 34px;
  z-index: 80;
  width: 58px;
  height: 58px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #edf0e8;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(74, 10, 10, 0.08);
  cursor: pointer;
}

.sidebar-toggle span {
  width: 24px;
  height: 3px;
  border-radius: 999px;
  background: #4a0a0a;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(15, 23, 42, 0.18);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.breadcrumb {
  margin: 0 0 14px;
  color: #6a9a2a;
  font-size: 13px;
  font-weight: 900;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 0;
}

.page-header p:last-child {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 15px;
}

.view-switcher {
  width: max-content;
  display: flex;
  gap: 4px;
  padding: 5px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #edf0e8;
  border-radius: 16px;
}

.view-switcher button {
  height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  font-weight: 900;
  cursor: pointer;
}

.view-switcher button.active {
  background: #eef5df;
  color: #6a9a2a;
}

.reports-page :deep(.kpi-grid),
.reports-page :deep(.filters-bar),
.reports-page :deep(.type-grid),
.reports-page :deep(.charts-grid),
.reports-page :deep(.charts-section),
.reports-page :deep(.table-card),
.history-card {
  margin-bottom: 22px;
}

.history-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0e8;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
}

.history-header,
.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.history-header {
  padding: 22px 24px;
  border-bottom: 1px solid #edf0e8;
}

.history-header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.history-header p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 12px;
}

.history-header button,
.history-row button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.history-header button {
  background: #6a9a2a;
  border: 1px solid #6a9a2a;
  color: #fff;
}

.history-list {
  display: grid;
}

.history-row {
  padding: 18px 24px;
  border-top: 1px solid #edf0e8;
}

.history-row:first-child {
  border-top: 0;
}

.history-row strong {
  display: block;
  color: #4a0a0a;
  font-size: 15px;
}

.history-row span {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.history-row button {
  background: #fff;
  border: 1px solid #dfe5d6;
  color: #4a0a0a;
}

.toast {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 10000;
  padding: 13px 16px;
  background: #4a0a0a;
  color: #fff;
  border-radius: 14px;
  box-shadow: 0 14px 32px rgba(74, 10, 10, 0.18);
  font-weight: 900;
}

.toast-enter-active,
.toast-leave-active {
  transition: 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 980px) {
  .reports-page {
    padding: 34px 20px 44px 92px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 620px) {
  .reports-page {
    padding: 92px 14px 36px;
  }

  .sidebar-toggle {
    top: 20px;
    left: 16px;
  }

  .page-header h1 {
    font-size: 30px;
  }

  .view-switcher,
  .view-switcher button {
    width: 100%;
  }

  .history-header,
  .history-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
