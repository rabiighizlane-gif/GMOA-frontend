<template>
  <section class="charts-section" :class="{ 'is-arabic': language === 'AR' }">
    <article v-for="chart in orderedCharts" :key="chart.key" class="chart-card">
      <header><div><h3>{{ chart.title }}</h3><p>{{ chart.subtitle }}</p></div><span>{{ chart.tag }}</span></header>
      <apexchart :type="chart.type" height="250" :options="chart.options" :series="chart.series" />
      <p v-if="chart.note" class="chart-note">{{ chart.note }}</p>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLanguageStore } from '@/stores/language'

const apexchart = VueApexCharts
const props = defineProps({ machines: { type: Array, default: () => [] } })
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const base = { fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, speed: 800 } }
const statusValues = ['En service', 'En maintenance', 'En panne', 'Hors service']

const labels = {
  FR: {
    statusTitle: 'Machines par etat',
    statusSubtitle: 'Repartition du parc',
    singleStatus: 'Toutes les machines chargees ont le meme etat.',
    statusTag: 'Etat',
    lineTitle: 'Disponibilite par ligne',
    lineSubtitle: 'Moyenne par ligne',
    unstableTitle: 'Top machines instables',
    unstableSubtitle: 'Nombre de pannes',
    availability: 'Disponibilite',
    breakdowns: 'Pannes',
    statuses: ['En service', 'En maintenance', 'En panne', 'Hors service'],
    lines: {},
    names: {},
  },
  EN: {
    statusTitle: 'Machines by status',
    statusSubtitle: 'Fleet breakdown',
    singleStatus: 'All loaded machines currently have the same status.',
    statusTag: 'Status',
    lineTitle: 'Availability by line',
    lineSubtitle: 'Average by line',
    unstableTitle: 'Most unstable machines',
    unstableSubtitle: 'Breakdown count',
    availability: 'Availability',
    breakdowns: 'Breakdowns',
    statuses: ['In service', 'In maintenance', 'Broken down', 'Out of service'],
    lines: {},
    names: {},
  },
  AR: {
    statusTitle: '\u0627\u0644\u0622\u0644\u0627\u062a \u062d\u0633\u0628 \u0627\u0644\u062d\u0627\u0644\u0629',
    statusSubtitle: '\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0623\u0633\u0637\u0648\u0644',
    singleStatus: '\u0643\u0644 \u0627\u0644\u0622\u0644\u0627\u062a \u0627\u0644\u0645\u062d\u0645\u0644\u0629 \u0644\u0647\u0627 \u0646\u0641\u0633 \u0627\u0644\u062d\u0627\u0644\u0629.',
    statusTag: '\u0627\u0644\u062d\u0627\u0644\u0629',
    lineTitle: '\u0627\u0644\u062a\u0648\u0641\u0631 \u062d\u0633\u0628 \u0627\u0644\u062e\u0637',
    lineSubtitle: '\u0627\u0644\u0645\u062a\u0648\u0633\u0637 \u062d\u0633\u0628 \u0627\u0644\u062e\u0637',
    unstableTitle: '\u0623\u0643\u062b\u0631 \u0627\u0644\u0622\u0644\u0627\u062a \u0639\u062f\u0645 \u0627\u0633\u062a\u0642\u0631\u0627\u0631',
    unstableSubtitle: '\u0639\u062f\u062f \u0627\u0644\u0623\u0639\u0637\u0627\u0644',
    availability: '\u0627\u0644\u062a\u0648\u0641\u0631',
    breakdowns: '\u0627\u0644\u0623\u0639\u0637\u0627\u0644',
    statuses: ['\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', '\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629', '\u0641\u064a \u0639\u0637\u0644', '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629'],
    lines: {},
    names: {},
  },
}

