<template>
  <main class="activity-layout">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" aria-label="Afficher le menu" @click="toggleSidebar">
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="activity-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">Accueil / Journal d'activité</p>
          <h1>Journal d'activité</h1>
          <p>Historique système des actions réalisées par les utilisateurs.</p>
        </div>
      </header>

      <section class="filters-card">
        <input v-model="search" type="search" placeholder="Rechercher utilisateur, action, module..." />
        <select v-model="moduleFilter">
          <option value="">Tous les modules</option>
          <option>Machines</option>
          <option>Interventions</option>
          <option>Demandes</option>
          <option>Stock</option>
          <option>Utilisateurs</option>
        </select>
        <select v-model="resultFilter">
          <option value="">Tous les résultats</option>
          <option>Succès</option>
          <option>Échec</option>
        </select>
        <button type="button" @click="resetFilters">Réinitialiser</button>
      </section>

      <section class="activity-card">
        <article v-for="entry in filteredEntries" :key="entry.id" class="activity-row">
          <div class="time-box">
            <strong>{{ entry.time }}</strong>
            <span>{{ entry.date }}</span>
          </div>
          <div class="actor">
            <strong>{{ entry.user }}</strong>
            <span>{{ entry.role }}</span>
          </div>
          <div class="action">
            <strong>{{ entry.action }}</strong>
            <span>{{ entry.module }} · IP {{ entry.ip }}</span>
          </div>
          <span class="result" :class="{ failed: entry.result === 'Échec' }">{{ entry.result }}</span>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import Sidebar from '@/Components/sidebar.vue'

const isSidebarOpen = ref(false)
const search = ref('')
const moduleFilter = ref('')
const resultFilter = ref('')

const entries = [
  { id: 1, date: '18/07/2026', time: '19:22', user: 'Super Admin', role: 'Super Administratrice', action: 'A ajouté une nouvelle machine.', module: 'Machines', ip: '192.168.1.24', result: 'Succès' },
  { id: 2, date: '18/07/2026', time: '18:05', user: 'Sara El Idrissi', role: 'Technicienne', action: "A terminé l'intervention INT-889.", module: 'Interventions', ip: '192.168.1.31', result: 'Succès' },
  { id: 3, date: '18/07/2026', time: '17:54', user: 'Ahmed El Mansouri', role: 'Technicien', action: 'A créé une demande de maintenance.', module: 'Demandes', ip: '192.168.1.33', result: 'Succès' },
  { id: 4, date: '18/07/2026', time: '16:40', user: 'Youssef Berrada', role: 'Responsable maintenance', action: 'A modifié le stock : Filtre huile.', module: 'Stock', ip: '192.168.1.40', result: 'Succès' },
  { id: 5, date: '18/07/2026', time: '14:18', user: 'Super Admin', role: 'Super Administratrice', action: 'A créé un utilisateur.', module: 'Utilisateurs', ip: '192.168.1.24', result: 'Succès' },
  { id: 6, date: '18/07/2026', time: '13:02', user: 'Nabil Amrani', role: 'Technicien', action: 'Tentative de suppression non autorisée.', module: 'Machines', ip: '192.168.1.28', result: 'Échec' },
]

const filteredEntries = computed(() => {
  const query = search.value.trim().toLowerCase()

  return entries.filter((entry) => {
    const matchesQuery =
      !query ||
      [entry.user, entry.role, entry.action, entry.module, entry.ip, entry.result]
        .join(' ')
        .toLowerCase()
        .includes(query)
    return matchesQuery && (!moduleFilter.value || entry.module === moduleFilter.value) && (!resultFilter.value || entry.result === resultFilter.value)
  })
})

function resetFilters() {
  search.value = ''
  moduleFilter.value = ''
  resultFilter.value = ''
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.activity-layout { min-height: 100vh; background: #f7f9f3; color: #4a0a0a; }
.activity-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; box-shadow: 0 10px 30px rgba(74,10,10,.08); cursor: pointer; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74,10,10,.28); }
.breadcrumb { margin: 0 0 7px; color: #6a9a2a; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 34px; font-weight: 950; }
.page-header p { margin: 8px 0 0; color: #64748b; font-size: 15px; font-weight: 720; }
.filters-card { display: grid; grid-template-columns: minmax(260px, 1fr) 220px 180px 150px; gap: 12px; padding: 16px; background: white; border: 1px solid #edf0e8; border-radius: 18px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.filters-card input, .filters-card select, .filters-card button { min-height: 46px; min-width: 0; padding: 0 14px; border: 1px solid #dfe5d6; border-radius: 12px; background: white; color: #4a0a0a; font: inherit; font-weight: 850; }
.filters-card button { color: #64748b; cursor: pointer; }
.activity-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.activity-row { display: grid; grid-template-columns: 130px 220px minmax(0, 1fr) 110px; align-items: center; gap: 18px; padding: 18px 22px; border-top: 1px solid #edf0e8; }
.activity-row:first-child { border-top: 0; }
.time-box strong, .actor strong, .action strong { display: block; color: #4a0a0a; font-size: 14px; font-weight: 950; }
.time-box span, .actor span, .action span { display: block; margin-top: 5px; color: #64748b; font-size: 12px; font-weight: 780; }
.result { justify-self: end; padding: 7px 12px; border-radius: 999px; background: #e7f3d5; color: #6a9a2a; font-size: 12px; font-weight: 950; }
.result.failed { background: #fee2e2; color: #e31e24; }
@media (max-width: 980px) { .filters-card, .activity-row { grid-template-columns: 1fr; } .result { justify-self: start; } }
@media (max-width: 760px) { .activity-page { padding: 88px 16px 32px; } }
</style>
