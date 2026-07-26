<template>
  <div class="donut-shell" :aria-label="ariaLabel">
    <div v-if="!hasChartData" class="chart-state">
      {{ emptyMessage }}
    </div>
    <apexchart v-else type="donut" width="192" height="192" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const props = defineProps({
  series: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Array,
    required: true,
  },
  totalLabel: {
    type: String,
    required: true,
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

const hasChartData = computed(() => props.series.some((value) => Number(value) !== 0))

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      dynamicAnimation: { enabled: true, speed: 350 },
    },
    fontFamily: 'inherit',
  },
  labels: props.labels,
  colors: ['#6A9A2A', '#FF6A00', '#E31E24'],
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: {
    width: 0,
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: '50%',
        labels: {
          show: true,
          name: {
            show: true,
            offsetY: 20,
            color: 'rgba(74, 10, 10, 0.62)',
            fontSize: '12px',
            fontWeight: 700,
            formatter: () => props.totalLabel,
          },
          value: {
            show: true,
            offsetY: -16,
            color: '#4a0a0a',
            fontSize: '30px',
            fontWeight: 800,
            formatter: () => String(props.series.reduce((total, value) => total + Number(value || 0), 0)),
          },
          total: {
            show: true,
            showAlways: true,
            label: props.totalLabel,
            color: 'rgba(74, 10, 10, 0.62)',
            fontSize: '12px',
            fontWeight: 700,
            formatter: () => String(props.series.reduce((total, value) => total + Number(value || 0), 0)),
          },
        },
      },
    },
  },
  tooltip: {
    enabled: true,
    theme: 'light',
  },
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } },
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 192,
          height: 192,
        },
      },
    },
  ],
}))
</script>

<style scoped>
.donut-shell {
  position: relative;
  display: grid;
  width: 12rem;
  height: 12rem;
  place-items: center;
  border-radius: 9999px;
}

.donut-shell :deep(.vue-apexcharts),
.donut-shell :deep(.apexcharts-canvas) {
  width: 12rem !important;
  max-width: 12rem;
}

.chart-state {
  display: grid;
  width: 12rem;
  height: 12rem;
  place-items: center;
  border-radius: 9999px;
  background: #f7f9f3;
  color: rgba(74, 10, 10, 0.62);
  font-size: 13px;
  font-weight: 800;
  text-align: center;
}
</style>
