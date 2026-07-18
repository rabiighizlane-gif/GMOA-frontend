<template>
  <main class="analytics-layout">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" aria-label="Afficher le menu" @click="toggleSidebar">
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="analytics-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">Accueil / KPI & Statistiques</p>
          <h1>KPI & Statistiques</h1>
          <p>Vue analytique live de la santé générale de l'usine.</p>
        </div>
        <div class="live-pill"><span></span> Live</div>
      </header>

      <ReportsKPICards :cards="kpiCards" />

      <section class="health-strip">
        <article v-for="item in healthItems" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <div class="section-heading">
        <h2>Indicateurs opérationnels</h2>
        <p>Pannes, interventions, disponibilité et charge technique.</p>
      </div>
      <ReportsChartsSection report-type="interventions" />

      <div class="section-heading">
        <h2>Santé du parc machines</h2>
        <p>Disponibilité par ligne et machines les plus instables.</p>
      </div>
      <ReportsChartsSection report-type="machines" />

      <div class="section-heading">
        <h2>Maintenance préventive</h2>
        <p>Respect du planning, fréquence et retards.</p>
      </div>
      <ReportsChartsSection report-type="preventive" />
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ReportsChartsSection from '@/Components/Reports/ReportsChartsSection.vue'
import ReportsKPICards from '@/Components/Reports/ReportsKPICards.vue'
import Sidebar from '@/Components/sidebar.vue'

const isSidebarOpen = ref(false)

const kpiCards = [
  { icon: '%', label: 'Disponibilité globale', value: '92 %', description: 'Objectif supérieur à 90 %', color: 'green' },
  { icon: 'B', label: 'MTBF', value: '185 h', description: 'Fiabilité moyenne', color: 'yellow' },
  { icon: 'R', label: 'MTTR', value: '2 h 35', description: 'Réparation moyenne', color: 'orange' },
  { icon: 'I', label: 'Interventions', value: '128', description: 'Total période active', color: 'green' },
  { icon: 'P', label: 'Pannes critiques', value: '12', description: 'Action prioritaire', color: 'red' },
  { icon: 'SLA', label: 'SLA', value: '94 %', description: 'Interventions clôturées à temps', color: 'green' },
]

const healthItems = [
  { label: "Temps d'arrêt", value: '54 h', note: '-8 h vs semaine passée' },
  { label: 'Respect planning préventif', value: '92 %', note: 'Maintenances réalisées à temps' },
  { label: 'Coût maintenance', value: '48 600 DH', note: 'Budget consolidé' },
  { label: 'Machines sous surveillance', value: '4', note: 'Criticité haute ou panne répétée' },
]

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.analytics-layout { min-height: 100vh; background: #f7f9f3; color: #4a0a0a; }
.analytics-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; overflow-x: hidden; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; box-shadow: 0 10px 30px rgba(74,10,10,.08); cursor: pointer; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74,10,10,.28); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px; color: #6a9a2a; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 34px; font-weight: 950; letter-spacing: 0; }
.page-header p { margin: 8px 0 0; color: #64748b; font-size: 15px; font-weight: 720; }
.live-pill { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; padding: 0 16px; border-radius: 999px; background: #edf5de; color: #5f901f; font-weight: 950; }
.live-pill span { width: 10px; height: 10px; border-radius: 50%; background: #6a9a2a; box-shadow: 0 0 0 6px rgba(106,154,42,.16); }
.health-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.health-strip article { padding: 18px; background: white; border: 1px solid #edf0e8; border-radius: 18px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.health-strip span { color: #64748b; font-size: 12px; font-weight: 900; text-transform: uppercase; }
.health-strip strong { display: block; margin: 8px 0; color: #4a0a0a; font-size: 24px; font-weight: 950; }
.health-strip small { color: #6a9a2a; font-size: 11px; font-weight: 850; }
.section-heading h2 { margin: 4px 0 0; color: #111827; font-size: 20px; font-weight: 950; }
.section-heading p { margin: 5px 0 0; color: #94a3b8; font-size: 13px; font-weight: 750; }
@media (max-width: 1100px) { .health-strip { grid-template-columns: repeat(2, 1fr); } .page-header { align-items: flex-start; flex-direction: column; } }
@media (max-width: 760px) { .analytics-page { padding: 88px 16px 32px; } .health-strip { grid-template-columns: 1fr; } }
</style>