const content = computed(() => labels[language.value] || labels.FR)
const statusSeries = computed(() => statusValues.map((status) => props.machines.filter((m) => m.status === status).length))
const activeStatusCount = computed(() => statusSeries.value.filter((count) => count > 0).length)
const statusOptions = computed(() => ({ chart: { type: 'donut', ...base, foreColor: 'var(--sc-muted)' }, labels: content.value.statuses, colors: ['#83B95C', '#E4AB44', '#DC3747', '#94A3B8'], stroke: { width: 3, colors: ['var(--sc-surface)'] }, dataLabels: { enabled: false }, legend: { position: 'bottom', fontSize: '10px', labels: { colors: 'var(--sc-muted)' } } }))
const availabilityMachines = computed(() => props.machines.filter((machine) => typeof machine.availability === 'number' && Number.isFinite(machine.availability)))
const lineLabels = computed(() => [...new Set(availabilityMachines.value.map((m) => m.line))])
const displayLineLabels = computed(() => lineLabels.value.map((line) => content.value.lines[line] || line))
const lineSeries = computed(() => [{ name: content.value.availability, data: lineLabels.value.map((line) => { const items = availabilityMachines.value.filter((m) => m.line === line); return Math.round(items.reduce((sum, m) => sum + m.availability, 0) / items.length) }) }])
const lineOptions = computed(() => ({ chart: { type: 'bar', ...base, foreColor: 'var(--sc-muted)' }, colors: ['#83B95C'], plotOptions: { bar: { borderRadius: 7, columnWidth: '46%' } }, dataLabels: { enabled: false }, xaxis: { categories: displayLineLabels.value }, yaxis: { max: 100 }, grid: { borderColor: 'var(--sc-border)', strokeDashArray: 4 } }))
const unstable = computed(() => props.machines.filter((machine) => typeof machine.breakdownCount === 'number' && Number.isFinite(machine.breakdownCount)).sort((a, b) => b.breakdownCount - a.breakdownCount).slice(0, 5))
const unstableSeries = computed(() => [{ name: content.value.breakdowns, data: unstable.value.map((m) => m.breakdownCount) }])
const machineLabel = (machine) => content.value.names[machine.name] || machine.name || machine.id
const unstableOptions = computed(() => ({
  chart: { type: 'bar', ...base, foreColor: 'var(--sc-muted)' },
  colors: ['#DC3747'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } },
  dataLabels: { enabled: true },
  xaxis: { categories: unstable.value.map(machineLabel), labels: { show: false } },
  yaxis: { labels: { show: true, maxWidth: 140 } },
  grid: { show: false },
}))
const chartCards = computed(() => [
  {
    key: 'status',
    title: content.value.statusTitle,
    subtitle: content.value.statusSubtitle,
    tag: content.value.statusTag,
    type: 'donut',
    options: statusOptions.value,
    series: statusSeries.value,
    note: props.machines.length > 0 && activeStatusCount.value === 1 ? content.value.singleStatus : '',
  },
  {
    key: 'line',
    title: content.value.lineTitle,
    subtitle: content.value.lineSubtitle,
    tag: '%',
    type: 'bar',
    options: lineOptions.value,
    series: lineSeries.value,
  },
  {
    key: 'unstable',
    title: content.value.unstableTitle,
    subtitle: content.value.unstableSubtitle,
    tag: 'Top 5',
    type: 'bar',
    options: unstableOptions.value,
    series: unstableSeries.value,
  },
].filter((chart) => {
  if (chart.key === 'line') return lineLabels.value.length > 0
  if (chart.key === 'unstable') return unstable.value.length > 0
  return true
}))
const orderedCharts = computed(() => {
  if (language.value !== 'AR') return chartCards.value

  return [...chartCards.value].reverse()
})
</script>

<style scoped>
.charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; overflow: hidden; }
.charts-section.is-arabic { direction: ltr; }
.charts-section.is-arabic .chart-card { direction: rtl; }
.chart-card { min-width: 0; overflow: hidden; padding: 20px; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); transition: .2s ease; }
.chart-card:hover { transform: translateY(-2px); border-color: rgba(91, 155, 215, 0.46); box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 46px rgba(0,0,0,.28); }
.chart-card header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.chart-card h3 { margin: 0; color: #f8fbff; font-size: 15px; font-weight: 900; }
.chart-card p { margin: 5px 0 0; color: #8d9aab; font-size: 11px; }
.chart-card header > span { padding: 6px 9px; background: rgba(131, 185, 92, 0.18); border-radius: 999px; color: #bce39d; font-size: 10px; font-weight: 900; }
.chart-card :deep(.vue-apexcharts), .chart-card :deep(.apexcharts-canvas) { width: 100% !important; max-width: 100%; }
.chart-note { margin: 10px 0 0 !important; color: #aeb9c8 !important; font-size: 12px !important; font-weight: 800; }
@media (max-width: 1200px) { .charts-section { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 750px) { .charts-section { grid-template-columns: 1fr; } }
</style>
