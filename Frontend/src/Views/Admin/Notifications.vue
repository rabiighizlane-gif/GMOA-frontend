<template>
  <main class="notifications-layout">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" aria-label="Afficher le menu" @click="toggleSidebar">
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="notifications-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">Accueil / Notifications</p>
          <h1>Notifications</h1>
          <p>Centre d'alertes maintenance, stock, interventions et demandes.</p>
        </div>
        <button type="button" class="mark-button" @click="markAllAsRead">Tout marquer comme lu</button>
      </header>

      <section class="filters-card">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :class="{ active: selectedFilter === filter.value }"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
          <span>{{ countByFilter(filter.value) }}</span>
        </button>
      </section>

      <section class="notifications-card">
        <article v-for="notification in filteredNotifications" :key="notification.id" :class="['notification-row', { unread: !notification.read }]">
          <div class="notification-icon" :class="notification.tone">{{ notification.icon }}</div>
          <div>
            <div class="notification-title">
              <strong>{{ notification.title }}</strong>
              <span v-if="!notification.read">Non lue</span>
            </div>
            <p>{{ notification.description }}</p>
            <small>{{ notification.date }} · {{ notification.module }}</small>
          </div>
          <button type="button" @click="notification.read = true">Marquer lu</button>
        </article>
      </section>

      <Transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import Sidebar from '@/Components/sidebar.vue'

const isSidebarOpen = ref(false)
const selectedFilter = ref('all')
const toastMessage = ref('')

const notifications = ref([
  { id: 1, category: 'critical', tone: 'critical', icon: '!', title: 'Compresseur M-412 en panne', description: 'Arrêt immédiat détecté sur la ligne utilités.', date: '18/07/2026 20:42', module: 'Pannes', read: false },
  { id: 2, category: 'maintenance', tone: 'warning', icon: '⏱', title: 'Maintenance préventive prévue demain', description: 'Contrôle température programmé pour Pasteurisateur P-204.', date: '18/07/2026 18:30', module: 'Maintenance préventive', read: false },
  { id: 3, category: 'stock', tone: 'attention', icon: '!', title: 'Stock faible : Roulement SKF', description: 'Le stock est passé sous le seuil minimum.', date: '18/07/2026 17:10', module: 'Pièces de rechange', read: false },
  { id: 4, category: 'interventions', tone: 'success', icon: '✓', title: 'Intervention INT-889 terminée', description: 'Sara El Idrissi a clôturé l’intervention.', date: '18/07/2026 16:05', module: 'Interventions', read: true },
  { id: 5, category: 'requests', tone: 'info', icon: '+', title: 'Nouvelle demande de maintenance créée', description: 'Demande DM-005 en attente de validation.', date: '18/07/2026 15:34', module: 'Demandes', read: true },
])

const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'unread', label: 'Non lues' },
  { value: 'critical', label: 'Critiques' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'stock', label: 'Stock' },
  { value: 'interventions', label: 'Interventions' },
]

const filteredNotifications = computed(() => {
  if (selectedFilter.value === 'all') return notifications.value
  if (selectedFilter.value === 'unread') return notifications.value.filter((item) => !item.read)
  return notifications.value.filter((item) => item.category === selectedFilter.value)
})

function countByFilter(filter) {
  if (filter === 'all') return notifications.value.length
  if (filter === 'unread') return notifications.value.filter((item) => !item.read).length
  return notifications.value.filter((item) => item.category === filter).length
}

function markAllAsRead() {
  notifications.value.forEach((item) => {
    item.read = true
  })
  showToast('Toutes les notifications sont marquées comme lues.')
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function showToast(message) {
  toastMessage.value = message
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}
</script>

<style scoped>
.notifications-layout { min-height: 100vh; background: #f7f9f3; color: #4a0a0a; }
.notifications-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; box-shadow: 0 10px 30px rgba(74,10,10,.08); cursor: pointer; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74,10,10,.28); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px; color: #6a9a2a; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 34px; font-weight: 950; }
.page-header p { margin: 8px 0 0; color: #64748b; font-size: 15px; font-weight: 720; }
.mark-button { min-height: 44px; padding: 0 16px; border: 1px solid #6a9a2a; border-radius: 12px; background: #6a9a2a; color: white; font-weight: 950; cursor: pointer; }
.filters-card { display: flex; flex-wrap: wrap; gap: 10px; padding: 16px; background: white; border: 1px solid #edf0e8; border-radius: 18px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.filters-card button { display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 13px; border: 1px solid #dfe5d6; border-radius: 999px; background: white; color: #64748b; font-weight: 900; cursor: pointer; }
.filters-card button.active { border-color: #b6c65b; background: #eef5df; color: #6a9a2a; }
.filters-card span { min-width: 22px; height: 22px; display: inline-grid; place-items: center; border-radius: 999px; background: #f7f9f3; color: #4a0a0a; font-size: 11px; }
.notifications-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.notification-row { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; align-items: center; gap: 16px; padding: 18px 20px; border-top: 1px solid #edf0e8; }
.notification-row:first-child { border-top: 0; }
.notification-row.unread { background: #fffdf8; }
.notification-icon { width: 46px; height: 46px; display: inline-grid; place-items: center; border-radius: 14px; font-size: 18px; font-weight: 950; }
.notification-icon.critical { background: #fee2e2; color: #e31e24; }
.notification-icon.warning { background: #fff0df; color: #ff6a00; }
.notification-icon.attention { background: #fff4cf; color: #ad7a00; }
.notification-icon.success { background: #e7f3d5; color: #6a9a2a; }
.notification-icon.info { background: #e8f1ff; color: #2563eb; }
.notification-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.notification-title strong { color: #4a0a0a; font-size: 15px; font-weight: 950; }
.notification-title span { padding: 4px 8px; border-radius: 999px; background: #fee2e2; color: #e31e24; font-size: 10px; font-weight: 950; }
.notification-row p { margin: 5px 0; color: #64748b; font-size: 13px; font-weight: 720; }
.notification-row small { color: #94a3b8; font-size: 12px; font-weight: 800; }
.notification-row button { min-height: 38px; padding: 0 12px; border: 1px solid #dfe5d6; border-radius: 11px; background: white; color: #4a0a0a; font-weight: 900; cursor: pointer; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 14px 18px; background: #4a0a0a; border-radius: 14px; color: white; font-weight: 900; box-shadow: 0 18px 44px rgba(74,10,10,.22); }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 760px) { .notifications-page { padding: 88px 16px 32px; } .page-header, .notification-row { align-items: stretch; grid-template-columns: 46px minmax(0, 1fr); flex-direction: column; } .page-header { display: flex; } .notification-row button { grid-column: 2; width: max-content; } }
</style>
