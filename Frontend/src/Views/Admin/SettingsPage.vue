<template>
  <main class="settings-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.sidebarToggle"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="settings-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">{{ content.breadcrumb }}</p>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>

        <div class="header-actions">
          <button type="button" class="secondary-button" @click="restoreDefaults">{{ content.restore }}</button>
          <button type="button" class="primary-button" @click="saveSettings">{{ content.save }}</button>
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
        <nav class="settings-tabs" :aria-label="content.sectionsLabel">
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
import { useLanguageStore } from '@/stores/language'
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

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const isSidebarOpen = ref(false)
const activeTab = ref('company')
const toastMessage = ref('')

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    breadcrumb: 'Accueil / Parametres',
    title: 'Parametres',
    subtitle: 'Configuration generale de SmartCalyx pour AGRO-FOOD INDUSTRIE Marrakech',
    restore: 'Restaurer les valeurs par defaut',
    save: 'Enregistrer',
    sectionsLabel: 'Sections parametres',
    saved: 'Parametres enregistres.',
    restored: 'Valeurs par defaut restaurees.',
  },
  EN: {
    sidebarToggle: 'Show menu',
    breadcrumb: 'Home / Settings',
    title: 'Settings',
    subtitle: 'General SmartCalyx configuration for AGRO-FOOD INDUSTRIE Marrakech',
    restore: 'Restore defaults',
    save: 'Save',
    sectionsLabel: 'Settings sections',
    saved: 'Settings saved.',
    restored: 'Default values restored.',
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    breadcrumb: 'الرئيسية / الإعدادات',
    title: 'الإعدادات',
    subtitle: 'الإعدادات العامة لـ SmartCalyx الخاصة بـ AGRO-FOOD INDUSTRIE Marrakech',
    restore: 'استرجاع القيم الافتراضية',
    save: 'حفظ',
    sectionsLabel: 'أقسام الإعدادات',
    saved: 'تم حفظ الإعدادات.',
    restored: 'تم استرجاع القيم الافتراضية.',
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const tabs = computed(() => {
  const labels = {
    FR: ['Entreprise', 'Utilisateurs & roles', 'Langues & region', 'Notifications', 'Securite', 'Email & SMTP', 'Sauvegardes', 'Apparence', 'Systeme', 'A propos'],
    EN: ['Company', 'Users & roles', 'Language & region', 'Notifications', 'Security', 'Email & SMTP', 'Backups', 'Appearance', 'System', 'About'],
    AR: ['الشركة', 'المستخدمون والأدوار', 'اللغات والمنطقة', 'الإشعارات', 'الأمان', 'البريد و SMTP', 'النسخ الاحتياطي', 'المظهر', 'النظام', 'حول'],
  }[language.value] || []
  const defs = [
    ['company', '🏢', CompanySettings],
    ['roles', '👤', UserRolesSettings],
    ['language', '🌍', LanguageSettings],
    ['notifications', '🔔', NotificationSettings],
    ['security', '🔒', SecuritySettings],
    ['email', '📧', EmailSettings],
    ['backups', '🗄️', BackupSettings],
    ['appearance', '🎨', AppearanceSettings],
    ['system', '⚙️', SystemSettings],
    ['about', 'ℹ️', AboutSettings],
  ]

  return defs.map(([id, icon, component], index) => ({ id, icon, label: labels[index], component }))
})

const kpiCards = computed(() => {
  const labels = {
    FR: ['Utilisateurs', 'Modules actifs', 'Sauvegarde', 'Version', 'Notifications', 'Stockage utilise'],
    EN: ['Users', 'Active modules', 'Backup', 'Version', 'Notifications', 'Storage used'],
    AR: ['المستخدمون', 'الوحدات النشطة', 'النسخ الاحتياطي', 'الإصدار', 'الإشعارات', 'التخزين المستعمل'],
  }[language.value] || []
  const icons = ['👥', '▦', '✓', '1.0', '🔔', '%']
  const values = ['24', '11', language.value === 'AR' ? 'جاهز' : 'OK', '1.0', '5', '68 %']

  return labels.map((label, index) => ({ icon: icons[index], label, value: values[index] }))
})

const activeComponent = computed(() => tabs.value.find((tab) => tab.id === activeTab.value)?.component || CompanySettings)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function saveSettings() {
  showToast(content.value.saved)
}

function restoreDefaults() {
  showToast(content.value.restored)
}

function showToast(message) {
  toastMessage.value = message
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}
</script>

<style scoped>
.settings-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}
.settings-page { display: grid; gap: 22px; min-height: 100vh; padding: 32px 28px 44px 88px; overflow-x: hidden; }
[dir='rtl'] .settings-page { padding: 32px 88px 44px 28px; }
.sidebar-toggle { position: fixed; top: 24px; left: 24px; z-index: 1000; display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: rgba(17, 27, 38, 0.94); border: 1px solid rgba(126, 146, 170, 0.3); border-radius: 8px; color: #f4f7fb; box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28); cursor: pointer; }
[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(5, 10, 17, 0.54); backdrop-filter: blur(3px); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px; color: #bce39d; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #f8fbff; font-size: 34px; font-weight: 950; letter-spacing: 0; }
.page-header p { margin: 8px 0 0; color: #aab7c7; font-size: 15px; font-weight: 720; }
.header-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
[dir='rtl'] .header-actions { justify-content: flex-start; }
.primary-button, .secondary-button { min-height: 44px; padding: 0 16px; border-radius: 8px; font-weight: 950; cursor: pointer; }
.primary-button { border: 1px solid rgba(131, 185, 92, 0.44); background: #5f8f2f; color: #f8fbff; }
.secondary-button { border: 1px solid rgba(210, 221, 234, 0.28); background: rgba(13, 21, 32, 0.82); color: #f2f6fb; }
.kpi-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; }
.kpi-grid article { display: flex; align-items: center; gap: 13px; min-height: 96px; padding: 16px; background: linear-gradient(180deg, rgba(131, 185, 92, 0.08), rgba(18, 28, 39, 0.02)), rgba(18, 28, 39, 0.86); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); }
.kpi-grid article > span { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 8px; background: rgba(131, 185, 92, 0.18); color: #bce39d; font-weight: 950; }
.kpi-grid p { margin: 0; color: #aeb9c8; font-size: 11px; font-weight: 900; text-transform: uppercase; }
[dir='rtl'] .kpi-grid p { text-transform: none; }
.kpi-grid strong { display: block; margin-top: 5px; color: #f8fbff; font-size: 22px; font-weight: 950; }
.settings-shell { display: grid; grid-template-columns: 285px minmax(0, 1fr); gap: 20px; align-items: start; }
[dir='rtl'] .settings-shell { grid-template-columns: minmax(0, 1fr) 285px; }
[dir='rtl'] .settings-tabs { order: 2; }
.settings-tabs { position: sticky; top: 20px; display: grid; gap: 8px; padding: 12px; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.22); }
.settings-tabs button { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: #aab7c7; font-weight: 900; text-align: left; cursor: pointer; }
[dir='rtl'] .settings-tabs button { text-align: right; }
.settings-tabs button span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: rgba(126, 146, 170, 0.14); }
.settings-tabs button.active { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
.settings-tabs button.active span { background: #5f8f2f; color: #f8fbff; }
.settings-content { min-width: 0; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 14px 18px; background: rgba(17, 27, 38, 0.96); border: 1px solid rgba(131, 185, 92, 0.38); border-radius: 8px; color: #f8fbff; font-weight: 900; box-shadow: 0 18px 44px rgba(0,0,0,.34); }
[dir='rtl'] .toast { right: auto; left: 24px; }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 1280px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } .settings-shell, [dir='rtl'] .settings-shell { grid-template-columns: 1fr; } .settings-tabs { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); } [dir='rtl'] .settings-tabs { order: 0; } }
@media (max-width: 760px) { .settings-page, [dir='rtl'] .settings-page { padding: 88px 16px 32px; } .page-header { align-items: stretch; flex-direction: column; } .header-actions, .header-actions button { width: 100%; } .kpi-grid, .settings-tabs { grid-template-columns: 1fr; } }
</style>
