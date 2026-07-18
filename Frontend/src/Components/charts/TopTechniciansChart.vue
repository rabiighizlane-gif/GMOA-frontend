<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>Top 5 techniciens</h3>
        <p>Interventions clôturées</p>
      </div>

      <span class="chart-badge">Classement</span>
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
    name: 'Interventions clôturées',
    data: [28, 24, 21, 18, 15]
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
      horizontal: true,
      borderRadius: 6,
      barHeight: '45%',
      dataLabels: {
        position: 'top'
      }
    }
  },

  dataLabels: {
    enabled: true,
    offsetX: 8,
    style: {
      colors: ['#4A0A0A'],
      fontSize: '11px',
      fontWeight: 700
    }
  },

  xaxis: {
    categories: [
      'Nabil Amrani',
      'Ahmed El Mansouri',
      'Youssef Berrada',
      'Sara El Idrissi',
      'Karim El Fassi'
    ],
    labels: {
      show: false
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },

  yaxis: {
    labels: {
      style: {
        colors: '#4A0A0A',
        fontSize: '11px',
        fontWeight: 600
      },
      maxWidth: 130
    }
  },

  grid: {
    show: false
  },

  tooltip: {
    y: {
      formatter: (value) => `${value} interventions clôturées`
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
  margin-bottom: 10px;
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