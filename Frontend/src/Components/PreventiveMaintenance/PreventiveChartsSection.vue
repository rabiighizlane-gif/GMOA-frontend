<template>
  <section class="charts-section">
    <article class="chart-card">
      <header>
        <div>
          <h3>{{ content.monthlyTitle }}</h3>
          <p>{{ content.monthlySubtitle }}</p>
        </div>
        <span>2026</span>
      </header>
      <div v-if="preventiveChartLoading" class="chart-state" role="status">
        Chargement des donnees...
      </div>
      <div v-else-if="preventiveChartErrorMessage" class="chart-state chart-state--error" role="alert">
        {{ preventiveChartErrorMessage }}
      </div>
      <div v-else-if="!hasPreventiveChartData" class="chart-state">
        Aucune donnee disponible
      </div>
      <apexchart v-else type="bar" height="300" :options="preventiveChartOptions" :series="preventiveChartSeries" />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>{{ content.slaTitle }}</h3>
          <p>{{ content.slaSubtitle }}</p>
        </div>
        <span>SLA</span>
      </header>
      <apexchart type="radialBar" height="260" :options="slaOptions" :series="slaSeries" />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>{{ content.frequencyTitle }}</h3>
          <p>{{ content.frequencySubtitle }}</p>
        </div>
        <span>Mix</span>
      </header>
      <div v-if="loading" class="chart-state" role="status">
        Chargement des donnees...
      </div>
      <div v-else-if="errorMessage" class="chart-state chart-state--error" role="alert">
        {{ errorMessage }}
      </div>
      <div v-else-if="!hasDistributionData" class="chart-state">
        Aucune donnee disponible
      </div>
      <apexchart v-else type="bar" height="300" :options="chartOptions" :series="chartSeries" />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>{{ content.lateTitle }}</h3>
          <p>{{ content.lateSubtitle }}</p>
        </div>
        <span>{{ content.alerts }}</span>
      </header>
      <apexchart type="bar" height="260" :options="lateOptions" :series="lateSeries" />
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import VueApexCharts from 'vue3-apexcharts'
import { getPreventiveChart, getPreventiveDistribution } from '@/services/dashboardService'

const apexchart = VueApexCharts
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: {
    monthlyTitle: 'Suivi mensuel de la maintenance preventive',
    monthlySubtitle: 'Comparaison des operations planifiees, realisees et en retard',
    slaTitle: 'Respect du planning',
    slaSubtitle: 'Maintenances realisees a temps',
    frequencyTitle: 'Repartition de la maintenance preventive',
    frequencySubtitle: 'Nombre de machines par periodicite et par usine',
    lateTitle: 'Retards par ligne',
    lateSubtitle: 'Plans necessitant une action',
    alerts: 'Alertes',
    completedName: 'Maintenances realisees',
    maintenanceUnit: 'maintenances',
    planUnit: 'plans',
    onTime: 'A temps',
    totalPlans: 'Plans',
    overdueName: 'Plans en retard',
    months: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    frequencies: ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Annuelle'],
    lines: ['Conditionnement', 'Production 1', 'Utilites', 'Emballage'],
  },
  EN: {
    monthlyTitle: 'Monthly preventive maintenance tracking',
    monthlySubtitle: 'Comparison of planned, completed, and overdue operations',
    slaTitle: 'Schedule compliance',
    slaSubtitle: 'Maintenance completed on time',
    frequencyTitle: 'Preventive maintenance distribution',
    frequencySubtitle: 'Number of machines by frequency and factory',
    lateTitle: 'Overdue by line',
    lateSubtitle: 'Plans requiring action',
    alerts: 'Alerts',
    completedName: 'Completed maintenance',
    maintenanceUnit: 'maintenance tasks',
    planUnit: 'plans',
    onTime: 'On time',
    totalPlans: 'Plans',
    overdueName: 'Overdue plans',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    frequencies: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
    lines: ['Packaging', 'Production 1', 'Utilities', 'Packing'],
  },
  AR: {
    monthlyTitle: 'الصيانات الوقائية المنجزة',
    monthlySubtitle: 'التطور الشهري',
    slaTitle: 'احترام التخطيط',
    slaSubtitle: 'الصيانات المنجزة في وقتها',
    frequencyTitle: 'التوزيع حسب التواتر',
    frequencySubtitle: 'تنظيم الخطط',
    lateTitle: 'التأخيرات حسب الخط',
    lateSubtitle: 'خطط تحتاج إلى تدخل',
    alerts: 'تنبيهات',
    completedName: 'الصيانات المنجزة',
    maintenanceUnit: 'صيانات',
    planUnit: 'خطط',
    onTime: 'في وقتها',
    totalPlans: 'خطط',
    overdueName: 'الخطط المتأخرة',
    months: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول'],
    frequencies: ['يومية', 'أسبوعية', 'شهرية', 'ربع سنوية', 'سنوية'],
    lines: ['التكييف', 'الإنتاج 1', 'المرافق', 'التعبئة'],
  },
}

