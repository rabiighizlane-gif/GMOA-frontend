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
  background:
    linear-gradient(180deg, rgba(131, 185, 92, 0.08), rgba(18, 28, 39, 0.02)),
    rgba(18, 28, 39, 0.86);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
}

.kpi-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 900;
}

.kpi-card p {
  margin: 0;
  color: #aeb9c8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.kpi-card strong {
  display: block;
  margin: 5px 0;
  color: #f8fbff;
  font-size: 24px;
}

.kpi-card small {
  font-size: 10px;
  font-weight: 700;
}

.kpi-icon--green { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
.kpi-icon--orange { background: rgba(249, 115, 22, 0.18); color: #fdba74; }
.kpi-icon--red { background: rgba(220, 55, 71, 0.18); color: #ff7f8e; }
.kpi-icon--yellow { background: rgba(250, 204, 21, 0.16); color: #fde047; }
.text-green { color: #bce39d; }
.text-orange { color: #fdba74; }
.text-red { color: #ff7f8e; }
.text-yellow { color: #fde047; }

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
