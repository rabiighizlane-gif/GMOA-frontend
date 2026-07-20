<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ content.title }}</h3>
        <p>{{ content.subtitle }}</p>
      </div>
      <span class="chart-badge">{{ content.badge }}</span>
    </div>
    <apexchart type="donut" height="250" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLanguageStore } from '@/stores/language'

const apexchart = VueApexCharts
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const chartSeries = [45, 35, 20]

const labels = {
  FR: { title: 'Repartition par type', subtitle: 'Distribution des interventions', badge: 'Mix', total: 'Total', names: ['Preventive', 'Corrective', 'Ameliorative'] },
  EN: { title: 'Breakdown by type', subtitle: 'Intervention distribution', badge: 'Mix', total: 'Total', names: ['Preventive', 'Corrective', 'Improvement'] },
  AR: { title: '\u0627\u0644\u062a\u0648\u0632\u064a\u0639 \u062d\u0633\u0628 \u0627\u0644\u0646\u0648\u0639', subtitle: '\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a', badge: '\u0645\u0632\u064a\u062c', total: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639', names: ['\u0648\u0642\u0627\u0626\u064a', '\u062a\u0635\u062d\u064a\u062d\u064a', '\u062a\u062d\u0633\u064a\u0646\u064a'] },
}

const content = computed(() => labels[language.value] || labels.FR)
const chartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', animations: { enabled: true, speed: 800 } },
  labels: content.value.names,
  colors: ['#6A9A2A', '#FF6A00', '#E8B300'],
  stroke: { width: 4, colors: ['#FFFFFF'] },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, name: { show: true, color: '#64748B', fontSize: '12px' }, value: { show: true, color: '#111827', fontSize: '22px', fontWeight: 800, formatter: (value) => `${value}%` }, total: { show: true, label: content.value.total, color: '#64748B', fontSize: '12px', formatter: () => '128' } } } } },
  legend: { position: 'bottom', fontSize: '12px', markers: { width: 9, height: 9, radius: 10 } },
  tooltip: { y: { formatter: (value) => `${value}%` } },
  responsive: [{ breakpoint: 768, options: { legend: { position: 'bottom' } } }],
}))
</script>

<style scoped>
.chart-card { height: 100%; padding: 20px; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.chart-header h3 { margin: 0; color: #111827; font-size: 16px; font-weight: 800; }
.chart-header p { margin: 5px 0 0; color: #94a3b8; font-size: 12px; }
.chart-badge { padding: 6px 10px; color: #6a9a2a; background: #eff5df; border-radius: 999px; font-size: 11px; font-weight: 700; }
</style>
