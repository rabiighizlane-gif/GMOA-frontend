<template>
  <section class="charts-section">
    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ t.monthlyTitle }}</h3><p>{{ t.monthlySubtitle }}</p></div><span>2026</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="bar" height="250" :options="monthlyOptions" :series="monthlySeries" />
      </div>
    </article>
    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ t.statusTitle }}</h3><p>{{ t.statusSubtitle }}</p></div><span>{{ t.statusBadge }}</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="donut" height="250" :options="statusOptions" :series="statusSeries" />
      </div>
    </article>
    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ t.dailyTitle }}</h3><p>{{ t.dailySubtitle }}</p></div><span>{{ t.dailyBadge }}</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="area" height="250" :options="dailyOptions" :series="dailySeries" />
      </div>
    </article>
    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ t.priorityTitle }}</h3><p>{{ t.prioritySubtitle }}</p></div><span>{{ t.priorityBadge }}</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="bar" height="250" :options="priorityOptions" :series="prioritySeries" />
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLanguageStore } from '@/stores/language'

const apexchart = VueApexCharts
const props = defineProps({
  requests: { type: Array, default: () => [] },
})

const languageStore = useLanguageStore()
const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const labels = {
  FR: {
    monthlyTitle: 'Demandes par mois',
    monthlySubtitle: 'Volume sur 7 mois',
    statusTitle: 'Repartition par statut',
    statusSubtitle: 'Etat du workflow',
    statusBadge: 'Statuts',
    dailyTitle: 'Evolution quotidienne',
    dailySubtitle: '14 derniers jours',
    dailyBadge: 'Journalier',
    priorityTitle: 'Repartition par priorite',
    prioritySubtitle: "Niveau d'urgence",
    priorityBadge: 'Priorites',
    requests: 'Demandes',
    months: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    days: ['J-13', 'J-12', 'J-11', 'J-10', 'J-9', 'J-8', 'J-7', 'J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'Hier', 'Auj.'],
    statuses: { 'En attente': 'En attente', Acceptee: 'Acceptee', Refusee: 'Refusee', 'Intervention creee': 'Intervention creee' },
    priorities: { Critique: 'Critique', Haute: 'Haute', Moyenne: 'Moyenne', Faible: 'Faible' },
  },
  EN: {
    monthlyTitle: 'Requests by month',
    monthlySubtitle: '7-month volume',
    statusTitle: 'Status breakdown',
    statusSubtitle: 'Workflow state',
    statusBadge: 'Statuses',
    dailyTitle: 'Daily trend',
    dailySubtitle: 'Last 14 days',
    dailyBadge: 'Daily',
    priorityTitle: 'Priority breakdown',
    prioritySubtitle: 'Urgency level',
    priorityBadge: 'Priorities',
    requests: 'Requests',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    days: ['D-13', 'D-12', 'D-11', 'D-10', 'D-9', 'D-8', 'D-7', 'D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yesterday', 'Today'],
    statuses: { 'En attente': 'Pending', Acceptee: 'Accepted', Refusee: 'Rejected', 'Intervention creee': 'Intervention created' },
    priorities: { Critique: 'Critical', Haute: 'High', Moyenne: 'Medium', Faible: 'Low' },
  },
  AR: {
    monthlyTitle: 'الطلبات حسب الشهر',
    monthlySubtitle: 'الحجم خلال 7 أشهر',
    statusTitle: 'التوزيع حسب الحالة',
    statusSubtitle: 'حالة سير العمل',
    statusBadge: 'الحالات',
    dailyTitle: 'التطور اليومي',
    dailySubtitle: 'آخر 14 يوم',
    dailyBadge: 'يومي',
    priorityTitle: 'التوزيع حسب الأولوية',
    prioritySubtitle: 'مستوى الاستعجال',
    priorityBadge: 'الأولويات',
    requests: 'الطلبات',
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليو'],
    days: ['13', '12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'أمس', 'اليوم'],
    statuses: { 'En attente': 'في الانتظار', Acceptee: 'مقبولة', Refusee: 'مرفوضة', 'Intervention creee': 'تم إنشاء تدخل' },
    priorities: { Critique: 'حرجة', Haute: 'عالية', Moyenne: 'متوسطة', Faible: 'منخفضة' },
  },
}

const t = computed(() => labels[languageStore.language] || labels.FR)
const chartBase = computed(() => ({ fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, speed: 800 } }))

const monthlySeries = computed(() => [{ name: t.value.requests, data: [12, 16, 15, 18, 21, 19, 25] }])
const monthlyOptions = computed(() => ({
  chart: { type: 'bar', ...chartBase.value },
  colors: ['#6A9A2A'],
  plotOptions: { bar: { borderRadius: 7, columnWidth: '46%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: t.value.months,
    labels: {
      rotate: 0,
      trim: false,
      hideOverlappingLabels: false,
      style: { fontSize: languageStore.language === 'AR' ? '11px' : '11px', fontFamily: 'inherit' },
    },
  },
  grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
}))

const statusKeys = ['En attente', 'Acceptee', 'Refusee', 'Intervention creee']
const statusSeries = computed(() => statusKeys.map((status) => props.requests.filter((request) => request.status === status).length))
const statusOptions = computed(() => ({
  chart: { type: 'donut', ...chartBase.value },
  labels: statusKeys.map((status) => t.value.statuses[status]),
  colors: ['#E8B300', '#6A9A2A', '#E31E24', '#B6C65B'],
  stroke: { width: 4, colors: ['#FFFFFF'] },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontSize: '10px' },
}))

const dailySeries = computed(() => [{ name: t.value.requests, data: [3, 5, 4, 6, 7, 5, 8, 6, 7, 9, 6, 8, 10, 8] }])
const dailyOptions = computed(() => ({
  chart: { type: 'area', ...chartBase.value },
  colors: ['#6A9A2A'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
  xaxis: {
    categories: t.value.days,
    labels: {
      rotate: languageStore.language === 'AR' ? 0 : -45,
      trim: true,
      style: { fontSize: languageStore.language === 'AR' ? '10px' : '11px', fontFamily: 'inherit' },
    },
  },
  grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
}))

const priorityKeys = ['Critique', 'Haute', 'Moyenne', 'Faible']
const prioritySeries = computed(() => [{ name: t.value.requests, data: priorityKeys.map((priority) => props.requests.filter((request) => request.priority === priority).length) }])
const priorityOptions = computed(() => ({
  chart: { type: 'bar', ...chartBase.value },
  colors: ['#FF6A00'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } },
  dataLabels: { enabled: true },
  xaxis: { categories: priorityKeys.map((priority) => t.value.priorities[priority]), labels: { show: false } },
  yaxis: { labels: { maxWidth: 90, style: { fontSize: '11px', fontFamily: 'inherit' } } },
  grid: { show: false },
}))
</script>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 18px;
  width: 100%;
  overflow: hidden;
  direction: ltr;
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
.chart-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.chart-card[dir='rtl'] header { flex-direction: row-reverse; text-align: right; }
.chart-card h3 { margin: 0; color: #111827; font-size: 15px; font-weight: 900; letter-spacing: 0; }
.chart-card p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.chart-card header > span { padding: 6px 9px; background: #eff5df; border-radius: 999px; color: #6a9a2a; font-size: 10px; font-weight: 900; white-space: nowrap; }
.chart-canvas {
  direction: ltr;
}
.chart-card :deep(.vue-apexcharts),
.chart-card :deep(.apexcharts-canvas),
.chart-card :deep(svg) {
  width: 100% !important;
  max-width: 100%;
}
.chart-card :deep(.apexcharts-legend) { gap: 8px; }
.chart-card :deep(.apexcharts-legend-text) { font-family: inherit !important; }
@media (max-width: 750px) {
  .charts-section { grid-template-columns: minmax(0, 1fr); }
}
</style>
