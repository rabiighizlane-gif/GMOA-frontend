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
  background:
    linear-gradient(180deg, rgba(131, 185, 92, 0.08), rgba(18, 28, 39, 0.02)),
    rgba(18, 28, 39, 0.86);
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 40px rgba(0, 0, 0, 0.24);
  transition: 0.22s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 20px 44px rgba(0, 0, 0, 0.28);
}

.kpi-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
}

.kpi-card p {
  margin: 0;
  color: #aeb9c8;
  font-size: 11px;
  font-weight: 900;
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
  font-weight: 800;
}

.kpi-icon--green { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
.kpi-icon--yellow { background: rgba(250, 204, 21, 0.16); color: #fde047; }
.kpi-icon--orange { background: rgba(249, 115, 22, 0.18); color: #fdba74; }
.kpi-icon--red { background: rgba(220, 55, 71, 0.18); color: #ff7f8e; }
.kpi-icon--gray { background: rgba(126, 146, 170, 0.16); color: #d7e0ec; }
.text-green { color: #bce39d; }
.text-yellow { color: #fde047; }
.text-orange { color: #fdba74; }
.text-red { color: #ff7f8e; }
.text-gray { color: #aab7c7; }

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
