<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ content.title }}</h3>
        <p>{{ content.subtitle }}</p>
      </div>
      <span class="chart-badge">{{ content.badge }}</span>
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

const technicianNames = {
  FR: ['Nabil Amrani', 'Ahmed El Mansouri', 'Youssef Berrada', 'Sara El Idrissi', 'Karim El Fassi'],
  EN: ['Nabil Amrani', 'Ahmed El Mansouri', 'Youssef Berrada', 'Sara El Idrissi', 'Karim El Fassi'],
  AR: ['\u0646\u0628\u064a\u0644 \u0627\u0644\u0639\u0645\u0631\u0627\u0646\u064a', '\u0623\u062d\u0645\u062f \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u064a', '\u064a\u0648\u0633\u0641 \u0628\u0631\u0627\u062f\u0629', '\u0633\u0627\u0631\u0629 \u0627\u0644\u0625\u062f\u0631\u064a\u0633\u064a', '\u0643\u0631\u064a\u0645 \u0627\u0644\u0641\u0627\u0633\u064a'],
}

const labels = {
  FR: { title: 'Top 5 techniciens', subtitle: 'Interventions cloturees', badge: 'Classement', series: 'Interventions cloturees', tooltip: (value) => `${value} interventions cloturees` },
  EN: { title: 'Top 5 technicians', subtitle: 'Closed interventions', badge: 'Ranking', series: 'Closed interventions', tooltip: (value) => `${value} closed interventions` },
  AR: { title: '\u0623\u0641\u0636\u0644 5 \u062a\u0642\u0646\u064a\u064a\u0646', subtitle: '\u062a\u062f\u062e\u0644\u0627\u062a \u0645\u063a\u0644\u0642\u0629', badge: '\u0627\u0644\u062a\u0631\u062a\u064a\u0628', series: '\u062a\u062f\u062e\u0644\u0627\u062a \u0645\u063a\u0644\u0642\u0629', tooltip: (value) => `${value} \u062a\u062f\u062e\u0644 \u0645\u063a\u0644\u0642` },
}

const content = computed(() => labels[language.value] || labels.FR)
const chartSeries = computed(() => [{ name: content.value.series, data: [28, 24, 21, 18, 15] }])
const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true, speed: 800 }, fontFamily: 'inherit' },
  colors: ['#6A9A2A'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '45%', dataLabels: { position: 'top' } } },
  dataLabels: { enabled: true, offsetX: 8, style: { colors: ['#4A0A0A'], fontSize: '11px', fontWeight: 700 } },
  xaxis: { categories: technicianNames[language.value] || technicianNames.FR, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { opposite: language.value === 'AR', labels: { style: { colors: '#4A0A0A', fontSize: '11px', fontWeight: 600 }, maxWidth: 145 } },
  grid: { show: false },
  tooltip: { y: { formatter: content.value.tooltip } },
}))
</script>

<style scoped>
.chart-card { height: 100%; padding: 20px; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.chart-header h3 { margin: 0; color: #111827; font-size: 16px; font-weight: 800; }
.chart-header p { margin: 5px 0 0; color: #94a3b8; font-size: 12px; }
.chart-badge { padding: 6px 10px; color: #6a9a2a; background: #eff5df; border-radius: 999px; font-size: 11px; font-weight: 700; }
</style>
