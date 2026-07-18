<template>
  <main class="settings-layout">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" aria-label="Afficher le menu" @click="toggleSidebar">
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="settings-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">Accueil / Paramètres</p>
          <h1>Paramètres</h1>
          <p>Configuration générale de SmartCalyx pour AGRO-FOOD INDUSTRIE Marrakech</p>
        </div>

        <div class="header-actions">
          <button type="button" class="secondary-button" @click="restoreDefaults">↺ Restaurer les valeurs par défaut</button>
          <button type="button" class="primary-button" @click="saveSettings">💾 Enregistrer</button>
        </div>
      </header>

      <section class="kpi-grid">
        <article v-for="card in kpiCards" :key="card.label">
          <span>{{ card.icon }}</span>
          <div>
            <p>{{ card.label }}</p>
            <strong>{{ card.value }}</strong>
          </div>
        </article>
      </section>

      <section class="settings-shell">
        <nav class="settings-tabs" aria-label="Sections paramètres">
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

        <div class="settings-content">
          <component :is="activeComponent" />
        </div>
      </section>

      <Transition name="toast">
        <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
      </Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import AboutSettings from '@/Components/Settings/AboutSettings.vue'
import AppearanceSettings from '@/Components/Settings/AppearanceSettings.vue'
import BackupSettings from '@/Components/Settings/BackupSettings.vue'
import CompanySettings from '@/Components/Settings/CompanySettings.vue'
import EmailSettings from '@/Components/Settings/EmailSettings.vue'
import LanguageSettings from '@/Components/Settings/LanguageSettings.vue'
import NotificationSettings from '@/Components/Settings/NotificationSettings.vue'
import SecuritySettings from '@/Components/Settings/SecuritySettings.vue'
import Sidebar from '@/Components/sidebar.vue'
import SystemSettings from '@/Components/Settings/SystemSettings.vue'
import UserRolesSettings from '@/Components/Settings/UserRolesSettings.vue'

const isSidebarOpen = ref(false)
const activeTab = ref('company')
const toastMessage = ref('')

const tabs = [
  { id: 'company', icon: '🏢', label: 'Entreprise', component: CompanySettings },
  { id: 'roles', icon: '👤', label: 'Utilisateurs & rôles', component: UserRolesSettings },
  { id: 'language', icon: '🌍', label: 'Langues & région', component: LanguageSettings },
  { id: 'notifications', icon: '🔔', label: 'Notifications', component: NotificationSettings },
  { id: 'security', icon: '🔒', label: 'Sécurité', component: SecuritySettings },
  { id: 'email', icon: '📧', label: 'Email & SMTP', component: EmailSettings },
  { id: 'backups', icon: '🗄️', label: 'Sauvegardes', component: BackupSettings },
  { id: 'appearance', icon: '🎨', label: 'Apparence', component: AppearanceSettings },
  { id: 'system', icon: '⚙️', label: 'Système', component: SystemSettings },
  { id: 'about', icon: 'ℹ️', label: 'À propos', component: AboutSettings },
]

const kpiCards = [
  { icon: '👥', label: 'Utilisateurs', value: '24' },
  { icon: '▦', label: 'Modules actifs', value: '11' },
  { icon: '✓', label: 'Sauvegarde', value: 'OK' },
  { icon: '1.0', label: 'Version', value: '1.0' },
  { icon: '🔔', label: 'Notifications', value: '5' },
  { icon: '%', label: 'Stockage utilisé', value: '68 %' },
]

const activeComponent = computed(() => tabs.find((tab) => tab.id === activeTab.value)?.component || CompanySettings)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function saveSettings() {
  showToast('Paramètres enregistrés.')
}

function restoreDefaults() {
  showToast('Valeurs par défaut restaurées.')
}

function showToast(message) {
  toastMessage.value = message
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}
</script>

<style scoped>
.settings-layout { min-height: 100vh; background: #f7f9f3; color: #4a0a0a; }
.settings-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; overflow-x: hidden; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 50; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; box-shadow: 0 10px 30px rgba(74,10,10,.08); cursor: pointer; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 35; background: rgba(74,10,10,.28); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px; color: #6a9a2a; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #111827; font-size: 34px; font-weight: 950; letter-spacing: 0; }
.page-header p { margin: 8px 0 0; color: #64748b; font-size: 15px; font-weight: 720; }
.header-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
.primary-button, .secondary-button { min-height: 44px; padding: 0 16px; border-radius: 12px; font-weight: 950; cursor: pointer; }
.primary-button { border: 1px solid #6a9a2a; background: #6a9a2a; color: white; }
.secondary-button { border: 1px solid #dfe5d6; background: white; color: #4a0a0a; }
.kpi-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; }
.kpi-grid article { display: flex; align-items: center; gap: 13px; min-height: 96px; padding: 16px; background: white; border: 1px solid #edf0e8; border-radius: 18px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.kpi-grid article > span { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 14px; background: #edf5de; color: #6a9a2a; font-weight: 950; }
.kpi-grid p { margin: 0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
.kpi-grid strong { display: block; margin-top: 5px; color: #111827; font-size: 22px; font-weight: 950; }
.settings-shell { display: grid; grid-template-columns: 285px minmax(0, 1fr); gap: 20px; align-items: start; }
.settings-tabs { position: sticky; top: 20px; display: grid; gap: 8px; padding: 12px; background: white; border: 1px solid #edf0e8; border-radius: 22px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.settings-tabs button { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 12px; border: 0; border-radius: 13px; background: transparent; color: #64748b; font-weight: 900; text-align: left; cursor: pointer; }
.settings-tabs button span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 10px; background: #f7f9f3; }
.settings-tabs button.active { background: #eef5df; color: #6a9a2a; }
.settings-tabs button.active span { background: #6a9a2a; color: white; }
.settings-content { min-width: 0; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 14px 18px; background: #4a0a0a; border-radius: 14px; color: white; font-weight: 900; box-shadow: 0 18px 44px rgba(74,10,10,.22); }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 1280px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } .settings-shell { grid-template-columns: 1fr; } .settings-tabs { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) { .settings-page { padding: 88px 16px 32px; } .page-header { align-items: stretch; flex-direction: column; } .header-actions, .header-actions button { width: 100%; } .kpi-grid, .settings-tabs { grid-template-columns: 1fr; } }
</style>
