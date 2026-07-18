<template>
  <section class="charts-section">
    <article class="chart-card">
      <header>
        <div>
          <h3>Préventives réalisées</h3>
          <p>Évolution mensuelle</p>
        </div>

        <span>2026</span>
      </header>

      <apexchart
        type="bar"
        height="260"
        :options="monthlyOptions"
        :series="monthlySeries"
      />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>Respect du planning</h3>
          <p>Maintenances réalisées à temps</p>
        </div>

        <span>SLA</span>
      </header>

      <apexchart
        type="radialBar"
        height="260"
        :options="slaOptions"
        :series="slaSeries"
      />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>Répartition par fréquence</h3>
          <p>Organisation des plans</p>
        </div>

        <span>Mix</span>
      </header>

      <apexchart
        type="donut"
        height="260"
        :options="frequencyOptions"
        :series="frequencySeries"
      />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>Retards par ligne</h3>
          <p>Plans nécessitant une action</p>
        </div>

        <span>Alertes</span>
      </header>

      <apexchart
        type="bar"
        height="260"
        :options="lateOptions"
        :series="lateSeries"
      />
    </article>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const monthlySeries = ref([
  {
    name: 'Maintenances réalisées',
    data: [18, 22, 20, 27, 31, 29, 38]
  }
])

const monthlyOptions = ref({
  chart: {
    toolbar: {
      show: false
    },
    fontFamily: 'inherit',
    animations: {
      enabled: true,
      speed: 800
    }
  },

  colors: ['#6A9A2A'],

  plotOptions: {
    bar: {
      borderRadius: 7,
      columnWidth: '46%'
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
      'Juil'
    ],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    labels: {
      style: {
        colors: '#64748B',
        fontSize: '10px'
      }
    }
  },

  yaxis: {
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
      formatter: (value) => `${value} maintenances`
    }
  }
})

const slaSeries = ref([92])

const slaOptions = ref({
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
      startAngle: -130,
      endAngle: 130,

      hollow: {
        size: '65%'
      },

      track: {
        background: '#EEF1E9'
      },

      dataLabels: {
        name: {
          show: true,
          offsetY: 22,
          color: '#64748B',
          fontSize: '11px'
        },

        value: {
          offsetY: -18,
          color: '#111827',
          fontSize: '30px',
          fontWeight: 800,
          formatter: (value) => `${Math.round(value)}%`
        }
      }
    }
  },

  stroke: {
    lineCap: 'round'
  },

  labels: ['À temps']
})

const frequencySeries = ref([12, 22, 18, 8, 4])

const frequencyOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'inherit'
  },

  labels: [
    'Quotidienne',
    'Hebdomadaire',
    'Mensuelle',
    'Trimestrielle',
    'Annuelle'
  ],

  colors: [
    '#4A0A0A',
    '#6A9A2A',
    '#B6C65B',
    '#E8B300',
    '#FF6A00'
  ],

  stroke: {
    width: 4,
    colors: ['#FFFFFF']
  },

  dataLabels: {
    enabled: false
  },

  legend: {
    position: 'bottom',
    fontSize: '10px'
  },

  plotOptions: {
    pie: {
      donut: {
        size: '66%',

        labels: {
          show: true,

          total: {
            show: true,
            label: 'Plans',
            color: '#64748B',
            formatter: () => '64'
          }
        }
      }
    }
  },

  tooltip: {
    y: {
      formatter: (value) => `${value} plans`
    }
  }
})

const lateSeries = ref([
  {
    name: 'Plans en retard',
    data: [5, 3, 2, 1]
  }
])

const lateOptions = ref({
  chart: {
    toolbar: {
      show: false
    },
    fontFamily: 'inherit'
  },

  colors: ['#E31E24'],

  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '42%'
    }
  },

  dataLabels: {
    enabled: true,
    offsetX: 7,
    style: {
      colors: ['#4A0A0A'],
      fontSize: '10px'
    }
  },

  xaxis: {
    categories: [
      'Conditionnement',
      'Production 1',
      'Utilités',
      'Emballage'
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
        fontSize: '10px',
        fontWeight: 600
      }
    }
  },

  grid: {
    show: false
  },

  tooltip: {
    y: {
      formatter: (value) => `${value} plans en retard`
    }
  }
})
</script>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.chart-card {
  min-width: 0;
  overflow: hidden;
  padding: 20px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
  transition: 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(74, 10, 10, 0.08);
}

.chart-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chart-card h3 {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 800;
}

.chart-card p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.chart-card header > span {
  padding: 6px 9px;
  background: #eff5df;
  border-radius: 999px;
  color: #6a9a2a;
  font-size: 10px;
  font-weight: 800;
}

.chart-card :deep(.vue-apexcharts),
.chart-card :deep(.apexcharts-canvas) {
  width: 100% !important;
  max-width: 100%;
}

.chart-card :deep(svg),
.chart-card :deep(foreignObject) {
  max-width: 100%;
}

@media (max-width: 1400px) {
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 750px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
