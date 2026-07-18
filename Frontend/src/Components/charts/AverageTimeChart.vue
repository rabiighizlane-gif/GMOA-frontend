<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>Temps moyen d'intervention</h3>
        <p>Évolution hebdomadaire</p>
      </div>

      <span class="chart-badge">Heures</span>
    </div>

    <apexchart
      type="area"
      height="250"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const chartSeries = ref([
  {
    name: 'Temps moyen',
    data: [3.4, 3.1, 2.8, 3, 2.5, 2.3, 2.1]
  }
])

const chartOptions = ref({
  chart: {
    type: 'area',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    animations: {
      enabled: true,
      speed: 900
    },
    fontFamily: 'inherit'
  },

  colors: ['#6A9A2A'],

  stroke: {
    curve: 'smooth',
    width: 3
  },

  markers: {
    size: 4,
    strokeWidth: 3,
    hover: {
      size: 6
    }
  },

  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.03,
      stops: [0, 90, 100]
    }
  },

  dataLabels: {
    enabled: false
  },

  xaxis: {
    categories: [
      'Sem. 1',
      'Sem. 2',
      'Sem. 3',
      'Sem. 4',
      'Sem. 5',
      'Sem. 6',
      'Sem. 7'
    ],
    labels: {
      style: {
        colors: '#64748B',
        fontSize: '10px'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },

  yaxis: {
    min: 0,
    max: 4,
    tickAmount: 4,
    labels: {
      formatter: (value) => `${value.toFixed(0)}h`,
      style: {
        colors: '#64748B'
      }
    }
  },

  grid: {
    borderColor: '#EEF1E9',
    strokeDashArray: 4
  },

  tooltip: {
    y: {
      formatter: (value) => `${value.toFixed(1)} heures`
    }
  }
})
</script>

<style scoped>
.chart-card {
  height: 100%;
  padding: 20px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-header h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
}

.chart-header p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 12px;
}

.chart-badge {
  padding: 6px 10px;
  color: #6a9a2a;
  background: #eff5df;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
</style>