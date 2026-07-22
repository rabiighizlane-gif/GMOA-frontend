<template>
  <section class="charts-section">
    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ content.categoryTitle }}</h3><p>{{ content.categorySubtitle }}</p></div><span>{{ content.mix }}</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="donut" height="250" :options="categoryOptions" :series="categorySeries" />
      </div>
    </article>

    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ content.consumptionTitle }}</h3><p>{{ content.consumptionSubtitle }}</p></div><span>2026</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="area" height="250" :options="consumptionOptions" :series="consumptionSeries" />
      </div>
    </article>

    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ content.topTitle }}</h3><p>{{ content.topSubtitle }}</p></div><span>Top 5</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="bar" height="250" :options="topOptions" :series="topSeries" />
      </div>
    </article>

    <article class="chart-card" :dir="pageDirection">
      <header><div><h3>{{ content.stockTitle }}</h3><p>{{ content.stockSubtitle }}</p></div><span>SLA</span></header>
      <div class="chart-canvas" dir="ltr">
        <apexchart type="radialBar" height="250" :options="stockLevelOptions" :series="stockLevelSeries" />
      </div>
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
const pageDirection = computed(() => (language.value === 'AR' ? 'rtl' : 'ltr'))

const translations = {
  FR: {
    mix: 'Mix',
    categoryTitle: 'Stock par categorie',
    categorySubtitle: 'Repartition des references',
    consumptionTitle: 'Consommation mensuelle',
    consumptionSubtitle: 'Evolution sur 7 mois',
    topTitle: 'Top pieces consommees',
    topSubtitle: 'Top 5 des sorties stock',
    stockTitle: 'Niveau global du stock',
    stockSubtitle: 'Disponibilite globale',
    categories: ['Mecanique', 'Electrique', 'Filtration', 'Transmission', 'Lubrification', 'Pneumatique'],
    months: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    usedParts: 'Pieces utilisees',
    exits: 'Sorties',
    topParts: ['Filtre a huile', 'Roulement 6205', 'Courroie', 'Fusible', 'Huile mecanique'],
    available: 'Disponible',
    unit: 'pieces',
  },
  EN: {
    mix: 'Mix',
    categoryTitle: 'Stock by category',
    categorySubtitle: 'Reference breakdown',
    consumptionTitle: 'Monthly consumption',
    consumptionSubtitle: '7-month trend',
    topTitle: 'Top consumed parts',
    topSubtitle: 'Top 5 stock exits',
    stockTitle: 'Overall stock level',
    stockSubtitle: 'Global availability',
    categories: ['Mechanical', 'Electrical', 'Filtration', 'Transmission', 'Lubrication', 'Pneumatic'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    usedParts: 'Used parts',
    exits: 'Exits',
    topParts: ['Oil filter', 'Bearing 6205', 'Belt', 'Fuse', 'Mechanical oil'],
    available: 'Available',
    unit: 'parts',
  },
  AR: {
    mix: 'مزيج',
    categoryTitle: 'المخزون حسب الفئة',
    categorySubtitle: 'توزيع المراجع',
    consumptionTitle: 'الاستهلاك الشهري',
    consumptionSubtitle: 'التطور خلال 7 أشهر',
    topTitle: 'أكثر القطع استهلاكا',
    topSubtitle: 'أعلى 5 خروجات من المخزون',
    stockTitle: 'المستوى العام للمخزون',
    stockSubtitle: 'التوفر الإجمالي',
    categories: ['ميكانيكية', 'كهربائية', 'ترشيح', 'نقل الحركة', 'تشحيم', 'هوائية'],
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليو'],
    usedParts: 'القطع المستعملة',
    exits: 'الخروجات',
    topParts: ['مرشح الزيت', 'محمل 6205', 'حزام', 'مصهر', 'زيت ميكانيكي'],
    available: 'متوفر',
    unit: 'قطع',
  },
}

const content = computed(() => translations[language.value] || translations.FR)
const chartBase = computed(() => ({ fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, speed: 800 } }))

const categorySeries = computed(() => [145, 88, 72, 64, 49, 32])
const categoryOptions = computed(() => ({
  chart: { type: 'donut', ...chartBase.value },
  labels: content.value.categories,
  colors: ['#83B95C', '#38BDF8', '#FACC15', '#F97316', '#DC3747', '#A78BFA'],
  stroke: { width: 4, colors: ['#111927'] },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontSize: '10px', labels: { colors: '#AAB7C7' } },
  tooltip: { y: { formatter: (value) => `${value} ${content.value.unit}` } },
}))

const consumptionSeries = computed(() => [{ name: content.value.usedParts, data: [62, 74, 69, 88, 91, 83, 94] }])
const consumptionOptions = computed(() => ({
  chart: { type: 'area', ...chartBase.value },
  colors: ['#83B95C'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
  xaxis: {
    categories: content.value.months,
    labels: { rotate: 0, trim: false, hideOverlappingLabels: false, style: { colors: '#AAB7C7', fontSize: '11px', fontFamily: 'inherit' } },
  },
  yaxis: { labels: { style: { colors: '#AAB7C7', fontFamily: 'inherit' } } },
  grid: { borderColor: 'rgba(126, 146, 170, 0.18)', strokeDashArray: 4 },
}))

const topSeries = computed(() => [{ name: content.value.exits, data: [26, 19, 16, 14, 11] }])
const topOptions = computed(() => ({
  chart: { type: 'bar', ...chartBase.value },
  colors: ['#83B95C'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%' } },
  dataLabels: { enabled: true, offsetX: 7, style: { colors: ['#F8FBFF'], fontSize: '10px' } },
  xaxis: { categories: content.value.topParts, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { maxWidth: 120, style: { colors: '#D7E0EC', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit' } } },
  grid: { show: false },
}))

const stockLevelSeries = computed(() => [84])
const stockLevelOptions = computed(() => ({
  chart: { type: 'radialBar', ...chartBase.value },
  colors: ['#83B95C'],
  plotOptions: {
    radialBar: {
      hollow: { size: '64%' },
      track: { background: 'rgba(126, 146, 170, 0.18)' },
      dataLabels: {
        name: { color: '#AAB7C7', fontSize: '11px' },
        value: { color: '#F8FBFF', fontSize: '30px', fontWeight: 900, formatter: (value) => `${Math.round(value)}%` },
      },
    },
  },
  stroke: { lineCap: 'round' },
  labels: [content.value.available],
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
  background: rgba(17, 27, 38, 0.92);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
}
.chart-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.chart-card[dir='rtl'] header {
  flex-direction: row-reverse;
  text-align: right;
}
.chart-card h3 {
  margin: 0;
  color: #f8fbff;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0;
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
  font-weight: 900;
  white-space: nowrap;
}
.chart-canvas { direction: ltr; }
.chart-card :deep(.vue-apexcharts),
.chart-card :deep(.apexcharts-canvas),
.chart-card :deep(svg) {
  width: 100% !important;
  max-width: 100%;
}
.chart-card :deep(.apexcharts-legend-text) {
  font-family: inherit !important;
}
@media (max-width: 750px) {
  .charts-section { grid-template-columns: minmax(0, 1fr); }
}
</style>
