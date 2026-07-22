<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="drawer-overlay" @click.self="$emit('close')">
        <aside class="drawer">
          <header class="drawer-header">
            <div>
              <span>{{ request?.id }}</span>
              <h2>{{ request?.machine }}</h2>
            </div>
            <button type="button" class="close-button" @click="$emit('close')">×</button>
          </header>

          <nav class="drawer-tabs">
            <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
              <span>{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </nav>

          <div v-if="request" class="drawer-body">
            <section v-if="activeTab === 'info'">
              <h3>Informations</h3>
              <div class="details-grid">
                <div><span>ID de la demande</span><strong>{{ request.id }}</strong></div>
                <div><span>Machine</span><strong>{{ request.machine }}</strong></div>
                <div><span>Ligne</span><strong>{{ request.line }}</strong></div>
                <div><span>Demandeur</span><strong>{{ request.requester }}</strong></div>
                <div><span>Date de création</span><strong>{{ request.createdAt }}</strong></div>
                <div><span>Priorité</span><PriorityBadge :priority="request.priority" /></div>
                <div><span>Statut</span><strong>{{ request.status }}</strong></div>
              </div>
              <h3>Description complète</h3>
              <p class="description">{{ request.fullDescription }}</p>
            </section>

            <section v-if="activeTab === 'diagnostic'">
              <h3>Symptômes et diagnostic initial</h3>
              <div class="details-grid">
                <div><span>Symptômes observés</span><strong>{{ request.symptoms }}</strong></div>
                <div><span>Zone concernée</span><strong>{{ request.zone }}</strong></div>
                <div><span>Niveau d’urgence</span><strong>{{ request.urgency }}</strong></div>
                <div><span>Arrêt de machine</span><strong>{{ request.machineStopped ? 'Oui' : 'Non' }}</strong></div>
                <div><span>Risque sécurité</span><strong>{{ request.safetyRisk ? 'Oui' : 'Non' }}</strong></div>
                <div><span>Commentaire opérateur</span><strong>{{ request.operatorComment }}</strong></div>
              </div>
            </section>

            <section v-if="activeTab === 'attachments'">
              <h3>Pièces jointes</h3>
              <button v-for="attachment in request.attachments" :key="attachment" type="button" class="attachment-row">
                <span>▤</span>
                {{ attachment }}
                <small>Télécharger</small>
              </button>
            </section>

            <section v-if="activeTab === 'validation'">
              <h3>Validation</h3>
              <div class="details-grid">
                <div><span>Décision</span><strong>{{ request.validation.decision || '—' }}</strong></div>
                <div><span>Validée par</span><strong>{{ request.validation.by || '—' }}</strong></div>
                <div><span>Date de validation</span><strong>{{ request.validation.date || '—' }}</strong></div>
                <div><span>Commentaire</span><strong>{{ request.validation.comment || '—' }}</strong></div>
                <div><span>Motif de refus</span><strong>{{ request.validation.refusalReason || '—' }}</strong></div>
                <div><span>Informations demandées</span><strong>{{ request.validation.requestedInfo || '—' }}</strong></div>
              </div>
            </section>

            <section v-if="activeTab === 'history'">
              <h3>Historique</h3>
              <RequestTimeline :events="request.history" />
            </section>
          </div>

          <footer class="drawer-footer">
            <button type="button" class="secondary-button">Imprimer</button>
            <button v-if="can('edit', request)" type="button" class="secondary-button" @click="$emit('edit', request)">Modifier</button>
            <button v-if="can('accept', request)" type="button" class="primary-button" @click="$emit('validate', { action: 'accept', request })">Accepter</button>
            <button v-if="can('reject', request)" type="button" class="danger-button" @click="$emit('validate', { action: 'reject', request })">Refuser</button>
            <button v-if="can('transform', request)" type="button" class="primary-button" @click="$emit('transform', request)">Transformer</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import PriorityBadge from '@/Components/MaintenanceRequests/PriorityBadge.vue'
import RequestTimeline from '@/Components/MaintenanceRequests/RequestTimeline.vue'

defineProps({
  open: Boolean,
  request: { type: Object, default: null },
  can: { type: Function, required: true }
})

defineEmits(['close', 'edit', 'validate', 'transform'])

const activeTab = ref('info')
const tabs = [
  { id: 'info', label: 'Informations', icon: 'i' },
  { id: 'diagnostic', label: 'Diagnostic', icon: '!' },
  { id: 'attachments', label: 'Pièces jointes', icon: '▤' },
  { id: 'validation', label: 'Validation', icon: '✓' },
  { id: 'history', label: 'Historique', icon: '◷' }
]
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(5, 10, 17, 0.68);
  backdrop-filter: blur(6px);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  width: min(540px, 100%);
  height: 100%;
  flex-direction: column;
  background: #111b26;
  border-left: 1px solid rgba(126, 146, 170, 0.28);
  box-shadow: -16px 0 40px rgba(0, 0, 0, 0.34);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(126, 146, 170, 0.22);
}

.drawer-header span { color: #bce39d; font-size: 12px; font-weight: 900; }
.drawer-header h2 { margin: 5px 0 0; color: #f8fbff; font-size: 21px; }

.close-button {
  width: 36px;
  height: 36px;
  background: #0d1520;
  border: 1px solid rgba(210, 221, 234, 0.18);
  border-radius: 8px;
  color: #f4f7fb;
  cursor: pointer;
}

.drawer-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 20px;
  border-bottom: 1px solid rgba(126, 146, 170, 0.22);
}

.drawer-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 12px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #8d9aab;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.drawer-tabs button.active { border-color: #83b95c; color: #bce39d; }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-body h3 { margin: 5px 0 16px; color: #f8fbff; font-size: 14px; }

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.details-grid div,
.description,
.attachment-row {
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 8px;
}

.details-grid div { padding: 13px; }
.details-grid span { display: block; color: #8d9aab; font-size: 10px; }
.details-grid strong { display: block; margin-top: 5px; color: #f8fbff; font-size: 12px; }
.description { padding: 15px; color: #d7e0ec; line-height: 1.7; }

.attachment-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
  padding: 14px;
  color: #f4f7fb;
  font-weight: 800;
  cursor: pointer;
}

.attachment-row small { color: #bce39d; }

.drawer-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 18px 24px;
  border-top: 1px solid rgba(126, 146, 170, 0.22);
}

.drawer-footer button {
  flex: 1;
  min-width: 110px;
  height: 44px;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
}

.secondary-button { background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); color: #f2f6fb; }
.primary-button { background: #5f8f2f; border: 1px solid rgba(131, 185, 92, 0.44); color: #f8fbff; }
.danger-button { background: #dc3747; border: 1px solid rgba(220, 55, 71, 0.56); color: #f8fbff; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-active .drawer,
.fade-leave-active .drawer { transition: transform 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-from .drawer,
.fade-leave-to .drawer { transform: translateX(100%); }
</style>
