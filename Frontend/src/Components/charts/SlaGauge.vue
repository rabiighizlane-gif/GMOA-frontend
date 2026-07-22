<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>{{ content.title }}</h3>
        <p>{{ content.subtitle }}</p>
      </div>
      <span class="chart-badge">SLA</span>
    </div>
    <apexchart type="radialBar" height="270" :options="chartOptions" :series="chartSeries" />
    <div class="sla-details">
      <div class="sla-item"><span class="status-dot success"></span><div><strong>118</strong><small>{{ content.onTime }}</small></div></div>
      <div class="sla-item"><span class="status-dot danger"></span><div><strong>10</strong><small>{{ content.late }}</small></div></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useLanguageStore } from '@/stores/language'

const apexchart = VueApexCharts
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const chartSeries = [92]
const labels = {
  FR: { title: 'Respect des delais', subtitle: 'Taux d interventions cloturees dans les delais', objective: 'Objectif atteint', onTime: 'Dans les delais', late: 'Hors delai', tooltip: (value) => `${value}% des interventions` },
  EN: { title: 'Deadline compliance', subtitle: 'Rate of interventions closed on time', objective: 'Target reached', onTime: 'On time', late: 'Late', tooltip: (value) => `${value}% of interventions` },
  AR: { title: '\u0627\u062d\u062a\u0631\u0627\u0645 \u0627\u0644\u0622\u062c\u0627\u0644', subtitle: '\u0646\u0633\u0628\u0629 \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a \u0627\u0644\u0645\u063a\u0644\u0642\u0629 \u0641\u064a \u0627\u0644\u0648\u0642\u062a', objective: '\u0627\u0644\u0647\u062f\u0641 \u0645\u062d\u0642\u0642', onTime: '\u0641\u064a \u0627\u0644\u0648\u0642\u062a', late: '\u0645\u062a\u0623\u062e\u0631\u0629', tooltip: (value) => `${value}% \u0645\u0646 \u0627\u0644\u062a\u062f\u062e\u0644\u0627\u062a` },
}
const content = computed(() => labels[language.value] || labels.FR)
const chartOptions = computed(() => ({
  chart: { type: 'radialBar', fontFamily: 'inherit', animations: { enabled: true, speed: 900 }, foreColor: '#aeb9c8' },
  colors: ['#83B95C'],
  plotOptions: { radialBar: { startAngle: -135, endAngle: 135, hollow: { size: '66%' }, track: { background: 'rgba(148, 163, 184, 0.18)', strokeWidth: '100%', margin: 5 }, dataLabels: { name: { show: true, offsetY: 22, color: '#aeb9c8', fontSize: '12px', fontWeight: 600 }, value: { show: true, offsetY: -18, color: '#f8fbff', fontSize: '32px', fontWeight: 800, formatter: (value) => `${Math.round(value)}%` } } } },
  labels: [content.value.objective],
  stroke: { lineCap: 'round' },
  fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', shadeIntensity: 0.2, gradientToColors: ['#B6C65B'], inverseColors: false, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } },
  tooltip: { enabled: true, y: { formatter: content.value.tooltip } },
}))
</script>

<style scoped>
.chart-card { height: 100%; padding: 20px; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
.chart-header h3 { margin: 0; color: #f8fbff; font-size: 16px; font-weight: 800; }
.chart-header p { margin: 5px 0 0; color: #8d9aab; font-size: 12px; }
.chart-badge { padding: 6px 10px; color: #bce39d; background: rgba(131, 185, 92, 0.18); border-radius: 999px; font-size: 11px; font-weight: 700; }
.sla-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: -10px; }
.sla-item { display: flex; align-items: center; gap: 10px; padding: 11px; background: rgba(13, 21, 32, 0.72); border: 1px solid rgba(126, 146, 170, 0.2); border-radius: 8px; }
.sla-item div { display: flex; flex-direction: column; }
.sla-item strong { color: #f8fbff; font-size: 15px; }
.sla-item small { margin-top: 2px; color: #aab7c7; font-size: 10px; }
.status-dot { width: 10px; height: 10px; flex-shrink: 0; border-radius: 50%; }
.status-dot.success { background: #83b95c; }
.status-dot.danger { background: #dc3747; }
@media (max-width: 500px) { .sla-details { grid-template-columns: 1fr; } }
</style>