const content = computed(() => translations[language.value] || translations.FR)

const preventiveChartSeries = ref([])
const preventiveChartCategories = ref([])
const preventiveChartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: { enabled: true, speed: 800 },
    foreColor: '#aeb9c8',
  },
  colors: ['#83B95C', '#38BDF8', '#DC3747'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '48%' } },
  dataLabels: { enabled: false },
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '11px',
    labels: { colors: '#aeb9c8' },
  },
  xaxis: {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#aeb9c8', fontSize: '10px' } },
  },
  yaxis: { labels: { style: { colors: '#aeb9c8' } } },
  grid: { borderColor: 'rgba(126, 146, 170, 0.16)', strokeDashArray: 4 },
  tooltip: {
    enabled: true,
    y: { formatter: (value) => `${value} ${content.value.maintenanceUnit}` },
  },
  responsive: [
    {
      breakpoint: 750,
      options: {
        plotOptions: { bar: { columnWidth: '62%' } },
        legend: { position: 'bottom' },
        xaxis: { labels: { rotate: -35, trim: true } },
      },
    },
  ],
})
const preventiveChartLoading = ref(true)
const preventiveChartErrorMessage = ref('')

const hasPreventiveChartData = computed(() => {
  if (!preventiveChartCategories.value.length || !preventiveChartSeries.value.length) return false

  return preventiveChartSeries.value.some((serie) =>
    Array.isArray(serie.data) && serie.data.some((value) => Number(value) !== 0),
  )
})

async function loadPreventiveChart() {
  try {
    preventiveChartLoading.value = true
    preventiveChartErrorMessage.value = ''

    const chart = await getPreventiveChart()

    preventiveChartCategories.value = Array.isArray(chart?.categories) ? chart.categories : []
    preventiveChartSeries.value = Array.isArray(chart?.series) ? chart.series : []
    preventiveChartOptions.value = {
      ...preventiveChartOptions.value,
      xaxis: {
        ...preventiveChartOptions.value.xaxis,
        categories: preventiveChartCategories.value,
      },
    }
  } catch (error) {
    preventiveChartErrorMessage.value = error.message || 'Erreur lors du chargement du graphe.'
  } finally {
    preventiveChartLoading.value = false
  }
}

const chartSeries = ref([])
const chartCategories = ref([])
const chartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: { enabled: true, speed: 800 },
    foreColor: '#aeb9c8',
  },
  colors: ['#38BDF8', '#83B95C'],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '46%',
    },
  },
  dataLabels: { enabled: false },
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '11px',
    labels: { colors: '#aeb9c8' },
  },
  xaxis: {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#aeb9c8', fontSize: '10px' } },
  },
  yaxis: { labels: { style: { colors: '#aeb9c8' } } },
  grid: { borderColor: 'rgba(126, 146, 170, 0.16)', strokeDashArray: 4 },
  tooltip: {
    enabled: true,
    y: { formatter: (value) => `${value} ${content.value.planUnit}` },
  },
  responsive: [
    {
      breakpoint: 750,
      options: {
        plotOptions: { bar: { columnWidth: '62%' } },
        legend: { position: 'bottom' },
        xaxis: { labels: { rotate: -35, trim: true } },
      },
    },
  ],
})
const loading = ref(true)
const errorMessage = ref('')

