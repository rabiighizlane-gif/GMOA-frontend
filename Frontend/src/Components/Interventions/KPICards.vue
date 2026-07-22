<template>
  <section class="kpi-grid" aria-label="Indicateurs interventions">
    <article v-for="card in cards" :key="card.title" class="kpi-card" :class="card.tone">
      <span class="kpi-icon"><InterventionIcon :name="card.icon" /></span>
      <div>
        <p>{{ card.title }}</p>
        <strong>{{ card.value }}</strong>
        <small>{{ card.evolution }}</small>
      </div>
    </article>
  </section>
</template>

<script setup>
import InterventionIcon from './InterventionIcon.vue'

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 14px;
}

.kpi-card {
  min-height: 132px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(131, 185, 92, 0.08), rgba(18, 28, 39, 0.02)),
    rgba(18, 28, 39, 0.86);
  padding: 18px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
  animation: intervention-rise 0.45s ease both;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: rgba(91, 155, 215, 0.46);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 46px rgba(0,0,0,.28);
}

.kpi-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 12px;
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
  font-size: 21px;
}

.kpi-card.warning .kpi-icon {
  background: rgba(228, 171, 68, 0.18);
  color: #ffd27b;
}

.kpi-card.danger .kpi-icon {
  background: rgba(220, 55, 71, 0.18);
  color: #ff7f8e;
}

.kpi-card.attention .kpi-icon {
  background: rgba(228, 171, 68, 0.16);
  color: #e4ab44;
}

.kpi-card p,
.kpi-card strong,
.kpi-card small {
  display: block;
}

.kpi-card p {
  margin: 0;
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 900;
}

.kpi-card strong {
  margin-top: 8px;
  color: #f8fbff;
  font-size: 27px;
  font-weight: 950;
  line-height: 1;
}

.kpi-card small {
  margin-top: 10px;
  color: #bce39d;
  font-size: 12px;
  font-weight: 850;
}

@keyframes intervention-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1320px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }
}

@media (max-width: 760px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
