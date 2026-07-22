<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="drawer-overlay"
        @click.self="$emit('close')"
      >
        <aside class="drawer">
          <header class="drawer-header">
            <div>
              <span class="drawer-reference">
                {{ maintenance?.id }}
              </span>

              <h2>{{ maintenance?.plan }}</h2>
            </div>

            <button
              class="close-button"
              type="button"
              @click="$emit('close')"
            >
              <PreventiveIcon name="x" />
            </button>
          </header>

          <nav class="drawer-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="{ active: activeTab === tab.id }"
              type="button"
              @click="activeTab = tab.id"
            >
              <PreventiveIcon :name="tab.icon" />
              {{ tab.label }}
            </button>
          </nav>

          <div
            v-if="maintenance"
            class="drawer-body"
          >
            <section v-if="activeTab === 'information'">
              <h3>{{ content.informationTitle }}</h3>

              <div class="details-grid">
                <div>
                  <span>{{ content.machine }}</span>
                  <strong>{{ maintenance.machine }}</strong>
                </div>

                <div>
                  <span>{{ content.line }}</span>
                  <strong>{{ maintenance.line }}</strong>
                </div>

                <div>
                  <span>{{ content.frequency }}</span>
                  <strong>{{ maintenance.frequency }}</strong>
                </div>

                <div>
                  <span>{{ content.responsible }}</span>
                  <strong>{{ maintenance.technician }}</strong>
                </div>

                <div>
                  <span>{{ content.lastExecution }}</span>
                  <strong>{{ maintenance.lastExecution }}</strong>
                </div>

                <div>
                  <span>{{ content.nextDueDate }}</span>
                  <strong>{{ maintenance.nextDueDate }}</strong>
                </div>
              </div>

              <h3>{{ content.description }}</h3>

              <p class="description">
                {{ maintenance.description }}
              </p>
            </section>

            <section v-if="activeTab === 'tasks'">
              <h3>{{ content.tasksTitle }}</h3>

              <label
                v-for="task in tasks"
                :key="task.id"
                class="task-item"
              >
                <input
                  v-model="task.completed"
                  type="checkbox"
                />

                <span :class="{ completed: task.completed }">
                  {{ task.label }}
                </span>
              </label>
            </section>

            <section v-if="activeTab === 'parts'">
              <h3>{{ content.partsTitle }}</h3>

              <div
                v-for="part in parts"
                :key="part.reference"
                class="part-item"
              >
                <div>
                  <strong>{{ part.name }}</strong>
                  <span>{{ part.reference }}</span>
                </div>

                <div>
                  <strong>x{{ part.quantity }}</strong>
                  <span :class="part.available ? 'available' : 'unavailable'">
                    {{ part.available ? content.available : content.unavailable }}
                  </span>
                </div>
              </div>
            </section>

            <section v-if="activeTab === 'history'">
              <h3>{{ content.historyTitle }}</h3>

              <div class="timeline">
                <article
                  v-for="history in histories"
                  :key="history.title"
                  class="timeline-item"
                >
                  <span class="timeline-dot"></span>

                  <div>
                    <strong>{{ history.title }}</strong>
                    <p>{{ history.description }}</p>
                    <small>{{ history.date }}</small>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <footer class="drawer-footer">
            <button class="secondary-button" type="button">
              {{ content.print }}
            </button>

            <button
              class="primary-button"
              type="button"
              @click="$emit('edit', maintenance)"
            >
              {{ content.edit }}
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'

defineProps({
  open: Boolean,
  maintenance: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'edit'])

const activeTab = ref('information')
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: {
    tabs: ['Informations', 'Taches', 'Pieces', 'Historique'],
    informationTitle: 'Informations generales',
    machine: 'Machine',
    line: 'Ligne',
    frequency: 'Frequence',
    responsible: 'Responsable',
    lastExecution: 'Derniere realisation',
    nextDueDate: 'Prochaine echeance',
    description: 'Description',
    tasksTitle: 'Checklist des taches',
    partsTitle: 'Pieces prevues',
    historyTitle: 'Historique du plan',
    available: 'Disponible',
    unavailable: 'Stock insuffisant',
    print: 'Imprimer',
    edit: 'Modifier le plan',
  },
  EN: {
    tabs: ['Information', 'Tasks', 'Parts', 'History'],
    informationTitle: 'General information',
    machine: 'Machine',
    line: 'Line',
    frequency: 'Frequency',
    responsible: 'Responsible',
    lastExecution: 'Last completion',
    nextDueDate: 'Next due date',
    description: 'Description',
    tasksTitle: 'Task checklist',
    partsTitle: 'Planned parts',
    historyTitle: 'Plan history',
    available: 'Available',
    unavailable: 'Insufficient stock',
    print: 'Print',
    edit: 'Edit plan',
  },
  AR: {
    tabs: ['معلومات', 'مهام', 'قطع', 'السجل'],
    informationTitle: 'معلومات عامة',
    machine: 'الآلة',
    line: 'الخط',
    frequency: 'التواتر',
    responsible: 'المسؤول',
    lastExecution: 'آخر إنجاز',
    nextDueDate: 'الموعد القادم',
    description: 'الوصف',
    tasksTitle: 'لائحة المهام',
    partsTitle: 'القطع المبرمجة',
    historyTitle: 'سجل الخطة',
    available: 'متوفر',
    unavailable: 'المخزون غير كاف',
    print: 'طباعة',
    edit: 'تعديل الخطة',
  },
}

