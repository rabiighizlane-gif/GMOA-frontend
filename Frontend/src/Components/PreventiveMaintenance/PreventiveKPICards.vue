<template>
  <section class="kpi-grid">
    <article
      v-for="card in cards"
      :key="card.label"
      class="kpi-card"
    >
      <div
        class="kpi-icon"
        :class="`kpi-icon--${card.color}`"
      >
        <PreventiveIcon :name="card.icon" />
      </div>

      <div class="kpi-content">
        <p>{{ card.label }}</p>
        <strong>{{ card.value }}</strong>
        <span :class="`text-${card.color}`">
          {{ card.description }}
        </span>
      </div>
    </article>
  </section>
</template>

<script setup>
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'

const cards = [
  {
    label: 'Plans préventifs',
    value: 64,
    description: '8 plans actifs ajoutés',
    icon: 'tool',
    color: 'green'
  },
  {
    label: 'Prévues cette semaine',
    value: 15,
    description: '5 prévues aujourd’hui',
    icon: 'calendar',
    color: 'yellow'
  },
  {
    label: 'En retard',
    value: 4,
    description: 'Action requise',
    icon: 'alert',
    color: 'red'
  },
  {
    label: 'Réalisées ce mois',
    value: 38,
    description: '+12 % par rapport au mois dernier',
    icon: 'check',
    color: 'green'
  },
  {
    label: 'Taux de réalisation',
    value: '92 %',
    description: 'Objectif supérieur à 90 %',
    icon: 'target',
    color: 'green'
  },
  {
    label: 'Prochaine maintenance',
    value: '2 jours',
    description: 'Convoyeur M-309',
    icon: 'clock',
    color: 'orange'
  }
]
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 112px;
  padding: 18px;
  background: #fff;
  border: 1px solid #edf0e8;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(74, 10, 10, 0.05);
  transition: 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(74, 10, 10, 0.08);
}

.kpi-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 14px;
  font-size: 21px;
}

.kpi-icon svg {
  width: 22px;
  height: 22px;
}

.kpi-icon--green {
  background: #edf5de;
  color: #6a9a2a;
}

.kpi-icon--yellow {
  background: #fff6d7;
  color: #b88700;
}

.kpi-icon--orange {
  background: #fff0df;
  color: #ff6a00;
}

.kpi-icon--red {
  background: #ffe7e7;
  color: #e31e24;
}

.kpi-content {
  min-width: 0;
}

.kpi-content p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.kpi-content strong {
  display: block;
  margin: 5px 0;
  color: #111827;
  font-size: 24px;
}

.kpi-content span {
  font-size: 10px;
  font-weight: 600;
}

.text-green {
  color: #6a9a2a;
}

.text-yellow {
  color: #b88700;
}

.text-orange {
  color: #ff6a00;
}

.text-red {
  color: #e31e24;
}

@media (max-width: 1500px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
