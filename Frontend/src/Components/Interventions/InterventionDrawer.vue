<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="intervention" class="drawer-layer" @click.self="$emit('close')">
        <aside class="drawer-panel" aria-label="Détail intervention">
          <header>
            <div>
              <span>{{ intervention.id }}</span>
              <h2>{{ intervention.machine }}</h2>
              <p>{{ intervention.description }}</p>
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
                <small>{{ intervention.technician.phone }} · {{ intervention.technician.service }}</small>
              </div>
            </div>

            <h3>Diagnostic</h3>
            <dl class="diagnostic-list">
              <div v-for="item in diagnosticInfo" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </section>

          <section v-else-if="activeTab === 'Pièces'" class="drawer-content">
            <table class="parts-table">
              <thead>
                <tr>
                  <th>Pièce</th>
                  <th>Référence</th>
                  <th>Quantité</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="part in intervention.parts" :key="part.reference">
                  <td>{{ part.name }}</td>
                  <td>{{ part.reference }}</td>
                  <td>{{ part.quantity }}</td>
                  <td>{{ part.state }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section v-else-if="activeTab === 'Historique'" class="drawer-content">
            <ol class="timeline">
              <li v-for="event in intervention.history" :key="event.label">
                <span></span>
                <div>
                  <strong>{{ event.label }}</strong>
                  <small>{{ event.time }}</small>
                  <p>{{ event.description }}</p>
                </div>
              </li>
            </ol>
          </section>

          <section v-else class="drawer-content">
            <div class="files-grid">
              <article v-for="file in intervention.files" :key="file.title">
                <span>{{ file.type }}</span>
                <strong>{{ file.title }}</strong>
                <small>{{ file.meta }}</small>
              </article>
            </div>
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

const tabs = ['Informations', 'Pièces', 'Historique', 'Fichiers']
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
    { label: 'Type intervention', value: props.intervention.type },
    { label: 'Priorité', value: props.intervention.priority },
    { label: 'Création', value: props.intervention.createdAt },
    { label: 'Début', value: props.intervention.start },
    { label: 'Fin', value: props.intervention.end },
    { label: 'Durée', value: props.intervention.duration },
  ]
})

const diagnosticInfo = computed(() => {
  if (!props.intervention) return []
  return [
    { label: 'Cause', value: props.intervention.diagnostic.cause },
    { label: 'Symptômes', value: props.intervention.diagnostic.symptoms },
    { label: 'Solution', value: props.intervention.diagnostic.solution },
    { label: 'Observations', value: props.intervention.diagnostic.notes },
  ]
})
</script>

<style scoped>
.drawer-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  background: rgba(74, 10, 10, 0.08);
}

.drawer-panel {
  width: min(430px, 92vw);
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid var(--sc-border);
  background: var(--sc-surface);
  box-shadow: -28px 0 80px rgba(74, 10, 10, 0.14);
}

header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 24px;
  border-bottom: 1px solid var(--sc-border);
}

header span,
small,
dt {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 850;
}

h2,
h3,
p,
dl,
dd {
  margin: 0;
}

h2 {
  margin-top: 6px;
  color: var(--sc-dark);
  font-size: 24px;
  font-weight: 950;
  line-height: 1.1;
}

header p {
  margin-top: 8px;
  color: var(--sc-muted);
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
  border: 1px solid var(--sc-border);
  border-radius: 13px;
  background: var(--sc-bg);
  color: var(--sc-dark);
  cursor: pointer;
}

.drawer-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 14px;
  border-bottom: 1px solid var(--sc-border);
}

.drawer-tabs button {
  min-height: 38px;
  border: 1px solid var(--sc-border);
  border-radius: 12px;
  background: var(--sc-surface);
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.drawer-tabs button.active {
  border-color: rgba(106, 154, 42, 0.45);
  background: var(--sc-soft-primary);
  color: var(--sc-primary);
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
.responsible-card,
.files-grid article {
  border: 1px solid var(--sc-border);
  border-radius: 15px;
  background: var(--sc-bg);
  padding: 13px;
}

.info-grid strong,
.responsible-card strong,
.files-grid strong,
.timeline strong,
dd {
  display: block;
  margin-top: 5px;
  color: var(--sc-dark);
  font-size: 13px;
  font-weight: 950;
}

h3 {
  margin: 20px 0 10px;
  color: var(--sc-dark);
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

.diagnostic-list {
  display: grid;
  gap: 10px;
}

.diagnostic-list div {
  border-bottom: 1px solid var(--sc-border);
  padding-bottom: 10px;
}

.parts-table {
  width: 100%;
  border-collapse: collapse;
}

.parts-table th,
.parts-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--sc-border);
  text-align: left;
  color: var(--sc-dark);
  font-size: 12px;
  font-weight: 850;
}

.parts-table th {
  color: var(--sc-muted);
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
  background: var(--sc-border);
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
  border: 3px solid var(--sc-surface);
  border-radius: 50%;
  background: var(--sc-primary);
  box-shadow: 0 0 0 1px var(--sc-border);
}

.timeline p {
  margin-top: 5px;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 780;
}

.files-grid {
  display: grid;
  gap: 12px;
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
</style>
