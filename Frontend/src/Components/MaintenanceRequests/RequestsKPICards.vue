<template>
  <section class="kpi-grid">
    <article v-for="card in translatedCards" :key="card.label" class="kpi-card">
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
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})

const languageStore = useLanguageStore()

const labels = {
  FR: {
    total: ['Total des demandes', 'Toutes les demandes enregistrees', '#'],
    new: ['Nouvelles', "Creees aujourd'hui", '+'],
    pending: ['En attente', 'En attente de validation', '...'],
    accepted: ['Acceptees', 'Validees par le responsable', 'OK'],
    rejected: ['Refusees', 'Demandes non retenues', 'X'],
    created: ['Interventions creees', 'Transformees en interventions', '>'],
  },
  EN: {
    total: ['Total requests', 'All registered requests', '#'],
    new: ['New', 'Created today', '+'],
    pending: ['Pending', 'Waiting for validation', '...'],
    accepted: ['Accepted', 'Validated by the manager', 'OK'],
    rejected: ['Rejected', 'Requests not retained', 'X'],
    created: ['Created interventions', 'Converted into interventions', '>'],
  },
  AR: {
    total: ['إجمالي الطلبات', 'كل الطلبات المسجلة', '#'],
    new: ['جديدة', 'تم إنشاؤها اليوم', '+'],
    pending: ['في الانتظار', 'في انتظار المصادقة', '...'],
    accepted: ['مقبولة', 'صادق عليها المسؤول', 'تم'],
    rejected: ['مرفوضة', 'طلبات غير مقبولة', 'X'],
    created: ['تدخلات منشأة', 'تحولت إلى تدخلات', '>'],
  },
}

const translatedCards = computed(() => {
  const dictionary = labels[languageStore.language] || labels.FR
  return props.cards.map((card) => {
    const [label, description, icon] = dictionary[card.labelKey] || [card.label, card.description, card.icon]
    return { ...card, label, description, icon }
  })
})
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
  font-size: 15px;
  font-weight: 900;
}

.kpi-card p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 900;
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
  font-weight: 800;
}

.kpi-icon--green { background: #edf5de; color: #6a9a2a; }
.kpi-icon--yellow { background: #fff4cf; color: #ad7a00; }
.kpi-icon--orange { background: #fff0df; color: #ff6a00; }
.kpi-icon--red { background: #ffe2e2; color: #e31e24; }
.kpi-icon--gray { background: #f1f5f9; color: #64748b; }
.text-green { color: #6a9a2a; }
.text-yellow { color: #ad7a00; }
.text-orange { color: #ff6a00; }
.text-red { color: #e31e24; }
.text-gray { color: #64748b; }

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
