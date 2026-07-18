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
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  padding: 18px;
  box-shadow: var(--sc-shadow);
  animation: intervention-rise 0.45s ease both;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: rgba(106, 154, 42, 0.28);
  box-shadow: 0 18px 44px rgba(74, 10, 10, 0.11);
}

.kpi-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 14px;
  background: var(--sc-soft-primary);
  color: var(--sc-primary);
  font-size: 21px;
}

.kpi-card.warning .kpi-icon {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.kpi-card.danger .kpi-icon {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.kpi-card.attention .kpi-icon {
  background: var(--sc-soft-attention);
  color: var(--sc-attention);
}

.kpi-card p,
.kpi-card strong,
.kpi-card small {
  display: block;
}

.kpi-card p {
  margin: 0;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
}

.kpi-card strong {
  margin-top: 8px;
  color: var(--sc-dark);
  font-size: 27px;
  font-weight: 950;
  line-height: 1;
}

.kpi-card small {
  margin-top: 10px;
  color: var(--sc-primary);
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
