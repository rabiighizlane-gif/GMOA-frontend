<template>
  <div v-if="!hasChartData" class="chart-state">
    {{ emptyMessage }}
  </div>
  <apexchart v-else type="area" height="288" :options="chartOptions" :series="chartSeries" />
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const props = defineProps({
  values: {
    type: Array,
    default: () => [],
  },
  ariaLabel: {
    type: String,
    default: '',
  },
  emptyMessage: {
    type: String,
    default: 'Donnees indisponibles',
  },
})

const visibleLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '24:00']

const chartSeries = computed(() => [
  {
    name: props.ariaLabel,
    data: props.values.map((point) => point.value),
  },
])

const hasChartData = computed(() =>
  props.values.some((point) => Number(point?.value) !== 0),
)

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      dynamicAnimation: { enabled: true, speed: 350 },
    },
    fontFamily: 'inherit',
    foreColor: 'rgba(74, 10, 10, 0.62)',
  },
  colors: ['#6A9A2A'],
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 4,
    lineCap: 'round',
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.24,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  markers: {
    size: 4,
    colors: ['#6A9A2A'],
    strokeColors: '#ffffff',
    strokeWidth: 2,
    hover: { size: 5 },
  },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 0,
    padding: {
      top: 0,
      right: 18,
      bottom: 8,
      left: 4,
    },
  },
  xaxis: {
    categories: props.values.map((point) => point.hour),
    axisBorder: { show: true, color: '#e2e8f0' },
    axisTicks: { show: false },
    labels: {
      rotate: 0,
      style: {
        colors: 'rgba(74, 10, 10, 0.62)',
        fontSize: '12px',
        fontWeight: 700,
      },
      formatter: (value) => (visibleLabels.includes(value) ? value : ''),
    },
    tooltip: { enabled: false },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      style: {
        colors: 'rgba(74, 10, 10, 0.62)',
        fontSize: '12px',
        fontWeight: 700,
      },
    },
  },
  legend: { show: false },
  tooltip: {
    enabled: true,
    theme: 'light',
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: { height: 260 },
        markers: { size: 3 },
        grid: { padding: { right: 8, left: 0 } },
      },
    },
  ],
}))
</script>

<style scoped>
:deep(.vue-apexcharts),
:deep(.apexcharts-canvas) {
  width: 100% !important;
  max-width: 100%;
}

.chart-state {
  display: grid;
  min-height: 288px;
  place-items: center;
  color: rgba(74, 10, 10, 0.62);
  font-size: 13px;
  font-weight: 800;
  text-align: center;
}
</style>
