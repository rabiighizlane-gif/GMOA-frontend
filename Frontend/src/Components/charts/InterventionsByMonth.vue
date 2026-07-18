<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>Interventions par mois</h3>
        <p>Évolution mensuelle des interventions</p>
      </div>

      <span class="chart-badge">2026</span>
    </div>

    <apexchart
      type="bar"
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
    name: 'Interventions',
    data: [18, 24, 21, 27, 29, 34, 31, 38, 35, 41, 39, 44]
  }
])

const chartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      speed: 800
    },
    fontFamily: 'inherit'
  },

  colors: ['#6A9A2A'],

  plotOptions: {
    bar: {
      borderRadius: 7,
      columnWidth: '48%',
      distributed: false
    }
  },

  dataLabels: {
    enabled: false
  },

  xaxis: {
    categories: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc'
    ],
    labels: {
      style: {
        colors: '#64748B',
        fontSize: '11px'
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
    labels: {
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
      formatter: (value) => `${value} interventions`
    }
  },

  fill: {
    opacity: 1
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