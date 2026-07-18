<template>
  <section class="charts-section">
    <article class="chart-card"><header><div><h3>Machines par état</h3><p>Répartition du parc</p></div><span>État</span></header><apexchart type="donut" height="250" :options="statusOptions" :series="statusSeries" /></article>
    <article class="chart-card"><header><div><h3>Disponibilité par ligne</h3><p>Moyenne par ligne</p></div><span>%</span></header><apexchart type="bar" height="250" :options="lineOptions" :series="lineSeries" /></article>
    <article class="chart-card"><header><div><h3>Top machines instables</h3><p>Nombre de pannes</p></div><span>Top 5</span></header><apexchart type="bar" height="250" :options="unstableOptions" :series="unstableSeries" /></article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
const apexchart = VueApexCharts
const props = defineProps({ machines: { type: Array, default: () => [] } })
const base = { fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, speed: 800 } }
const statusLabels = ['En service', 'En maintenance', 'En panne', 'Hors service']
const statusSeries = computed(() => statusLabels.map((status) => props.machines.filter((m) => m.status === status).length))
const statusOptions = { chart: { type: 'donut', ...base }, labels: statusLabels, colors: ['#6A9A2A', '#FF6A00', '#E31E24', '#64748B'], stroke: { width: 4, colors: ['#fff'] }, dataLabels: { enabled: false }, legend: { position: 'bottom', fontSize: '10px' } }
const lineLabels = computed(() => [...new Set(props.machines.map((m) => m.line))])
const lineSeries = computed(() => [{ name: 'Disponibilité', data: lineLabels.value.map((line) => { const items = props.machines.filter((m) => m.line === line); return Math.round(items.reduce((sum, m) => sum + m.availability, 0) / Math.max(1, items.length)) }) }])
const lineOptions = computed(() => ({ chart: { type: 'bar', ...base }, colors: ['#6A9A2A'], plotOptions: { bar: { borderRadius: 7, columnWidth: '46%' } }, dataLabels: { enabled: false }, xaxis: { categories: lineLabels.value }, yaxis: { max: 100 }, grid: { borderColor: '#EEF1E9', strokeDashArray: 4 } }))
const unstable = computed(() => [...props.machines].sort((a, b) => b.breakdownCount - a.breakdownCount).slice(0, 5))
const unstableSeries = computed(() => [{ name: 'Pannes', data: unstable.value.map((m) => m.breakdownCount) }])
const unstableOptions = computed(() => ({ chart: { type: 'bar', ...base }, colors: ['#E31E24'], plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } }, dataLabels: { enabled: true }, xaxis: { categories: unstable.value.map((m) => m.id), labels: { show: false } }, grid: { show: false } }))
</script>

<style scoped>
.charts-section { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; overflow: hidden; }
.chart-card { min-width: 0; overflow: hidden; padding: 20px; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74,10,10,.05); transition: .2s ease; }
.chart-card:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(74,10,10,.08); }
.chart-card header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.chart-card h3 { margin: 0; color: #111827; font-size: 15px; font-weight: 900; }
.chart-card p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.chart-card header > span { padding: 6px 9px; background: #eff5df; border-radius: 999px; color: #6a9a2a; font-size: 10px; font-weight: 900; }
.chart-card :deep(.vue-apexcharts), .chart-card :deep(.apexcharts-canvas) { width: 100% !important; max-width: 100%; }
@media (max-width: 1200px) { .charts-section { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 750px) { .charts-section { grid-template-columns: 1fr; } }
</style>
