<template>
  <article class="preventive-chart-card">
    <header>
      <div>
        <h3>Maintenance preventive</h3>
        <p>Repartition des machines par periodicite et par usine</p>
      </div>
    </header>

    <div v-if="loading" class="chart-state" role="status">
      Chargement des donnees preventives...
    </div>
    <div v-else-if="errorMessage" class="chart-state chart-state--error" role="alert">
      {{ errorMessage }}
    </div>
    <div v-else-if="!hasChartData" class="chart-state">
      Aucune donnee preventive disponible
    </div>
    <apexchart v-else type="bar" height="300" :options="chartOptions" :series="chartSeries" />
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { getPreventiveDistribution } from '@/services/dashboardService'

const apexchart = VueApexCharts

const chartSeries = ref([])
const chartCategories = ref([])
const chartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    fontFamily: 'inherit',
    foreColor: 'rgba(74, 10, 10, 0.62)',
  },
  colors: ['#6A9A2A', '#E8B300'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 700,
    labels: {
      colors: 'rgba(74, 10, 10, 0.62)',
    },
  },
  tooltip: {
    enabled: true,
    theme: 'light',
  },
  xaxis: {
    categories: [],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      rotate: 0,
      trim: true,
      style: {
        colors: 'rgba(74, 10, 10, 0.62)',
        fontSize: '12px',
        fontWeight: 700,
      },
    },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    title: {
      text: 'Nombre de machines',
      style: {
        color: 'rgba(74, 10, 10, 0.62)',
        fontSize: '12px',
        fontWeight: 700,
      },
    },
    labels: {
      style: {
        colors: 'rgba(74, 10, 10, 0.62)',
        fontSize: '12px',
        fontWeight: 700,
      },
    },
  },
  grid: {
    borderColor: 'rgba(74, 10, 10, 0.1)',
    strokeDashArray: 4,
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '68%',
          },
        },
        xaxis: {
          labels: {
            rotate: -35,
            trim: true,
          },
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
})
const loading = ref(true)
const errorMessage = ref('')

const hasChartData = computed(() => {
  if (!chartCategories.value.length || !chartSeries.value.length) return false

  return chartSeries.value.some((serie) =>
    Array.isArray(serie.data) && serie.data.some((value) => Number(value) !== 0),
  )
})

onMounted(async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const distribution = await getPreventiveDistribution()

    chartCategories.value = Array.isArray(distribution?.categories) ? distribution.categories : []
    chartSeries.value = Array.isArray(distribution?.series) ? distribution.series : []
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: chartCategories.value,
      },
    }
  } catch (error) {
    errorMessage.value = error.message || 'Impossible de charger les donnees de maintenance preventive.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.preventive-chart-card {
  min-width: 0;
  overflow: hidden;
  padding: 24px;
  background: #ffffff;
  border: 1px solid rgba(74, 10, 10, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.06);
}

.preventive-chart-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.preventive-chart-card h3 {
  margin: 0;
  color: #4a0a0a;
  font-size: 20px;
  font-weight: 800;
}

.preventive-chart-card p {
  margin: 6px 0 0;
  color: rgba(74, 10, 10, 0.62);
  font-size: 13px;
  font-weight: 600;
}

.chart-state {
  display: grid;
  min-height: 300px;
  place-items: center;
  padding: 24px;
  border: 1px dashed rgba(74, 10, 10, 0.14);
  border-radius: 8px;
  background: #f7f9f3;
  color: rgba(74, 10, 10, 0.62);
  font-size: 13px;
  font-weight: 800;
  text-align: center;
}

.chart-state--error {
  border-color: rgba(227, 30, 36, 0.24);
  background: rgba(227, 30, 36, 0.08);
  color: #e31e24;
}

.preventive-chart-card :deep(.vue-apexcharts),
.preventive-chart-card :deep(.apexcharts-canvas) {
  width: 100% !important;
  max-width: 100%;
}

.preventive-chart-card :deep(svg),
.preventive-chart-card :deep(foreignObject) {
  max-width: 100%;
}
</style>
