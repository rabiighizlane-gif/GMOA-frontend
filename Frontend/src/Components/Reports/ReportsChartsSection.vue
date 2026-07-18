<template>
  <section v-if="reportType === 'interventions'" class="charts-grid" aria-label="Graphiques interventions">
    <InterventionsByMonth />
    <InterventionTypesChart />
    <TopTechniciansChart />
    <AverageTimeChart />
    <PriorityChart />
    <SlaGauge />
  </section>

  <MachinesChartsSection v-else-if="reportType === 'machines'" :machines="machinesData" />

  <PreventiveChartsSection v-else-if="reportType === 'preventive'" />

  <SparePartsChartsSection v-else-if="reportType === 'spareParts'" />

  <section v-else-if="reportType === 'technicians'" class="charts-grid" aria-label="Graphiques techniciens">
    <TopTechniciansChart />
    <AverageTimeChart />
    <SlaGauge />
    <PriorityChart />
  </section>

  <section v-else class="charts-grid" aria-label="Graphiques rapports">
    <article v-for="chart in customCharts" :key="chart.title" class="chart-card">
      <header>
        <div>
          <h3>{{ chart.title }}</h3>
          <p>{{ chart.subtitle }}</p>
        </div>
        <span>{{ chart.badge }}</span>
      </header>
      <apexchart :type="chart.type" height="250" :options="chart.options" :series="chart.series" />
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import AverageTimeChart from '@/Components/charts/AverageTimeChart.vue'
import InterventionTypesChart from '@/Components/charts/InterventionTypesChart.vue'
import InterventionsByMonth from '@/Components/charts/InterventionsByMonth.vue'
import MachinesChartsSection from '@/Components/Machines/MachinesChartsSection.vue'
import PreventiveChartsSection from '@/Components/PreventiveMaintenance/PreventiveChartsSection.vue'
import PriorityChart from '@/Components/charts/PriorityChart.vue'
import SlaGauge from '@/Components/charts/SlaGauge.vue'
import SparePartsChartsSection from '@/Components/SpareParts/SparePartsChartsSection.vue'
import TopTechniciansChart from '@/Components/charts/TopTechniciansChart.vue'

const apexchart = VueApexCharts

const props = defineProps({
  reportType: {
    type: String,
    default: 'interventions',
  },
})

const chartBase = {
  fontFamily: 'inherit',
  toolbar: { show: false },
  animations: { enabled: true, speed: 800 },
}

const machinesData = [
  {
    id: 'M-102',
    line: 'Ligne Production 1',
    status: 'En service',
    availability: 96,
    breakdownCount: 2,
  },
  {
    id: 'M-215',
    line: 'Ligne Production 2',
    status: 'En maintenance',
    availability: 88,
    breakdownCount: 5,
  },
  {
    id: 'M-309',
    line: 'Ligne Conditionnement',
    status: 'En panne',
    availability: 72,
    breakdownCount: 7,
  },
  {
    id: 'M-412',
    line: 'Ligne Utilités',
    status: 'En service',
    availability: 94,
    breakdownCount: 4,
  },
  {
    id: 'M-518',
    line: 'Ligne Conditionnement',
    status: 'Hors service',
    availability: 66,
    breakdownCount: 3,
  },
]

const customCharts = computed(() => {
  if (props.reportType === 'breakdowns') {
    return [
      barChart('Pannes par mois', 'Même lecture que le suivi des pannes', 'Pannes', ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'], [4, 7, 5, 8, 6, 9, 12], '#E31E24'),
      donutChart('Gravité des pannes', 'Critique, warning et attention', 'Priorité', ['Critical', 'Warning', 'Attention'], [12, 22, 18], ['#E31E24', '#FF6A00', '#E8B300']),
      horizontalChart('Machines impactées', 'Top machines en panne', 'Top 5', ['M-309', 'M-215', 'P-204', 'M-412', 'M-102'], [7, 5, 4, 3, 2], '#E31E24'),
      areaChart('Durée d’arrêt', 'Heures perdues par mois', 'Heures', ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'], [8, 14, 11, 18, 13, 20, 24], '#FF6A00'),
    ]
  }

  return [
    barChart('Coût par ligne', 'Maintenance par secteur', 'DH', ['Production 1', 'Production 2', 'Conditionnement', 'Utilités'], [12400, 18600, 9600, 8000], '#4A0A0A'),
    areaChart('Évolution des coûts', 'Budget mensuel en DH', '2026', ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'], [32, 36, 34, 41, 39, 45, 48], '#FF6A00'),
    donutChart('Répartition des coûts', 'Pièces, main-d’œuvre et arrêts', 'Mix', ['Pièces', 'Main-d’œuvre', 'Arrêt machine'], [45, 25, 30], ['#6A9A2A', '#E8B300', '#E31E24']),
    horizontalChart('Machines les plus coûteuses', 'Top coûts maintenance', 'Top 5', ['P-204', 'M-215', 'M-309', 'M-412', 'M-102'], [9600, 8200, 7600, 5400, 4200], '#E31E24'),
  ]
})

function barChart(title, subtitle, badge, categories, data, color) {
  return {
    title,
    subtitle,
    badge,
    type: 'bar',
    series: [{ name: title, data }],
    options: {
      chart: { type: 'bar', ...chartBase },
      colors: [color],
      plotOptions: { bar: { borderRadius: 7, columnWidth: '46%' } },
      dataLabels: { enabled: false },
      xaxis: { categories },
      grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
    },
  }
}

function areaChart(title, subtitle, badge, categories, data, color) {
  return {
    title,
    subtitle,
    badge,
    type: 'area',
    series: [{ name: title, data }],
    options: {
      chart: { type: 'area', ...chartBase },
      colors: [color],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
      xaxis: { categories },
      grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
    },
  }
}

function donutChart(title, subtitle, badge, labels, series, colors) {
  return {
    title,
    subtitle,
    badge,
    type: 'donut',
    series,
    options: {
      chart: { type: 'donut', ...chartBase },
      labels,
      colors,
      stroke: { width: 4, colors: ['#fff'] },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontSize: '10px' },
    },
  }
}

function horizontalChart(title, subtitle, badge, categories, data, color) {
  return {
    title,
    subtitle,
    badge,
    type: 'bar',
    series: [{ name: title, data }],
    options: {
      chart: { type: 'bar', ...chartBase },
      colors: [color],
      plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } },
      dataLabels: { enabled: true },
      xaxis: { categories, labels: { show: false } },
      grid: { show: false },
    },
  }
}
</script>

<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.08);
}

.chart-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 8px;
}

.chart-card h3 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 900;
}

.chart-card p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.chart-card header > span {
  height: max-content;
  padding: 6px 9px;
  background: #eff5df;
  border-radius: 999px;
  color: #6a9a2a;
  font-size: 10px;
  font-weight: 900;
}

.chart-card :deep(.vue-apexcharts),
.chart-card :deep(.apexcharts-canvas) {
  width: 100% !important;
  max-width: 100%;
}

@media (max-width: 1300px) {
  .charts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
