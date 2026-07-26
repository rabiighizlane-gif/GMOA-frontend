<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="intervention" class="drawer-layer" @click.self="$emit('close')">
        <aside class="drawer-panel" aria-label="Detail intervention">
          <header>
            <div>
              <span>{{ intervention.code }}</span>
              <h2>{{ intervention.machine }}</h2>
              <p>{{ intervention.description || '-' }}</p>
            </div>
            <button type="button" aria-label="Fermer" @click="$emit('close')">
              <InterventionIcon name="x" />
            </button>
          </header>

          <nav class="drawer-tabs">
            <button
              v-for="tab in tabs"
              :key="tab"
              type="button"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </nav>

          <section v-if="activeTab === 'Informations'" class="drawer-content">
            <div class="info-grid">
              <article v-for="item in generalInfo" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>

            <h3>Responsable</h3>
            <div class="responsible-card">
              <span class="avatar" :style="{ background: intervention.technician.color }">
                {{ intervention.technician.initials }}
              </span>
              <div>
                <strong>{{ intervention.technician.name }}</strong>
                <small>{{ intervention.raw?.technician?.email || 'Non affecte' }}</small>
              </div>
            </div>
          </section>

          <section v-else-if="activeTab === 'Panne'" class="drawer-content">
            <div class="info-grid">
              <article>
                <span>Code panne</span>
                <strong>{{ intervention.raw?.breakdown?.code || '-' }}</strong>
              </article>
              <article>
                <span>Statut panne</span>
                <strong>{{ intervention.raw?.breakdown?.status || '-' }}</strong>
              </article>
              <article>
                <span>Criticite</span>
                <strong>{{ intervention.raw?.breakdown?.severity || '-' }}</strong>
              </article>
            </div>
          </section>

          <section v-else class="drawer-content">
            <ol class="timeline">
              <li v-for="event in history" :key="event.label">
                <span></span>
                <div>
                  <strong>{{ event.label }}</strong>
                  <small>{{ event.time }}</small>
                  <p>{{ event.description }}</p>
                </div>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import InterventionIcon from './InterventionIcon.vue'

const props = defineProps({
  intervention: {
    type: Object,
    default: null,
  },
})

defineEmits(['close'])

const tabs = ['Informations', 'Panne', 'Historique']
const activeTab = ref('Informations')

watch(
  () => props.intervention?.id,
  () => {
    activeTab.value = 'Informations'
  },
)

const generalInfo = computed(() => {
  if (!props.intervention) return []
  return [
    { label: 'Machine', value: props.intervention.machine },
    { label: 'Ligne', value: props.intervention.line },
    { label: 'Zone', value: props.intervention.zone },
    { label: 'Type intervention', value: props.intervention.typeLabel },
    { label: 'Priorite', value: props.intervention.priorityLabel },
    { label: 'Statut', value: props.intervention.statusLabel },
    { label: 'Creation', value: formatDateTime(props.intervention.raw?.created_at) },
    { label: 'Planification', value: formatDateTime(props.intervention.raw?.scheduled_at) },
    { label: 'Debut', value: props.intervention.start },
    { label: 'Fin', value: props.intervention.end },
    { label: 'Duree', value: props.intervention.duration },
  ]
})

const history = computed(() => {
  if (!props.intervention) return []
  const raw = props.intervention.raw || {}
  return [
    raw.created_at && { label: 'Creation', time: formatDateTime(raw.created_at), description: 'Intervention creee dans SmartCalyx.' },
    raw.scheduled_at && { label: 'Planification', time: formatDateTime(raw.scheduled_at), description: 'Date planifiee enregistree.' },
    raw.started_at && { label: 'Debut', time: formatDateTime(raw.started_at), description: 'Intervention demarree.' },
    raw.completed_at && { label: 'Cloture', time: formatDateTime(raw.completed_at), description: 'Intervention terminee.' },
    raw.updated_at && { label: 'Derniere mise a jour', time: formatDateTime(raw.updated_at), description: 'Donnees synchronisees avec PostgreSQL.' },
  ].filter(Boolean)
})

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.drawer-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  background: rgba(5, 10, 18, 0.56);
  backdrop-filter: blur(3px);
}