const hasDistributionData = computed(() => {
  if (!chartCategories.value.length || !chartSeries.value.length) return false

  return chartSeries.value.some((serie) =>
    Array.isArray(serie.data) && serie.data.some((value) => Number(value) !== 0),
  )
})

async function loadPreventiveDistribution() {
  try {
    loading.value = true
    errorMessage.value = ''

    const distribution = await getPreventiveDistribution()

    chartCategories.value = Array.isArray(distribution?.categories) ? distribution.categories : []
    chartSeries.value = Array.isArray(distribution?.series) ? distribution.series : []
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: chartCategories.value,
      },
    }
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger les donnees de maintenance preventive.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPreventiveChart()
  loadPreventiveDistribution()
})

const slaSeries = computed(() => [92])

const slaOptions = computed(() => ({
  chart: { type: 'radialBar', fontFamily: 'inherit', animations: { enabled: true, speed: 900 }, foreColor: '#aeb9c8' },
  colors: ['#83B95C'],
  plotOptions: {
    radialBar: {
      startAngle: -130,
      endAngle: 130,
      hollow: { size: '65%' },
      track: { background: 'rgba(148, 163, 184, 0.18)' },
      dataLabels: {
        name: { show: true, offsetY: 22, color: '#aeb9c8', fontSize: '11px' },
        value: {
          offsetY: -18,
          color: '#f8fbff',
          fontSize: '30px',
          fontWeight: 800,
          formatter: (value) => `${Math.round(value)}%`,
        },
      },
    },
  },
  stroke: { lineCap: 'round' },
  labels: [content.value.onTime],
}))

const lateSeries = computed(() => [
  {
    name: content.value.overdueName,
    data: [5, 3, 2, 1],
  },
])

const lateOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit', foreColor: '#aeb9c8' },
  colors: ['#DC3747'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } },
  dataLabels: { enabled: true, offsetX: 7, style: { colors: ['#f4f7fb'], fontSize: '10px' } },
  xaxis: {
    categories: content.value.lines,
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#e2e8f0', fontSize: '10px', fontWeight: 600 } } },
  grid: { show: false },
  tooltip: { y: { formatter: (value) => `${value} ${content.value.overdueName}` } },
}))
</script>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.chart-card {
  min-width: 0;
  overflow: hidden;
  padding: 20px;
  background: rgba(17, 27, 38, 0.9);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
}

.chart-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chart-card h3 {
  margin: 0;
  color: #f8fbff;
  font-size: 15px;
  font-weight: 800;
}

.chart-card p {
  margin: 5px 0 0;
  color: #8d9aab;
  font-size: 11px;
}

.chart-card header > span {
  padding: 6px 9px;
  background: rgba(131, 185, 92, 0.18);
  border-radius: 999px;
  color: #bce39d;
  font-size: 10px;
  font-weight: 800;
}

.chart-card :deep(.vue-apexcharts),
.chart-card :deep(.apexcharts-canvas) {
  width: 100% !important;
  max-width: 100%;
}

.chart-card :deep(svg),
.chart-card :deep(foreignObject) {
  max-width: 100%;
}

.chart-state {
  display: grid;
  min-height: 300px;
  place-items: center;
  padding: 24px;
  border: 1px dashed rgba(126, 146, 170, 0.24);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.34);
  color: #aeb9c8;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
}

.chart-state--error {
  border-color: rgba(220, 55, 71, 0.36);
  background: rgba(220, 55, 71, 0.12);
  color: #fda4af;
}

@media (max-width: 1400px) {
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 750px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
