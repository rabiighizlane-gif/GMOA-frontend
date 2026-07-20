<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ content.title }}</h3>
        <p>{{ content.subtitle }}</p>
      </div>
      <span class="chart-badge">{{ content.badge }}</span>
    </div>
    <apexchart type="area" height="250" :options="chartOptions" :series="chartSeries" />
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
  FR: { title: "Temps moyen d'intervention", subtitle: 'Evolution hebdomadaire', badge: 'Heures', series: 'Temps moyen', weeks: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4', 'Sem. 5', 'Sem. 6', 'Sem. 7'], tooltip: (value) => `${value.toFixed(1)} heures` },
  EN: { title: 'Average intervention time', subtitle: 'Weekly trend', badge: 'Hours', series: 'Average time', weeks: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'], tooltip: (value) => `${value.toFixed(1)} hours` },
  AR: { title: '\u0645\u062a\u0648\u0633\u0637 \u0645\u062f\u0629 \u0627\u0644\u062a\u062f\u062e\u0644', subtitle: '\u0627\u0644\u062a\u0637\u0648\u0631 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064a', badge: '\u0633\u0627\u0639\u0627\u062a', series: '\u0627\u0644\u0645\u062f\u0629 \u0627\u0644\u0645\u062a\u0648\u0633\u0637\u0629', weeks: ['\u0623\u0633\u0628\u0648\u0639 1', '\u0623\u0633\u0628\u0648\u0639 2', '\u0623\u0633\u0628\u0648\u0639 3', '\u0623\u0633\u0628\u0648\u0639 4', '\u0623\u0633\u0628\u0648\u0639 5', '\u0623\u0633\u0628\u0648\u0639 6', '\u0623\u0633\u0628\u0648\u0639 7'], tooltip: (value) => `${value.toFixed(1)} \u0633\u0627\u0639\u0629` },
}

const content = computed(() => labels[language.value] || labels.FR)
const chartSeries = computed(() => [{ name: content.value.series, data: [3.4, 3.1, 2.8, 3, 2.5, 2.3, 2.1] }])
const chartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, speed: 900 }, fontFamily: 'inherit' },
  colors: ['#6A9A2A'],
  stroke: { curve: 'smooth', width: 3 },
  markers: { size: 4, strokeWidth: 3, hover: { size: 6 } },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  xaxis: { categories: content.value.weeks, labels: { style: { colors: '#64748B', fontSize: '10px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 0, max: 4, tickAmount: 4, labels: { formatter: (value) => `${value.toFixed(0)}h`, style: { colors: '#64748B' } } },
  grid: { borderColor: '#EEF1E9', strokeDashArray: 4 },
  tooltip: { y: { formatter: content.value.tooltip } },
}))
</script>

<style scoped>
.chart-card { height: 100%; padding: 20px; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.chart-header h3 { margin: 0; color: #111827; font-size: 16px; font-weight: 800; }
.chart-header p { margin: 5px 0 0; color: #94a3b8; font-size: 12px; }
.chart-badge { padding: 6px 10px; color: #6a9a2a; background: #eff5df; border-radius: 999px; font-size: 11px; font-weight: 700; }
</style>
