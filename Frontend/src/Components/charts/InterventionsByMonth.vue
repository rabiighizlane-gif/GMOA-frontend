<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ content.title }}</h3>
        <p>{{ content.subtitle }}</p>
      </div>
      <span class="chart-badge">2026</span>
    </div>
    <apexchart type="bar" height="250" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLanguageStore } from '@/stores/language'

const apexchart = VueApexCharts
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const labels = {
  FR: {
    title: 'Interventions par mois',
    subtitle: 'Evolution mensuelle des interventions',
    series: 'Interventions',
    months: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'],
    tooltip: (value) => `${value} interventions`,
  },
  EN: {
    title: 'Interventions by month',
    subtitle: 'Monthly intervention trend',
    series: 'Interventions',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tooltip: (value) => `${value} interventions`,
  },
  AR: {
    title: '\u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a \u062d\u0633\u0628 \u0627\u0644\u0634\u0647\u0631',
    subtitle: '\u062a\u0637\u0648\u0631 \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a \u0634\u0647\u0631\u064a\u0627',
    series: '\u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a',
    months: ['\u064a\u0646\u0627', '\u0641\u0628\u0631', '\u0645\u0627\u0631', '\u0623\u0628\u0631', '\u0645\u0627\u064a', '\u064a\u0648\u0646', '\u064a\u0648\u0644', '\u063a\u0634\u062a', '\u0633\u0628\u062a', '\u0623\u0643\u062a', '\u0646\u0648\u0641', '\u062f\u062c\u0646'],
    tooltip: (value) => `${value} \u062a\u062f\u062e\u0644`,
  },
}

const content = computed(() => labels[language.value] || labels.FR)
const chartSeries = computed(() => [{ name: content.value.series, data: [18, 24, 21, 27, 29, 34, 31, 38, 35, 41, 39, 44] }])
const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, speed: 800 }, fontFamily: 'inherit' },
  colors: ['#6A9A2A'],
  plotOptions: { bar: { borderRadius: 7, columnWidth: '48%' } },
  dataLabels: { enabled: false },
  xaxis: { categories: content.value.months, labels: { style: { colors: '#64748B', fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 0, labels: { style: { colors: '#64748B' } } },
  grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
  tooltip: { y: { formatter: content.value.tooltip } },
  fill: { opacity: 1 },
}))
</script>

<style scoped>
.chart-card { height: 100%; padding: 20px; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.chart-header h3 { margin: 0; color: #111827; font-size: 16px; font-weight: 800; }
.chart-header p { margin: 5px 0 0; color: #94a3b8; font-size: 12px; }
.chart-badge { padding: 6px 10px; color: #6a9a2a; background: #eff5df; border-radius: 999px; font-size: 11px; font-weight: 700; }
</style>
