<template>
  <div class="chart-card">
    <div class="chart-header">
      <div>
        <h3>Respect des délais</h3>
        <p>Taux d’interventions clôturées dans les délais</p>
      </div>

      <span class="chart-badge">SLA</span>
    </div>

    <apexchart
      type="radialBar"
      height="270"
      :options="chartOptions"
      :series="chartSeries"
    />

    <div class="sla-details">
      <div class="sla-item">
        <span class="status-dot success"></span>

        <div>
          <strong>118</strong>
          <small>Dans les délais</small>
        </div>
      </div>

      <div class="sla-item">
        <span class="status-dot danger"></span>

        <div>
          <strong>10</strong>
          <small>Hors délai</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const chartSeries = ref([92])

const chartOptions = ref({
  chart: {
    type: 'radialBar',
    fontFamily: 'inherit',
    animations: {
      enabled: true,
      speed: 900
    }
  },

  colors: ['#6A9A2A'],

  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,

      hollow: {
        size: '66%'
      },

      track: {
        background: '#EEF1E9',
        strokeWidth: '100%',
        margin: 5
      },

      dataLabels: {
        name: {
          show: true,
          offsetY: 22,
          color: '#64748B',
          fontSize: '12px',
          fontWeight: 600
        },

        value: {
          show: true,
          offsetY: -18,
          color: '#111827',
          fontSize: '32px',
          fontWeight: 800,
          formatter: (value) => `${Math.round(value)}%`
        }
      }
    }
  },

  labels: ['Objectif atteint'],

  stroke: {
    lineCap: 'round'
  },

  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'horizontal',
      shadeIntensity: 0.3,
      gradientToColors: ['#B6C65B'],
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  },

  tooltip: {
    enabled: true,
    y: {
      formatter: (value) => `${value}% des interventions`
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
  margin-bottom: 4px;
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

.sla-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: -10px;
}

.sla-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  background: #fafbf7;
  border: 1px solid #edf0e8;
  border-radius: 12px;
}

.sla-item div {
  display: flex;
  flex-direction: column;
}

.sla-item strong {
  color: #111827;
  font-size: 15px;
}

.sla-item small {
  margin-top: 2px;
  color: #64748b;
  font-size: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 50%;
}

.status-dot.success {
  background: #6a9a2a;
}

.status-dot.danger {
  background: #e31e24;
}

@media (max-width: 500px) {
  .sla-details {
    grid-template-columns: 1fr;
  }
}
</style>