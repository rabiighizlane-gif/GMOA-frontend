<template>
  <section class="charts-grid" aria-label="Graphiques interventions">
    <article class="chart-card">
      <header>
        <h3>Interventions par mois</h3>
        <span>2026</span>
      </header>
      <div class="bar-chart">
        <div v-for="item in monthly" :key="item.label" class="bar-item">
          <span :style="{ height: `${item.value}%` }"></span>
          <small>{{ item.label }}</small>
        </div>
      </div>
    </article>

    <article class="chart-card">
      <header>
        <h3>Répartition par type</h3>
        <span>Mix</span>
      </header>
      <div class="donut-wrap">
        <div class="donut"></div>
        <ul>
          <li><span class="dot preventive"></span>Préventive 45%</li>
          <li><span class="dot corrective"></span>Corrective 35%</li>
          <li><span class="dot improvement"></span>Amélioration 20%</li>
        </ul>
      </div>
    </article>

    <article class="chart-card">
      <header>
        <h3>Top 5 techniciens</h3>
        <span>Clôturées</span>
      </header>
      <div class="ranking">
        <div v-for="tech in technicians" :key="tech.name">
          <strong>{{ tech.name }}</strong>
          <span><i :style="{ width: `${tech.score}%` }"></i></span>
          <small>{{ tech.count }}</small>
        </div>
      </div>
    </article>

    <article class="chart-card">
      <header>
        <h3>Temps moyen d'intervention</h3>
        <span>Heures</span>
      </header>
      <svg class="line-chart" viewBox="0 0 280 140" role="img" aria-label="Evolution du temps moyen">
        <path class="grid" d="M30 20H260M30 55H260M30 90H260M30 125H260" />
        <path class="trend-area" d="M30 105 L70 96 L110 82 L150 88 L190 64 L230 58 L260 44 L260 125 L30 125 Z" />
        <path class="trend-line" d="M30 105 L70 96 L110 82 L150 88 L190 64 L230 58 L260 44" />
        <g class="points">
          <circle cx="30" cy="105" r="4" />
          <circle cx="110" cy="82" r="4" />
          <circle cx="190" cy="64" r="4" />
          <circle cx="260" cy="44" r="4" />
        </g>
      </svg>
    </article>
  </section>
</template>

<script setup>
import InterventionsByMonth from '@/Components/charts/InterventionsByMonth.vue'
import InterventionTypesChart from '@/Components/charts/InterventionTypesChart.vue'
import TopTechniciansChart from '@/Components/charts/TopTechniciansChart.vue'
import AverageTimeChart from '@/Components/charts/AverageTimeChart.vue'
import PriorityChart from '@/Components/charts/PriorityChart.vue'
import SlaGauge from '@/Components/charts/SlaGauge.vue'
const monthly = [
  { label: 'Jan', value: 44 },
  { label: 'Fév', value: 58 },
  { label: 'Mar', value: 52 },
  { label: 'Avr', value: 68 },
  { label: 'Mai', value: 72 },
  { label: 'Juin', value: 86 },
]

const technicians = [
  { name: 'Nabil', score: 96, count: 28 },
  { name: 'Ahmed', score: 82, count: 24 },
  { name: 'Youssef', score: 74, count: 21 },
  { name: 'Sara', score: 63, count: 18 },
  { name: 'Karim', score: 55, count: 15 },
]
</script>

<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.chart-card {
  min-height: 250px;
  border: 1px solid var(--sc-border);
  border-radius: 20px;
  background: var(--sc-surface);
  padding: 18px;
  box-shadow: var(--sc-shadow);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

h3 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 15px;
  font-weight: 950;
}

header span {
  border-radius: 999px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 950;
}

.bar-chart {
  height: 168px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: end;
  gap: 10px;
}

.bar-item {
  height: 100%;
  display: grid;
  align-items: end;
  gap: 8px;
}

.bar-item span {
  display: block;
  min-height: 26px;
  border-radius: 999px 999px 8px 8px;
  background: linear-gradient(180deg, var(--sc-primary), var(--sc-secondary));
  box-shadow: 0 12px 24px rgba(106, 154, 42, 0.18);
}

small,
li {
  color: var(--sc-muted);
  font-size: 11px;
  font-weight: 850;
}

.donut-wrap {
  display: grid;
  place-items: center;
  gap: 15px;
}

.donut {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: conic-gradient(var(--sc-primary) 0 45%, var(--sc-warning) 45% 80%, var(--sc-attention) 80% 100%);
  box-shadow: inset 0 0 0 28px var(--sc-surface), 0 14px 28px rgba(74, 10, 10, 0.08);
}

ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.preventive {
  background: var(--sc-primary);
}

.corrective {
  background: var(--sc-warning);
}

.improvement {
  background: var(--sc-attention);
}

.ranking {
  display: grid;
  gap: 14px;
}

.ranking div {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) 26px;
  align-items: center;
  gap: 10px;
}

.ranking strong {
  color: var(--sc-dark);
  font-size: 12px;
  font-weight: 950;
}

.ranking span {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(74, 10, 10, 0.08);
}

.ranking i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--sc-primary);
}

.line-chart {
  width: 100%;
  height: 168px;
}

.grid {
  stroke: rgba(74, 10, 10, 0.08);
}

.trend-area {
  fill: rgba(106, 154, 42, 0.12);
}

.trend-line {
  fill: none;
  stroke: var(--sc-primary);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.points circle {
  fill: var(--sc-surface);
  stroke: var(--sc-primary);
  stroke-width: 3;
}

@media (max-width: 1180px) {
  .charts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
