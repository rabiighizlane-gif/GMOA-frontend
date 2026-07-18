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
        <span>{{ card.icon }}</span>
      </div>

      <div>
        <p>{{ card.label }}</p>
        <strong>{{ card.value }}</strong>
        <small :class="`text-${card.color}`">{{ card.description }}</small>
      </div>
    </article>
  </section>
</template>

<script setup>
const cards = [
  {
    label: 'Total des pièces',
    value: '524',
    description: '78 références différentes',
    icon: '▦',
    color: 'green'
  },
  {
    label: 'Pièces disponibles',
    value: '476',
    description: 'Stock opérationnel',
    icon: '✓',
    color: 'green'
  },
  {
    label: 'Stock faible',
    value: '18',
    description: 'Réapprovisionnement conseillé',
    icon: '!',
    color: 'orange'
  },
  {
    label: 'Rupture de stock',
    value: '6',
    description: 'Action immédiate requise',
    icon: '×',
    color: 'red'
  },
  {
    label: 'Valeur du stock',
    value: '284 000 DH',
    description: 'Valeur totale estimée',
    icon: 'DH',
    color: 'yellow'
  },
  {
    label: 'Utilisées ce mois',
    value: '94',
    description: '12 % de plus que le mois dernier',
    icon: '↗',
    color: 'green'
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
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(74, 10, 10, 0.05);
  transition: 0.22s ease;
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
  font-size: 18px;
  font-weight: 900;
}

.kpi-card p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.kpi-card strong {
  display: block;
  margin: 5px 0;
  color: #111827;
  font-size: 24px;
}

.kpi-card small {
  font-size: 10px;
  font-weight: 700;
}

.kpi-icon--green {
  background: #edf5de;
  color: #6a9a2a;
}

.kpi-icon--orange {
  background: #fff0df;
  color: #ff6a00;
}

.kpi-icon--red {
  background: #ffe7e7;
  color: #e31e24;
}

.kpi-icon--yellow {
  background: #fff6d7;
  color: #b88700;
}

.text-green {
  color: #6a9a2a;
}

.text-orange {
  color: #ff6a00;
}

.text-red {
  color: #e31e24;
}

.text-yellow {
  color: #b88700;
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
