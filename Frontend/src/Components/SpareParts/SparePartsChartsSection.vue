<template>
  <section class="charts-section">
    <article class="chart-card">
      <header>
        <div>
          <h3>Stock par catégorie</h3>
          <p>Répartition des références</p>
        </div>
        <span>Mix</span>
      </header>

      <apexchart type="donut" height="250" :options="categoryOptions" :series="categorySeries" />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>Consommation mensuelle</h3>
          <p>Évolution sur 7 mois</p>
        </div>
        <span>2026</span>
      </header>

      <apexchart type="area" height="250" :options="consumptionOptions" :series="consumptionSeries" />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>Top pièces consommées</h3>
          <p>Top 5 des sorties stock</p>
        </div>
        <span>Top 5</span>
      </header>

      <apexchart type="bar" height="250" :options="topOptions" :series="topSeries" />
    </article>

    <article class="chart-card">
      <header>
        <div>
          <h3>Niveau global du stock</h3>
          <p>Disponibilité globale</p>
        </div>
        <span>SLA</span>
      </header>

      <apexchart type="radialBar" height="250" :options="stockLevelOptions" :series="stockLevelSeries" />
    </article>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const chartBase = {
  fontFamily: 'inherit',
  toolbar: {
    show: false
  },
  animations: {
    enabled: true,
    speed: 800
  }
}

const categorySeries = ref([145, 88, 72, 64, 49, 32])
const categoryOptions = ref({
  chart: {
    type: 'donut',
    ...chartBase
  },
  labels: ['Mécanique', 'Électrique', 'Filtration', 'Transmission', 'Lubrification', 'Pneumatique'],
  colors: ['#6A9A2A', '#4A0A0A', '#B6C65B', '#E8B300', '#FF6A00', '#8AAE4A'],
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
  tooltip: {
    y: {
      formatter: (value) => `${value} pièces`
    }
  }
})

const consumptionSeries = ref([
  {
    name: 'Pièces utilisées',
    data: [62, 74, 69, 88, 91, 83, 94]
  }
])

const consumptionOptions = ref({
  chart: {
    type: 'area',
    ...chartBase
  },
  colors: ['#6A9A2A'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.28,
      opacityTo: 0.02
    }
  },
  xaxis: {
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
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
  }
})

const topSeries = ref([
  {
    name: 'Sorties',
    data: [26, 19, 16, 14, 11]
  }
])

const topOptions = ref({
  chart: {
    type: 'bar',
    ...chartBase
  },
  colors: ['#6A9A2A'],
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
    categories: ['Filtre à huile', 'Roulement 6205', 'Courroie', 'Fusible', 'Huile mécanique'],
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
        fontWeight: 700
      }
    }
  },
  grid: {
    show: false
  }
})

const stockLevelSeries = ref([84])
const stockLevelOptions = ref({
  chart: {
    type: 'radialBar',
    ...chartBase
  },
  colors: ['#6A9A2A'],
  plotOptions: {
    radialBar: {
      hollow: {
        size: '64%'
      },
      track: {
        background: '#EEF1E9'
      },
      dataLabels: {
        name: {
          color: '#64748B',
          fontSize: '11px'
        },
        value: {
          color: '#111827',
          fontSize: '30px',
          fontWeight: 900,
          formatter: (value) => `${Math.round(value)}%`
        }
      }
    }
  },
  stroke: {
    lineCap: 'round'
  },
  labels: ['Disponible']
})
</script>

<style scoped>
.charts-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
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
  font-weight: 900;
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
  font-weight: 900;
}

.chart-card :deep(.vue-apexcharts),
.chart-card :deep(.apexcharts-canvas) {
  width: 100% !important;
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
