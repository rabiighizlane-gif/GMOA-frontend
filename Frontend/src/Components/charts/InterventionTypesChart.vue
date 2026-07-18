<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>Répartition par type</h3>
        <p>Distribution des interventions</p>
      </div>

      <span class="chart-badge">Mix</span>
    </div>

    <apexchart
      type="donut"
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

const chartSeries = ref([45, 35, 20])

const chartOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'inherit',
    animations: {
      enabled: true,
      speed: 800
    }
  },

  labels: ['Préventive', 'Corrective', 'Améliorative'],

  colors: ['#6A9A2A', '#FF6A00', '#E8B300'],

  stroke: {
    width: 4,
    colors: ['#FFFFFF']
  },

  dataLabels: {
    enabled: false
  },

  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,

          name: {
            show: true,
            color: '#64748B',
            fontSize: '12px'
          },

          value: {
            show: true,
            color: '#111827',
            fontSize: '22px',
            fontWeight: 800,
            formatter: (value) => `${value}%`
          },

          total: {
            show: true,
            label: 'Total',
            color: '#64748B',
            fontSize: '12px',
            formatter: () => '128'
          }
        }
      }
    }
  },

  legend: {
    position: 'bottom',
    fontSize: '12px',
    markers: {
      width: 9,
      height: 9,
      radius: 10
    }
  },

  tooltip: {
    y: {
      formatter: (value) => `${value}%`
    }
  },

  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }
  ]
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
  margin-bottom: 8px;
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