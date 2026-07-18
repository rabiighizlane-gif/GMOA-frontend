<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="drawer-overlay" @click.self="$emit('close')">
        <aside class="drawer">
          <header class="drawer-header">
            <div><span>{{ machine?.id }}</span><h2>{{ machine?.name }}</h2></div>
            <button type="button" class="close-button" @click="$emit('close')">×</button>
          </header>
          <nav class="drawer-tabs">
            <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
          </nav>
          <div v-if="machine" class="drawer-body">
            <section v-if="activeTab === 'info'">
              <h3>Informations</h3>
              <div class="details-grid">
                <div><span>ID machine</span><strong>{{ machine.id }}</strong></div><div><span>Nom</span><strong>{{ machine.name }}</strong></div>
                <div><span>Catégorie</span><strong>{{ machine.category }}</strong></div><div><span>Ligne</span><strong>{{ machine.line }}</strong></div>
                <div><span>Fabricant</span><strong>{{ machine.manufacturer }}</strong></div><div><span>Modèle</span><strong>{{ machine.model }}</strong></div>
                <div><span>N° série</span><strong>{{ machine.serialNumber }}</strong></div><div><span>Mise en service</span><strong>{{ machine.commissioningDate }}</strong></div>
                <div><span>Localisation</span><strong>{{ machine.location }}</strong></div><div><span>Criticité</span><MachineCriticalityBadge :criticality="machine.criticality" /></div>
                <div><span>État actuel</span><MachineStatusBadge :status="machine.status" /></div>
              </div>
            </section>
            <section v-if="activeTab === 'performance'">
              <h3>Performance</h3>
              <div class="details-grid">
                <div><span>Disponibilité</span><strong>{{ machine.availability }} %</strong></div><div><span>MTBF</span><strong>{{ machine.mtbf }}</strong></div>
                <div><span>MTTR</span><strong>{{ machine.mttr }}</strong></div><div><span>Pannes ce mois</span><strong>{{ machine.breakdownCount }}</strong></div>
                <div><span>Interventions</span><strong>{{ machine.interventionCount }}</strong></div><div><span>Arrêt cumulé</span><strong>{{ machine.downtime }}</strong></div>
              </div>
            </section>
            <section v-if="activeTab === 'interventions'"><h3>Interventions</h3><div v-for="item in machine.interventions" :key="item.id" class="list-row"><strong>{{ item.id }} · {{ item.type }}</strong><span>{{ item.technician }} · {{ item.date }} · {{ item.status }}</span></div></section>
            <section v-if="activeTab === 'preventive'"><h3>Maintenance préventive</h3><div class="details-grid"><div><span>Plan actif</span><strong>{{ machine.preventive.plan }}</strong></div><div><span>Fréquence</span><strong>{{ machine.preventive.frequency }}</strong></div><div><span>Dernière réalisation</span><strong>{{ machine.preventive.last }}</strong></div><div><span>Prochaine échéance</span><strong>{{ machine.preventive.next }}</strong></div><div><span>Responsable</span><strong>{{ machine.preventive.owner }}</strong></div><div><span>Statut</span><strong>{{ machine.preventive.status }}</strong></div></div></section>
            <section v-if="activeTab === 'breakdowns'"><h3>Pannes</h3><div v-for="item in machine.breakdowns" :key="item.date" class="list-row"><strong>{{ item.date }} · {{ item.type }}</strong><span>{{ item.description }} · {{ item.downtime }} · {{ item.status }}</span></div></section>
            <section v-if="activeTab === 'parts'"><h3>Pièces compatibles</h3><div v-for="part in machine.parts" :key="part.reference" class="list-row"><strong>{{ part.reference }} · {{ part.name }}</strong><span>Stock {{ part.stock }} · {{ part.availability }}</span></div></section>
            <section v-if="activeTab === 'documents'"><h3>Documents</h3><button v-for="document in documents" :key="document" type="button" class="document-row">▤ {{ document }}</button></section>
          </div>
          <footer class="drawer-footer">
            <button type="button" class="secondary-button" @click="$emit('edit', machine)">Modifier</button>
            <button type="button" class="primary-button" @click="$emit('intervention', machine)">Créer une intervention</button>
            <button type="button" class="secondary-button" @click="$emit('plan', machine)">Planifier maintenance</button>
            <button type="button" class="secondary-button">Imprimer la fiche</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import MachineCriticalityBadge from '@/Components/Machines/MachineCriticalityBadge.vue'
