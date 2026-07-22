<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ content.title }}</h3>
        <p>{{ content.subtitle }}</p>
      </div>
      <span class="chart-badge">{{ content.badge }}</span>
    </div>
    <apexchart type="donut" height="260" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLanguageStore } from '@/stores/language'

const apexchart = VueApexCharts
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const chartSeries = [12, 28, 46, 42]
const labels = {
  FR: { title: 'Repartition par priorite', subtitle: "Niveau d'urgence des interventions", badge: 'Priorites', total: 'Total', names: ['Critique', 'Haute', 'Moyenne', 'Basse'], tooltip: (value) => `${value} interventions` },
  EN: { title: 'Breakdown by priority', subtitle: 'Intervention urgency level', badge: 'Priorities', total: 'Total', names: ['Critical', 'High', 'Medium', 'Low'], tooltip: (value) => `${value} interventions` },
  AR: { title: '\u0627\u0644\u062a\u0648\u0632\u064a\u0639 \u062d\u0633\u0628 \u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0629', subtitle: '\u0645\u0633\u062a\u0648\u0649 \u0625\u0644\u062d\u0627\u062d \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a', badge: '\u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0627\u062a', total: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639', names: ['\u062d\u0631\u062c\u0629', '\u0639\u0627\u0644\u064a\u0629', '\u0645\u062a\u0648\u0633\u0637\u0629', '\u0645\u0646\u062e\u0641\u0636\u0629'], tooltip: (value) => `${value} \u062a\u062f\u062e\u0644` },
}
const content = computed(() => labels[language.value] || labels.FR)
const chartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', animations: { enabled: true, speed: 800 }, foreColor: '#aeb9c8' },
  labels: content.value.names,
  colors: ['#DC3747', '#F97316', '#FACC15', '#83B95C'],
  stroke: { width: 4, colors: ['#101924'] },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, name: { show: true, color: '#aeb9c8', fontSize: '12px' }, value: { show: true, color: '#f8fbff', fontSize: '22px', fontWeight: 800, formatter: (value) => value }, total: { show: true, label: content.value.total, color: '#aeb9c8', fontSize: '12px', formatter: () => '128' } } } } },
  legend: { position: 'bottom', fontSize: '12px', labels: { colors: '#aeb9c8' }, markers: { width: 9, height: 9, radius: 10 } },
  tooltip: { y: { formatter: content.value.tooltip } },
  responsive: [{ breakpoint: 768, options: { legend: { position: 'bottom' } } }],
}))
</script>

<style scoped>
.chart-card { height: 100%; padding: 20px; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.chart-header h3 { margin: 0; color: #f8fbff; font-size: 16px; font-weight: 800; }
.chart-header p { margin: 5px 0 0; color: #8d9aab; font-size: 12px; }
.chart-badge { padding: 6px 10px; color: #bce39d; background: rgba(131, 185, 92, 0.18); border-radius: 999px; font-size: 11px; font-weight: 700; }
</style>
