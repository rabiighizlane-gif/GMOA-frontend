<template>
  <section class="charts-section">
    <article class="chart-card">
      <header><div><h3>Demandes par mois</h3><p>Volume sur 7 mois</p></div><span>2026</span></header>
      <apexchart type="bar" height="250" :options="monthlyOptions" :series="monthlySeries" />
    </article>
    <article class="chart-card">
      <header><div><h3>Répartition par statut</h3><p>État du workflow</p></div><span>Statuts</span></header>
      <apexchart type="donut" height="250" :options="statusOptions" :series="statusSeries" />
    </article>
    <article class="chart-card">
      <header><div><h3>Évolution quotidienne</h3><p>14 derniers jours</p></div><span>Daily</span></header>
      <apexchart type="area" height="250" :options="dailyOptions" :series="dailySeries" />
    </article>
    <article class="chart-card">
      <header><div><h3>Répartition par priorité</h3><p>Niveau d’urgence</p></div><span>Priorités</span></header>
      <apexchart type="bar" height="250" :options="priorityOptions" :series="prioritySeries" />
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts
const props = defineProps({
  requests: { type: Array, default: () => [] }
})

const chartBase = { fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, speed: 800 } }
const monthlySeries = [{ name: 'Demandes', data: [12, 16, 15, 18, 21, 19, 25] }]
const monthlyOptions = { chart: { type: 'bar', ...chartBase }, colors: ['#6A9A2A'], plotOptions: { bar: { borderRadius: 7, columnWidth: '46%' } }, dataLabels: { enabled: false }, xaxis: { categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'] }, grid: { borderColor: '#EEF1E9', strokeDashArray: 4 } }

const statusLabels = ['En attente', 'Acceptée', 'Refusée', 'Intervention créée']
const statusSeries = computed(() => statusLabels.map((status) => props.requests.filter((request) => request.status === status).length))
const statusOptions = { chart: { type: 'donut', ...chartBase }, labels: statusLabels, colors: ['#E8B300', '#6A9A2A', '#E31E24', '#B6C65B'], stroke: { width: 4, colors: ['#FFFFFF'] }, dataLabels: { enabled: false }, legend: { position: 'bottom', fontSize: '10px' } }

const dailySeries = [{ name: 'Demandes', data: [3, 5, 4, 6, 7, 5, 8, 6, 7, 9, 6, 8, 10, 8] }]
const dailyOptions = { chart: { type: 'area', ...chartBase }, colors: ['#6A9A2A'], dataLabels: { enabled: false }, stroke: { curve: 'smooth', width: 3 }, fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.02 } }, xaxis: { categories: ['J-13', 'J-12', 'J-11', 'J-10', 'J-9', 'J-8', 'J-7', 'J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'Hier', 'Auj.'] }, grid: { borderColor: '#EEF1E9', strokeDashArray: 4 } }

const priorityLabels = ['Critique', 'Haute', 'Moyenne', 'Faible']
const prioritySeries = computed(() => [{ name: 'Demandes', data: priorityLabels.map((priority) => props.requests.filter((request) => request.priority === priority).length) }])
const priorityOptions = { chart: { type: 'bar', ...chartBase }, colors: ['#FF6A00'], plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } }, dataLabels: { enabled: true }, xaxis: { categories: priorityLabels, labels: { show: false } }, grid: { show: false } }
</script>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  overflow: hidden;
}

.chart-card {
  min-width: 0;
  overflow: hidden;
  padding: 20px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
  transition: 0.2s ease;
}

.chart-card:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(74, 10, 10, 0.08); }
.chart-card header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.chart-card h3 { margin: 0; color: #111827; font-size: 15px; font-weight: 900; }
.chart-card p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.chart-card header > span { padding: 6px 9px; background: #eff5df; border-radius: 999px; color: #6a9a2a; font-size: 10px; font-weight: 900; }
.chart-card :deep(.vue-apexcharts), .chart-card :deep(.apexcharts-canvas) { width: 100% !important; max-width: 100%; }
@media (max-width: 1400px) { .charts-section { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 750px) { .charts-section { grid-template-columns: 1fr; } }
</style>
