<template>
  <section class="kpi-grid">
    <article v-for="card in cards" :key="card.label" class="kpi-card">
      <div class="kpi-icon" :class="`kpi-icon--${card.color}`">{{ card.icon }}</div>
      <div>
        <p>{{ card.label }}</p>
        <strong>{{ card.value }}</strong>
        <small :class="`text-${card.color}`">{{ card.description }}</small>
      </div>
    </article>
  </section>
</template>

<script setup>
defineProps({ cards: { type: Array, default: () => [] } })
</script>

<style scoped>
.kpi-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 104px;
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(131, 185, 92, 0.08), rgba(18, 28, 39, 0.02)),
    rgba(18, 28, 39, 0.86);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
  transition: 0.22s ease;
}
.kpi-card:hover { transform: translateY(-2px); border-color: rgba(91, 155, 215, 0.46); box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 46px rgba(0,0,0,.28); }
.kpi-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 900;
}
.kpi-card p { margin: 0; color: #aeb9c8; font-size: 11px; font-weight: 900; text-transform: uppercase; }
.kpi-card strong { display: block; margin: 5px 0; color: #f8fbff; font-size: 24px; }
.kpi-card small { font-size: 10px; font-weight: 800; }
.kpi-icon--green { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
.kpi-icon--orange { background: rgba(228, 171, 68, 0.18); color: #ffd27b; }
.kpi-icon--red { background: rgba(220, 55, 71, 0.18); color: #ff7f8e; }
.kpi-icon--yellow { background: rgba(228, 171, 68, 0.16); color: #e4ab44; }
.text-green { color: #bce39d; }
.text-orange { color: #ffd27b; }
.text-red { color: #ff7f8e; }
.text-yellow { color: #e4ab44; }
@media (max-width: 1500px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 800px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .kpi-grid { grid-template-columns: 1fr; } }
</style>
