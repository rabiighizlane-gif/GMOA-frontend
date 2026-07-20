<template>
  <section class="kpi-grid">
    <article v-for="card in cards" :key="card.label" class="kpi-card">
      <div class="kpi-icon" :class="`kpi-icon--${card.color}`">
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
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: [
    ['Total des pieces', '524', '78 references differentes', '▦', 'green'],
    ['Pieces disponibles', '476', 'Stock operationnel', '✓', 'green'],
    ['Stock faible', '18', 'Reapprovisionnement conseille', '!', 'orange'],
    ['Rupture de stock', '6', 'Action immediate requise', 'x', 'red'],
    ['Valeur du stock', '284 000 DH', 'Valeur totale estimee', 'DH', 'yellow'],
    ['Utilisees ce mois', '94', '12 % de plus que le mois dernier', '↗', 'green'],
  ],
  EN: [
    ['Total parts', '524', '78 different references', '▦', 'green'],
    ['Available parts', '476', 'Operational stock', '✓', 'green'],
    ['Low stock', '18', 'Restock recommended', '!', 'orange'],
    ['Out of stock', '6', 'Immediate action required', 'x', 'red'],
    ['Stock value', '284 000 DH', 'Estimated total value', 'DH', 'yellow'],
    ['Used this month', '94', '12% more than last month', '↗', 'green'],
  ],
  AR: [
    ['إجمالي القطع', '524', '78 مرجعا مختلفا', '▦', 'green'],
    ['القطع المتوفرة', '476', 'المخزون عملي', '✓', 'green'],
    ['مخزون منخفض', '18', 'ينصح بإعادة التزويد', '!', 'orange'],
    ['نفاد المخزون', '6', 'إجراء فوري مطلوب', 'x', 'red'],
    ['قيمة المخزون', '284 000 DH', 'القيمة الإجمالية المقدرة', 'DH', 'yellow'],
    ['المستعملة هذا الشهر', '94', '12% أكثر من الشهر الماضي', '↗', 'green'],
  ],
}

const cards = computed(() =>
  (translations[language.value] || translations.FR).map(([label, value, description, icon, color]) => ({
    label,
    value,
    description,
    icon,
    color,
  }))
)
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

.kpi-icon--green { background: #edf5de; color: #6a9a2a; }
.kpi-icon--orange { background: #fff0df; color: #ff6a00; }
.kpi-icon--red { background: #ffe7e7; color: #e31e24; }
.kpi-icon--yellow { background: #fff6d7; color: #b88700; }
.text-green { color: #6a9a2a; }
.text-orange { color: #ff6a00; }
.text-red { color: #e31e24; }
.text-yellow { color: #b88700; }

@media (max-width: 1500px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 800px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 520px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
