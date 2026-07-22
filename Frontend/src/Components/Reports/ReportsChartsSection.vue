<template>
  <section v-if="reportType === 'interventions'" class="charts-grid" :aria-label="content.interventionsCharts">
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

  <section v-else-if="reportType === 'technicians'" class="charts-grid" :aria-label="content.techniciansCharts">
    <TopTechniciansChart />
    <AverageTimeChart />
    <SlaGauge />
    <PriorityChart />
  </section>

  <section v-else class="charts-grid" :aria-label="content.reportsCharts">
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
import { useLanguageStore } from '@/stores/language'
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
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const props = defineProps({
  reportType: {
    type: String,
    default: 'interventions',
  },
})

const content = computed(() => ({
  FR: {
    interventionsCharts: 'Graphiques interventions',
    techniciansCharts: 'Graphiques techniciens',
    reportsCharts: 'Graphiques rapports',
  },
  EN: {
    interventionsCharts: 'Intervention charts',
    techniciansCharts: 'Technician charts',
    reportsCharts: 'Report charts',
  },
  AR: {
    interventionsCharts: 'رسوم بيانية للتدخلات',
    techniciansCharts: 'رسوم بيانية للتقنيين',
    reportsCharts: 'رسوم بيانية للتقارير',
  },
})[language.value] || {})

const chartBase = {
  fontFamily: 'inherit',
  toolbar: { show: false },
  animations: { enabled: true, speed: 800 },
}

const machinesData = [
  { id: 'M-102', line: 'Ligne Production 1', status: 'En service', availability: 96, breakdownCount: 2 },
  { id: 'M-215', line: 'Ligne Production 2', status: 'En maintenance', availability: 88, breakdownCount: 5 },
  { id: 'M-309', line: 'Ligne Conditionnement', status: 'En panne', availability: 72, breakdownCount: 7 },
  { id: 'M-412', line: 'Ligne Utilites', status: 'En service', availability: 94, breakdownCount: 4 },
  { id: 'M-518', line: 'Ligne Conditionnement', status: 'Hors service', availability: 66, breakdownCount: 3 },
]

const months = computed(() => ({
  FR: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
  EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  AR: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول'],
})[language.value] || [])

