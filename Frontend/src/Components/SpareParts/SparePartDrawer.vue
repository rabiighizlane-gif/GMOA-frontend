<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="drawer-overlay" @click.self="$emit('close')">
        <aside class="drawer">
          <header class="drawer-header">
            <div>
              <span>{{ part?.reference }}</span>
              <h2>{{ part?.name }}</h2>
            </div>

            <button type="button" class="close-button" @click="$emit('close')">
              ×
            </button>
          </header>

          <nav class="drawer-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span>{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </nav>

          <div v-if="part" class="drawer-body">
            <section v-if="activeTab === 'info'">
              <h3>Informations</h3>
              <div class="details-grid">
                <div><span>Référence</span><strong>{{ part.reference }}</strong></div>
                <div><span>Nom</span><strong>{{ part.name }}</strong></div>
                <div><span>Catégorie</span><strong>{{ part.category }}</strong></div>
                <div><span>Fournisseur</span><strong>{{ part.supplier }}</strong></div>
                <div><span>Prix unitaire</span><strong>{{ part.unitPrice }} DH</strong></div>
                <div><span>Date d’ajout</span><strong>{{ part.addedAt }}</strong></div>
              </div>

              <h3>Description</h3>
              <p class="description">{{ part.description }}</p>
            </section>

            <section v-if="activeTab === 'stock'">
              <h3>Stock</h3>
              <div class="details-grid">
                <div><span>Quantité disponible</span><strong>{{ part.currentStock }} {{ part.unit }}</strong></div>
                <div><span>Seuil minimum</span><strong>{{ part.minimumStock }}</strong></div>
                <div><span>Stock maximum</span><strong>{{ part.maximumStock }}</strong></div>
                <div><span>Emplacement</span><strong>{{ part.location }}</strong></div>
                <div><span>Valeur totale</span><strong>{{ part.currentStock * part.unitPrice }} DH</strong></div>
                <div><span>Dernier mouvement</span><strong>{{ part.lastMovement }}</strong></div>
                <div><span>Statut actuel</span><strong>{{ part.status }}</strong></div>
              </div>
            </section>

            <section v-if="activeTab === 'compatibility'">
              <h3>Compatibilité</h3>
              <div class="list-block">
                <strong>Machines compatibles</strong>
                <span v-for="machine in part.compatibleMachines" :key="machine">{{ machine }}</span>
              </div>

              <div class="list-block">
                <strong>Lignes de production</strong>
                <span v-for="line in part.productionLines" :key="line">{{ line }}</span>
              </div>

              <div class="list-block">
                <strong>Modèles compatibles</strong>
                <span v-for="model in part.compatibleModels" :key="model">{{ model }}</span>
              </div>
            </section>

            <section v-if="activeTab === 'history'">
              <h3>Historique</h3>
              <div class="timeline">
                <article v-for="event in part.history" :key="`${event.date}-${event.label}`" class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div>
                    <strong>{{ event.date }}</strong>
                    <p>{{ event.quantity }} pièces</p>
                    <small>{{ event.label }}</small>
                  </div>
                </article>
              </div>
            </section>

            <section v-if="activeTab === 'documents'">
              <h3>Documents</h3>
              <button v-for="document in documents" :key="document" type="button" class="document-row">
                <span>▤</span>
                {{ document }}
              </button>
            </section>
          </div>

          <footer class="drawer-footer">
            <button type="button" class="secondary-button">Imprimer</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  open: Boolean,
  part: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'edit', 'adjust'])

const activeTab = ref('info')

const tabs = [
  { id: 'info', label: 'Informations', icon: 'i' },
  { id: 'stock', label: 'Stock', icon: '▦' },
  { id: 'compatibility', label: 'Compatibilité', icon: '⇄' },
  { id: 'history', label: 'Historique', icon: '◷' },
  { id: 'documents', label: 'Documents', icon: '▤' }
]

const documents = [
  'Fiche technique PDF',
  'Photo de la pièce',
  'Bon de livraison',
  'Manuel fournisseur'
]
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(17, 24, 39, 0.25);
  backdrop-filter: blur(2px);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  width: min(520px, 100%);
  height: 100%;
  flex-direction: column;
  background: white;
  box-shadow: -16px 0 40px rgba(0, 0, 0, 0.12);
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #edf0e8;
}

.drawer-header span {
  color: #6a9a2a;
  font-size: 12px;
  font-weight: 900;
}

.drawer-header h2 {
  margin: 5px 0 0;
  color: #111827;
  font-size: 21px;
}

.close-button {
  width: 36px;
  height: 36px;
  background: #f7f9f3;
  border: 0;
  border-radius: 10px;
  color: #4a0a0a;
  cursor: pointer;
}

.drawer-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 20px;
  border-bottom: 1px solid #edf0e8;
}

.drawer-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 12px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.drawer-tabs button.active {
  border-color: #6a9a2a;
  color: #6a9a2a;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.drawer-body h3 {
  margin: 5px 0 16px;
  color: #111827;
  font-size: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.details-grid div,
.list-block,
.description,
.document-row {
  background: #fafbf7;
  border: 1px solid #edf0e8;
  border-radius: 12px;
}

.details-grid div {
  padding: 13px;
}

.details-grid span {
  display: block;
  color: #94a3b8;
  font-size: 10px;
}

.details-grid strong {
  display: block;
  margin-top: 5px;
  color: #4a0a0a;
  font-size: 12px;
}

.description {
  padding: 15px;
  color: #64748b;
  line-height: 1.7;
}

.list-block {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 14px;
}

.list-block strong {
  width: 100%;
  color: #4a0a0a;
}

.list-block span {
  padding: 6px 10px;
  background: white;
  border-radius: 999px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.timeline {
  margin-left: 8px;
  padding-left: 22px;
  border-left: 2px solid #e4ead9;
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
  background: #6a9a2a;
  border: 3px solid #eaf3dd;
  border-radius: 50%;
}

.timeline-item p,
.timeline-item small {
  color: #64748b;
}

.document-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 14px;
  color: #4a0a0a;
  font-weight: 800;
  cursor: pointer;
}

.drawer-footer {
  display: flex;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #edf0e8;
}

.drawer-footer button {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.secondary-button {
  background: white;
  border: 1px solid #dfe5d6;
  color: #4a0a0a;
}

.primary-button {
  background: #6a9a2a;
  border: 1px solid #6a9a2a;
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
