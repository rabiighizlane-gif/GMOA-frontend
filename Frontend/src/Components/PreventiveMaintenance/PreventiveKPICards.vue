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
import { computed } from 'vue'
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const cardContent = {
  FR: [
    ['Plans preventifs', 64, '8 plans actifs ajoutes', 'tool', 'green'],
    ['Prevues cette semaine', 15, '5 prevues aujourd hui', 'calendar', 'yellow'],
    ['En retard', 4, 'Action requise', 'alert', 'red'],
    ['Realisees ce mois', 38, '+12 % par rapport au mois dernier', 'check', 'green'],
    ['Taux de realisation', '92 %', 'Objectif superieur a 90 %', 'target', 'green'],
    ['Prochaine maintenance', '2 jours', 'Convoyeur M-309', 'clock', 'orange'],
  ],
  EN: [
    ['Preventive plans', 64, '8 active plans added', 'tool', 'green'],
    ['Due this week', 15, '5 due today', 'calendar', 'yellow'],
    ['Overdue', 4, 'Action required', 'alert', 'red'],
    ['Completed this month', 38, '+12% compared with last month', 'check', 'green'],
    ['Completion rate', '92 %', 'Target above 90%', 'target', 'green'],
    ['Next maintenance', '2 days', 'Conveyor M-309', 'clock', 'orange'],
  ],
  AR: [
    ['\u062e\u0637\u0637 \u0648\u0642\u0627\u0626\u064a\u0629', 64, '8 \u062e\u0637\u0637 \u0646\u0634\u0637\u0629 \u0645\u0636\u0627\u0641\u0629', 'tool', 'green'],
    ['\u0645\u0628\u0631\u0645\u062c\u0629 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639', 15, '5 \u0645\u0628\u0631\u0645\u062c\u0629 \u0627\u0644\u064a\u0648\u0645', 'calendar', 'yellow'],
    ['\u0645\u062a\u0623\u062e\u0631\u0629', 4, '\u0625\u062c\u0631\u0627\u0621 \u0645\u0637\u0644\u0648\u0628', 'alert', 'red'],
    ['\u0623\u0646\u062c\u0632\u062a \u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631', 38, '+12 % \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0636\u064a', 'check', 'green'],
    ['\u0646\u0633\u0628\u0629 \u0627\u0644\u0625\u0646\u062c\u0627\u0632', '92 %', '\u0627\u0644\u0647\u062f\u0641 \u0623\u0643\u062b\u0631 \u0645\u0646 90 %', 'target', 'green'],
    ['\u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629', '\u064a\u0648\u0645\u0627\u0646', '\u0646\u0627\u0642\u0644 M-309', 'clock', 'orange'],
  ],
}

const cards = computed(() => (cardContent[language.value] || cardContent.FR).map(([label, value, description, icon, color]) => ({ label, value, description, icon, color })))
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

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
  transition: 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: rgba(91, 155, 215, 0.46);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 46px rgba(0,0,0,.28);
}

.kpi-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 12px;
  font-size: 21px;
}

.kpi-icon svg {
  width: 22px;
  height: 22px;
}

.kpi-icon--green {
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
}

.kpi-icon--yellow {
  background: rgba(250, 204, 21, 0.16);
  color: #fde047;
}

.kpi-icon--orange {
  background: rgba(249, 115, 22, 0.18);
  color: #fdba74;
}

.kpi-icon--red {
  background: rgba(220, 55, 71, 0.18);
  color: #ff7f8e;
}

.kpi-content {
  min-width: 0;
}

.kpi-content p {
  margin: 0;
  color: #aeb9c8;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.kpi-content strong {
  display: block;
  margin: 5px 0;
  color: #f8fbff;
  font-size: 24px;
}

.kpi-content span {
  font-size: 10px;
  font-weight: 600;
}

.text-green {
  color: #bce39d;
}

.text-yellow {
  color: #fde047;
}

.text-orange {
  color: #fdba74;
}

.text-red {
  color: #ff7f8e;
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
