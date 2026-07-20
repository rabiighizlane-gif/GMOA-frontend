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
      <apexchart type="bar" height="260" :options="monthlyOptions" :series="monthlySeries" />
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
      <apexchart type="donut" height="260" :options="frequencyOptions" :series="frequencySeries" />
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
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: {
    monthlyTitle: 'Preventives realisees',
    monthlySubtitle: 'Evolution mensuelle',
    slaTitle: 'Respect du planning',
    slaSubtitle: 'Maintenances realisees a temps',
    frequencyTitle: 'Repartition par frequence',
    frequencySubtitle: 'Organisation des plans',
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
    monthlyTitle: 'Completed preventive tasks',
    monthlySubtitle: 'Monthly trend',
    slaTitle: 'Schedule compliance',
    slaSubtitle: 'Maintenance completed on time',
    frequencyTitle: 'Breakdown by frequency',
    frequencySubtitle: 'Plan organization',
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

const monthlySeries = computed(() => [
  {
    name: content.value.completedName,
    data: [18, 22, 20, 27, 31, 29, 38],
  },
])

const monthlyOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: true, speed: 800 } },
  colors: ['#6A9A2A'],
  plotOptions: { bar: { borderRadius: 7, columnWidth: '46%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: content.value.months,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748B', fontSize: '10px' } },
  },
  yaxis: { labels: { style: { colors: '#64748B' } } },
  grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
  tooltip: { y: { formatter: (value) => `${value} ${content.value.maintenanceUnit}` } },
}))

const slaSeries = computed(() => [92])

const slaOptions = computed(() => ({
  chart: { type: 'radialBar', fontFamily: 'inherit', animations: { enabled: true, speed: 900 } },
  colors: ['#6A9A2A'],
  plotOptions: {
    radialBar: {
      startAngle: -130,
      endAngle: 130,
      hollow: { size: '65%' },
      track: { background: '#EEF1E9' },
      dataLabels: {
        name: { show: true, offsetY: 22, color: '#64748B', fontSize: '11px' },
        value: {
          offsetY: -18,
          color: '#111827',
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

const frequencySeries = computed(() => [12, 22, 18, 8, 4])

const frequencyOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: content.value.frequencies,
  colors: ['#4A0A0A', '#6A9A2A', '#B6C65B', '#E8B300', '#FF6A00'],
  stroke: { width: 4, colors: ['#FFFFFF'] },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontSize: '10px' },
  plotOptions: {
    pie: {
      donut: {
        size: '66%',
        labels: {
          show: true,
          total: { show: true, label: content.value.totalPlans, color: '#64748B', formatter: () => '64' },
        },
      },
    },
  },
  tooltip: { y: { formatter: (value) => `${value} ${content.value.planUnit}` } },
}))

const lateSeries = computed(() => [
  {
    name: content.value.overdueName,
    data: [5, 3, 2, 1],
  },
])

const lateOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#E31E24'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } },
  dataLabels: { enabled: true, offsetX: 7, style: { colors: ['#4A0A0A'], fontSize: '10px' } },
  xaxis: {
    categories: content.value.lines,
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#4A0A0A', fontSize: '10px', fontWeight: 600 } } },
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
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
}

.chart-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chart-card h3 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 800;
}

.chart-card p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.chart-card header > span {
  padding: 6px 9px;
  background: #eff5df;
  border-radius: 999px;
  color: #6a9a2a;
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