import MachineStatusBadge from '@/Components/Machines/MachineStatusBadge.vue'
defineProps({ open: Boolean, machine: { type: Object, default: null } })
defineEmits(['close', 'edit', 'intervention', 'plan'])
const activeTab = ref('info')
const tabs = [
  { id: 'info', label: 'Informations' }, { id: 'performance', label: 'Performance' }, { id: 'interventions', label: 'Interventions' },
  { id: 'preventive', label: 'Préventif' }, { id: 'breakdowns', label: 'Pannes' }, { id: 'parts', label: 'Pièces' }, { id: 'documents', label: 'Documents' }
]
const documents = ['Fiche technique', 'Manuel constructeur', 'Photo', 'Certificat', 'Rapport de maintenance']
</script>

<style scoped>
.drawer-overlay { position: fixed; z-index: 9999; inset: 0; background: rgba(17, 24, 39, 0.25); backdrop-filter: blur(2px); }
.drawer { position: absolute; top: 0; right: 0; display: flex; width: min(560px, 100%); height: 100%; flex-direction: column; background: white; box-shadow: -16px 0 40px rgba(0,0,0,.12); }
.drawer-header { display: flex; justify-content: space-between; padding: 24px; border-bottom: 1px solid #edf0e8; }
.drawer-header span { color: #6a9a2a; font-size: 12px; font-weight: 900; }
.drawer-header h2 { margin: 5px 0 0; color: #111827; font-size: 21px; }
.close-button { width: 36px; height: 36px; background: #f7f9f3; border: 0; border-radius: 10px; cursor: pointer; }
.drawer-tabs { display: flex; overflow-x: auto; padding: 0 20px; border-bottom: 1px solid #edf0e8; }
.drawer-tabs button { padding: 15px 12px; background: transparent; border: 0; border-bottom: 2px solid transparent; color: #64748b; font-size: 12px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.drawer-tabs button.active { border-color: #6a9a2a; color: #6a9a2a; }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-body h3 { margin: 5px 0 16px; color: #111827; font-size: 14px; }
.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 26px; }
.details-grid div, .list-row, .document-row { background: #fafbf7; border: 1px solid #edf0e8; border-radius: 12px; }
.details-grid div { padding: 13px; }
.details-grid span { display: block; color: #94a3b8; font-size: 10px; }
.details-grid strong { display: block; margin-top: 5px; color: #4a0a0a; font-size: 12px; }
.list-row { display: grid; gap: 5px; margin-bottom: 10px; padding: 14px; color: #4a0a0a; }
.list-row span { color: #64748b; font-size: 12px; }
.document-row { display: block; width: 100%; margin-bottom: 10px; padding: 14px; color: #4a0a0a; text-align: left; font-weight: 800; cursor: pointer; }
.drawer-footer { display: flex; flex-wrap: wrap; gap: 10px; padding: 18px 24px; border-top: 1px solid #edf0e8; }
.drawer-footer button { flex: 1; min-width: 130px; height: 44px; border-radius: 12px; font-weight: 900; cursor: pointer; }
.secondary-button { background: white; border: 1px solid #dfe5d6; color: #4a0a0a; }
.primary-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-active .drawer, .fade-leave-active .drawer { transition: transform .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .drawer, .fade-leave-to .drawer { transform: translateX(100%); }
</style>