const content = computed(() => translations[language.value] || translations.FR)

const tabs = computed(() => [
  { id: 'information', label: content.value.tabs[0], icon: 'info' },
  { id: 'tasks', label: content.value.tabs[1], icon: 'check' },
  { id: 'parts', label: content.value.tabs[2], icon: 'tool' },
  { id: 'history', label: content.value.tabs[3], icon: 'clock' },
])

const tasks = ref([
  { id: 1, label: "Couper et sécuriser l'alimentation", completed: true },
  { id: 2, label: "Contrôler le niveau d'huile", completed: false },
  { id: 3, label: 'Nettoyer les filtres', completed: false },
  { id: 4, label: 'Vérifier les roulements', completed: false },
  { id: 5, label: 'Tester le fonctionnement', completed: false }
])

const parts = [
  {
    name: 'Filtre industriel',
    reference: 'FLT-204',
    quantity: 2,
    available: true
  },
  {
    name: 'Huile mécanique',
    reference: 'HUI-030',
    quantity: 1,
    available: true
  },
  {
    name: 'Roulement moteur',
    reference: 'RLT-122',
    quantity: 2,
    available: false
  }
]

const histories = [
  {
    title: 'Plan créé',
    description: 'Création du plan de maintenance préventive.',
    date: '10 juin 2026 à 09:30'
  },
  {
    title: 'Responsable affecté',
    description: 'Plan affecté au technicien Nabil Amrani.',
    date: '10 juin 2026 à 10:15'
  },
  {
    title: 'Dernière maintenance réalisée',
    description: 'Toutes les tâches ont été validées.',
    date: '20 juin 2026 à 15:45'
  }
]
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(5, 10, 18, 0.56);
  backdrop-filter: blur(3px);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  width: min(520px, 100%);
  height: 100%;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(31,43,57,.98), rgba(16,25,36,.98)), #101924;
  color: #f4f7fb;
  border-left: 1px solid rgba(126, 146, 170, 0.24);
  box-shadow: -18px 0 54px rgba(0, 0, 0, 0.42);
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

.drawer-reference {
  color: #83b95c;
  font-size: 12px;
  font-weight: 800;
}

.drawer-header h2 {
  margin: 5px 0 0;
  color: #f8fbff;
  font-size: 21px;
}

.close-button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(210, 221, 234, 0.28);
  border-radius: 8px;
  color: #f2f6fb;
  cursor: pointer;
}

.close-button svg {
  width: 17px;
  height: 17px;
}

.drawer-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 20px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

.drawer-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 12px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.drawer-tabs button svg {
  width: 16px;
  height: 16px;
}

.drawer-tabs button.active {
  border-color: #83b95c;
  color: #bce39d;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.drawer-body h3 {
  margin: 5px 0 16px;
  color: #f8fbff;
  font-size: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.details-grid div {
  padding: 13px;
  background: rgba(13, 21, 32, 0.72);
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 8px;
}

.details-grid span,
.part-item span {
  display: block;
  color: #8d9aab;
  font-size: 10px;
}

.details-grid strong {
  display: block;
  margin-top: 5px;
  color: #f4f7fb;
  font-size: 12px;
}

.description {
  padding: 15px;
  background: rgba(13, 21, 32, 0.72);
  border-radius: 8px;
  color: #aab7c7;
  font-size: 13px;
  line-height: 1.7;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 10px;
  padding: 14px;
  background: rgba(13, 21, 32, 0.72);
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 8px;
}

.task-item span.completed {
  color: #94a3b8;
  text-decoration: line-through;
}

.part-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 14px;
  background: rgba(13, 21, 32, 0.72);
  border-radius: 8px;
}

.part-item > div:last-child {
  text-align: right;
}

.available {
  color: #bce39d !important;
}

.unavailable {
  color: #ff7f8e !important;
}

.timeline {
  position: relative;
  margin-left: 8px;
  padding-left: 22px;
  border-left: 2px solid rgba(116, 135, 158, 0.28);
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  top: 2px;
  left: -29px;
  width: 12px;
  height: 12px;
  background: #83b95c;
  border: 3px solid #101924;
  border-radius: 50%;
}

.timeline-item p {
  margin: 5px 0;
  color: #aab7c7;
  font-size: 12px;
}

.timeline-item small {
  color: #8d9aab;
}

.drawer-footer {
  display: flex;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid rgba(116, 135, 158, 0.15);
}

.drawer-footer button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}

.secondary-button {
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(210, 221, 234, 0.28);
  color: #f2f6fb;
}

.primary-button {
  background: #5f8f2f;
  border: 1px solid rgba(131, 185, 92, 0.44);
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-active .drawer,
.fade-leave-active .drawer {
  transition: transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .drawer,
.fade-leave-to .drawer {
  transform: translateX(100%);
}
</style>