const customCharts = computed(() => {
  if (props.reportType === 'breakdowns') {
    const text = {
      FR: [
        ['Pannes par mois', 'Meme lecture que le suivi des pannes', 'Pannes'],
        ['Gravite des pannes', 'Critique, haute et moyenne', 'Priorite'],
        ['Machines impactees', 'Top machines en panne', 'Top 5'],
        ["Duree d'arret", 'Heures perdues par mois', 'Heures'],
      ],
      EN: [
        ['Breakdowns by month', 'Same view as breakdown tracking', 'Breakdowns'],
        ['Breakdown severity', 'Critical, high, and medium', 'Priority'],
        ['Impacted machines', 'Top failed machines', 'Top 5'],
        ['Downtime duration', 'Lost hours by month', 'Hours'],
      ],
      AR: [
        ['الأعطال حسب الشهر', 'نفس قراءة تتبع الأعطال', 'الأعطال'],
        ['خطورة الأعطال', 'حرجة، عالية ومتوسطة', 'الأولوية'],
        ['الآلات المتأثرة', 'أكثر الآلات تعطلا', 'Top 5'],
        ['مدة التوقف', 'الساعات المفقودة حسب الشهر', 'ساعات'],
      ],
    }[language.value]
    const priorities = {
      FR: ['Critique', 'Haute', 'Moyenne'],
      EN: ['Critical', 'High', 'Medium'],
      AR: ['حرجة', 'عالية', 'متوسطة'],
    }[language.value]

    return [
      barChart(text[0][0], text[0][1], text[0][2], months.value, [4, 7, 5, 8, 6, 9, 12], '#DC3747'),
      donutChart(text[1][0], text[1][1], text[1][2], priorities, [12, 22, 18], ['#DC3747', '#F97316', '#FACC15']),
      horizontalChart(text[2][0], text[2][1], text[2][2], ['M-309', 'M-215', 'P-204', 'M-412', 'M-102'], [7, 5, 4, 3, 2], '#DC3747'),
      areaChart(text[3][0], text[3][1], text[3][2], months.value, [8, 14, 11, 18, 13, 20, 24], '#F97316'),
    ]
  }

  const text = {
    FR: [
      ['Cout par ligne', 'Maintenance par secteur', 'DH'],
      ['Evolution des couts', 'Budget mensuel en DH', '2026'],
      ['Repartition des couts', "Pieces, main-d'oeuvre et arrets", 'Mix'],
      ['Machines les plus couteuses', 'Top couts maintenance', 'Top 5'],
    ],
    EN: [
      ['Cost by line', 'Maintenance by sector', 'DH'],
      ['Cost trend', 'Monthly budget in DH', '2026'],
      ['Cost distribution', 'Parts, labor, and stoppages', 'Mix'],
      ['Most expensive machines', 'Top maintenance costs', 'Top 5'],
    ],
    AR: [
      ['الكلفة حسب الخط', 'الصيانة حسب القطاع', 'درهم'],
      ['تطور التكاليف', 'الميزانية الشهرية بالدرهم', '2026'],
      ['توزيع التكاليف', 'القطع، اليد العاملة والتوقفات', 'Mix'],
      ['أعلى الآلات تكلفة', 'أعلى تكاليف الصيانة', 'Top 5'],
    ],
  }[language.value]
  const lines = {
    FR: ['Production 1', 'Production 2', 'Conditionnement', 'Utilites'],
    EN: ['Production 1', 'Production 2', 'Conditioning', 'Utilities'],
    AR: ['الإنتاج 1', 'الإنتاج 2', 'التكييف', 'المرافق'],
  }[language.value]
  const costLabels = {
    FR: ['Pieces', "Main-d'oeuvre", 'Arret machine'],
    EN: ['Parts', 'Labor', 'Machine stoppage'],
    AR: ['القطع', 'اليد العاملة', 'توقف الآلة'],
  }[language.value]

  return [
    barChart(text[0][0], text[0][1], text[0][2], lines, [12400, 18600, 9600, 8000], '#38BDF8'),
    areaChart(text[1][0], text[1][1], text[1][2], months.value, [32, 36, 34, 41, 39, 45, 48], '#F97316'),
    donutChart(text[2][0], text[2][1], text[2][2], costLabels, [45, 25, 30], ['#83B95C', '#FACC15', '#DC3747']),
    horizontalChart(text[3][0], text[3][1], text[3][2], ['P-204', 'M-215', 'M-309', 'M-412', 'M-102'], [9600, 8200, 7600, 5400, 4200], '#DC3747'),
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
      xaxis: { categories, labels: { style: { colors: '#AAB7C7', fontFamily: 'inherit' } } },
      yaxis: { labels: { style: { colors: '#AAB7C7', fontFamily: 'inherit' } } },
      grid: { borderColor: 'rgba(126, 146, 170, 0.18)', strokeDashArray: 4 },
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
      xaxis: { categories, labels: { style: { colors: '#AAB7C7', fontFamily: 'inherit' } } },
      yaxis: { labels: { style: { colors: '#AAB7C7', fontFamily: 'inherit' } } },
      grid: { borderColor: 'rgba(126, 146, 170, 0.18)', strokeDashArray: 4 },
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
      stroke: { width: 4, colors: ['#111927'] },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontSize: '10px', labels: { colors: '#AAB7C7' } },
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
      dataLabels: { enabled: true, style: { colors: ['#F8FBFF'] } },
      xaxis: { categories, labels: { show: false } },
      yaxis: { labels: { style: { colors: '#D7E0EC', fontFamily: 'inherit' } } },
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
  background: rgba(17, 27, 38, 0.92);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
  transition: 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 20px 44px rgba(0, 0, 0, 0.28);
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
  color: #f8fbff;
  font-size: 15px;
  font-weight: 900;
}

.chart-card p {
  margin: 5px 0 0;
  color: #8d9aab;
  font-size: 11px;
}

.chart-card header > span {
  height: max-content;
  padding: 6px 9px;
  background: rgba(131, 185, 92, 0.18);
  border-radius: 999px;
  color: #bce39d;
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