.drawer-panel {
  width: min(430px, 92vw);
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid rgba(126, 146, 170, 0.24);
  background: linear-gradient(180deg, rgba(31,43,57,.98), rgba(16,25,36,.98)), #101924;
  color: #f4f7fb;
  box-shadow: -28px 0 80px rgba(0, 0, 0, 0.42);
}

header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 24px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

header span,
small {
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 850;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  margin-top: 6px;
  color: #f8fbff;
  font-size: 24px;
  font-weight: 950;
  line-height: 1.1;
}

header p {
  margin-top: 8px;
  color: #aab7c7;
  font-size: 13px;
  font-weight: 800;
}

header button {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid rgba(210, 221, 234, 0.28);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.82);
  color: #f2f6fb;
  cursor: pointer;
}

.drawer-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 14px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

.drawer-tabs button {
  min-height: 38px;
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.72);
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.drawer-tabs button.active {
  border-color: rgba(131, 185, 92, 0.54);
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
}

.drawer-content {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-grid article,
.responsible-card {
  border: 1px solid rgba(126, 146, 170, 0.2);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.72);
  padding: 13px;
}

.info-grid strong,
.responsible-card strong,
.timeline strong {
  display: block;
  margin-top: 5px;
  color: #f4f7fb;
  font-size: 13px;
  font-weight: 950;
}

h3 {
  margin: 20px 0 10px;
  color: #f8fbff;
  font-size: 15px;
  font-weight: 950;
}

.responsible-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  font-weight: 950;
}

.timeline {
  position: relative;
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0 0 0 24px;
  list-style: none;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 7px;
  width: 2px;
  background: rgba(116, 135, 158, 0.28);
}

.timeline li {
  position: relative;
}

.timeline li > span {
  position: absolute;
  top: 5px;
  left: -22px;
  width: 16px;
  height: 16px;
  border: 3px solid #101924;
  border-radius: 50%;
  background: var(--sc-primary);
  box-shadow: 0 0 0 1px rgba(126, 146, 170, 0.24);
}

.timeline p {
  margin-top: 5px;
  color: #aab7c7;
  font-size: 12px;
  font-weight: 780;
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-fade-enter-active .drawer-panel,
.drawer-fade-leave-active .drawer-panel {
  transition: transform 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-fade-enter-from .drawer-panel,
.drawer-fade-leave-to .drawer-panel {
  transform: translateX(100%);
}

:global(html[data-theme='light']) .drawer-layer {
  background: rgba(74, 10, 10, 0.22);
}

:global(html[data-theme='light']) .drawer-panel {
  border-left-color: #edf0e8;
  background: #ffffff;
  background-image: none;
  color: #4a0a0a;
  box-shadow: -24px 0 70px rgba(74, 10, 10, 0.16);
}

:global(html[data-theme='light']) .drawer-panel header,
:global(html[data-theme='light']) .drawer-tabs {
  border-color: #edf0e8;
}

:global(html[data-theme='light']) .drawer-panel h2,
:global(html[data-theme='light']) .drawer-panel h3,
:global(html[data-theme='light']) .info-grid strong,
:global(html[data-theme='light']) .responsible-card strong,
:global(html[data-theme='light']) .timeline strong {
  color: #4a0a0a;
}

:global(html[data-theme='light']) .drawer-panel p,
:global(html[data-theme='light']) .drawer-panel small,
:global(html[data-theme='light']) .drawer-panel header span {
  color: #53667f;
}

:global(html[data-theme='light']) .info-grid article,
:global(html[data-theme='light']) .responsible-card {
  border-color: #edf0e8;
  background: #f7f9f3;
}

:global(html[data-theme='light']) .drawer-tabs button,
:global(html[data-theme='light']) .drawer-panel header button {
  border-color: #dfe5d6;
  background: #ffffff;
  color: #4a0a0a;
}

:global(html[data-theme='light']) .drawer-tabs button.active {
  border-color: #b6c65b;
  background: #e3edcf;
  color: #6a9a2a;
}
</style>
