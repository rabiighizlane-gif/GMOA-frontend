<template>
  <aside
    :class="['sidebar', { 'sidebar-open': props.open }]"
    :aria-label="content.navigationLabel"
    :aria-hidden="!props.open"
    :dir="language === 'AR' ? 'rtl' : 'ltr'"
  >
    <button type="button" class="sidebar-close" :aria-label="content.closeNavigation" @click="emit('close')">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div class="sidebar-brand">
      <AppBrand />
    </div>

    <div class="sidebar-header">
      <div class="avatar-frame">
        <img
          v-if="profileImage"
          class="avatar"
          :src="profileImage"
          :alt="user.fullName || 'Photo de profil'"
          @error="handleImageError"
        />
        <span v-else class="avatar-initials">{{ initials }}</span>
      </div>

      <div class="profile-copy">
        <h2>{{ displayUserName }}</h2>
        <p>{{ displayUserRole }}</p>
      </div>
    </div>

    <nav class="nav">
      <RouterLink
        v-for="item in topItems"
        :key="item.label"
        :class="['nav-link', { active: isActive(item) }]"
        :to="item.path"
      >
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path v-for="path in getIconPaths(item.icon)" :key="path" :d="path" />
          </svg>
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>

      <div class="nav-section">
        <span>{{ content.management }}</span>
      </div>

      <RouterLink
        v-for="item in mainItems"
        :key="item.label"
        :class="['nav-link', { active: isActive(item) }]"
        :to="item.path"
      >
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path v-for="path in getIconPaths(item.icon)" :key="path" :d="path" />
          </svg>
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>

      <div class="nav-section">
        <span>{{ content.analysis }}</span>
      </div>

      <RouterLink
        v-for="item in bottomItems"
        :key="item.label"
        :class="['nav-link', { active: isActive(item) }]"
        :to="item.path"
      >
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path v-for="path in getIconPaths(item.icon)" :key="path" :d="path" />
          </svg>
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-wave" aria-hidden="true">
      <svg viewBox="0 0 284 170" preserveAspectRatio="none" focusable="false">
        <path
          d="M284 170H0V64C22 38 43 30 66 45C92 62 109 95 142 100C188 106 223 112 238 151C246 168 264 170 284 170Z"
        />
      </svg>
    </div>

    <div class="sidebar-footer">
      <RouterLink :class="['settings-link', { active: route.name === 'admin-settings' }]" to="/admin/settings">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path v-for="path in getIconPaths(icons.settings)" :key="path" :d="path" />
          </svg>
        </span>
        <span>{{ content.settings }}</span>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppBrand from '@/Components/AppBrand.vue'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const languageStore = useLanguageStore()
const storedUser = ref(localStorage.getItem('user'))
const imageLoadFailed = ref(false)
const language = computed(() => languageStore.language)

const sidebarContent = {
  FR: {
    navigationLabel: 'Navigation principale',
    closeNavigation: 'Masquer le menu',
    management: 'Gestion',
    analysis: 'Analyse',
    profile: 'Mon profil',
    dashboard: 'Dashboard',
    users: 'Utilisateurs',
    machines: 'Machines',
    productionLines: 'Lignes de production',
    breakdowns: 'Pannes',
    interventions: 'Interventions',
    preventiveMaintenance: 'Maintenance preventive',
    spareParts: 'Pièces de rechange',
    maintenanceRequests: 'Demandes de maintenance',
    reports: 'Rapports',
    kpis: 'KPI & Statistiques',
    notifications: 'Notifications',
    activityLog: "Journal d'activite",
    settings: 'Parametres',
  },
  EN: {
    navigationLabel: 'Primary navigation',
    closeNavigation: 'Hide menu',
    management: 'Management',
    analysis: 'Analysis',
    profile: 'My profile',
    dashboard: 'Dashboard',
    users: 'Users',
    machines: 'Machines',
    productionLines: 'Production lines',
    breakdowns: 'Breakdowns',
    interventions: 'Interventions',
    preventiveMaintenance: 'Preventive maintenance',
    spareParts: 'Spare parts',
    maintenanceRequests: 'Maintenance requests',
    reports: 'Reports',
    kpis: 'KPIs & Statistics',
    notifications: 'Notifications',
    activityLog: 'Activity log',
    settings: 'Settings',
  },
  AR: {
    navigationLabel: 'التنقل الرئيسي',
    closeNavigation: 'إخفاء القائمة',
    management: 'التسيير',
    analysis: 'التحليل',
    profile: 'ملفي الشخصي',
    dashboard: 'لوحة التحكم',
    users: 'المستخدمون',
    machines: 'الآلات',
    productionLines: 'خطوط الإنتاج',
    breakdowns: 'الأعطال',
    interventions: 'التدخلات',
    preventiveMaintenance: 'الصيانة الوقائية',
    spareParts: 'قطع الغيار',
    maintenanceRequests: 'طلبات الصيانة',
    reports: 'التقارير',
    kpis: 'المؤشرات والإحصائيات',
    notifications: 'الإشعارات',
    activityLog: 'سجل النشاط',
    settings: 'الإعدادات',
  },
}

const content = computed(() => ({
  ...sidebarContent.FR,
  ...(sidebarContent[language.value] || {}),
}))

const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

const defaultUser = {
  id: null,
  fullName: 'Utilisateur',
  role: '',
  profile_image: '',
  profileImage: '',
}

const defaultImagesByRole = {
  superadmin: '/profiles/admin-default.png',
  admin: '/profiles/admin-default.png',
  technicien: '/profiles/technician-default.png',
  operateur: '/profiles/operator-default.png',
  technician: '/profiles/technician-default.png',
  operator: '/profiles/operator-default.png',
}

const user = computed(() => {
  if (!storedUser.value) return defaultUser

  try {
    const parsedUser = JSON.parse(storedUser.value)

    return {
      ...defaultUser,
      ...parsedUser,
      fullName: parsedUser.fullName || parsedUser.full_name || defaultUser.fullName,
    }
  } catch {
    return defaultUser
  }
})

const displayUserName = computed(() => {
  if (language.value !== 'AR') return user.value.fullName

  const knownNames = {
    'ghizlane rabii': 'غزلان ربيعي',
  }
  const nameKey = String(user.value.fullName || '').trim().toLowerCase()

  return knownNames[nameKey] || user.value.fullName
})

const displayUserRole = computed(() => formatRole(user.value.role))

function formatRole(role) {
  const roleKey = String(role || '').toLowerCase().replace(/[\s_-]+/g, '')
  const labels = {
    superadmin: {
      FR: 'Super Administratrice',
      EN: 'Super Administrator',
      AR: 'مديرة عامة',
    },
    admin: {
      FR: 'Administratrice',
      EN: 'Administrator',
      AR: 'مديرة',
    },
    technicien: {
      FR: 'Technicien',
      EN: 'Technician',
      AR: 'تقني',
    },
    technician: {
      FR: 'Technicien',
      EN: 'Technician',
      AR: 'تقني',
    },
    operateur: {
      FR: 'Opérateur',
      EN: 'Operator',
      AR: 'مشغل',
    },
    operator: {
      FR: 'Opérateur',
      EN: 'Operator',
      AR: 'مشغل',
    },
  }

  return labels[roleKey]?.[language.value] || labels[roleKey]?.FR || role
}

const roleDefaultImage = computed(() => {
  const roleKey = String(user.value.role || '').toLowerCase().replace(/[\s_-]+/g, '')
  return defaultImagesByRole[roleKey] || ''
})

const profileImage = computed(() => {
  if (imageLoadFailed.value) return ''

  return user.value.profile_image || user.value.profileImage || roleDefaultImage.value
})

const initials = computed(() => {
  const names = String(displayUserName.value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!names.length) return 'U'

  return names
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase()
})

// localStorage is not reactive, so the sidebar refreshes when the user changes in another tab.
function syncUserFromStorage(event) {
  if (!event || event.key === 'user') {
    storedUser.value = localStorage.getItem('user')
  }
}

function handleImageError() {
  imageLoadFailed.value = true
}

watch(
  () => user.value.profile_image || user.value.profileImage || roleDefaultImage.value,
  () => {
    imageLoadFailed.value = false
  },
)

onMounted(() => {
  syncUserFromStorage()
  window.addEventListener('storage', syncUserFromStorage)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', syncUserFromStorage)
})

const icons = {
  profile: 'profile',
  dashboard: 'dashboard',
  settings: 'settings',
  users: 'users',
  machines: 'machines',
  productionLines: 'productionLines',
  breakdowns: 'breakdowns',
  interventions: 'interventions',
  preventiveMaintenance: 'preventiveMaintenance',
  spareParts: 'spareParts',
  maintenanceRequests: 'maintenanceRequests',
  reports: 'reports',
  kpis: 'kpis',
  notifications: 'notifications',
  activityLog: 'activityLog',
}

const iconPaths = {
  profile: [
    'M20 21a8 8 0 0 0-16 0',
    'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  ],
  dashboard: [
    'M3 11l9-8 9 8',
    'M5 10v10h14V10',
    'M9 20v-6h6v6',
  ],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  machines: [
    'M4 6h16v10H4z',
    'M8 20h8',
    'M12 16v4',
    'M8 10h.01',
    'M12 10h4',
  ],
  productionLines: [
    'M3 21h18',
    'M5 21V9l5 3V9l5 3V7h4v14',
    'M8 17h1',
    'M12 17h1',
    'M16 17h1',
  ],
  breakdowns: [
    'M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z',
    'M12 9v4',
    'M12 17h.01',
  ],
  interventions: [
    'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4',
    'M16 5l3 3',
    'M18 3l3 3',
  ],
  preventiveMaintenance: [
    'M8 2v4',
    'M16 2v4',
    'M3 10h18',
    'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
    'M9 15l2 2 4-4',
  ],
  spareParts: [
    'M9 7a5 5 0 0 1 7 7l5 5-2 2-5-5a5 5 0 0 1-7-7l2 2 2-2-2-2Z',
    'M4 20l6-6',
  ],
  maintenanceRequests: [
    'M8 3h8l3 3v15H5V3h3Z',
    'M16 3v4h4',
    'M8 12h8',
    'M8 16h5',
  ],
  reports: [
    'M4 19V5',
    'M8 19v-8',
    'M12 19V8',
    'M16 19v-5',
    'M20 19V3',
  ],
  kpis: [
    'M4 19h16',
    'M7 16l4-4 3 3 5-7',
    'M17 8h2v2',
  ],
  notifications: [
    'M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9',
    'M10 21h4',
  ],
  activityLog: [
    'M4 4h16v16H4z',
    'M8 8h8',
    'M8 12h8',
    'M8 16h5',
  ],
  settings: [
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .66.39 1.26 1 1.55H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.45Z',
  ],
}

function getIconPaths(name) {
  return iconPaths[name] || iconPaths.dashboard
}

const topItems = computed(() => [
  { icon: icons.profile, label: content.value.profile, path: '/admin/profile', routeName: 'admin-profile' },
  { icon: icons.dashboard, label: content.value.dashboard, path: '/admin/dashboard', routeName: 'admin-dashboard' },
])

const mainItems = computed(() => [
  { icon: icons.users, label: content.value.users, path: '/admin/users', routeName: 'admin-users' },
  { icon: icons.machines, label: content.value.machines, path: '/admin/machines', routeName: 'admin-machines' },
  {
    icon: icons.productionLines,
    label: content.value.productionLines,
    path: '/admin/production-lines',
    routeName: 'admin-production-lines',
  },
  { icon: icons.breakdowns, label: content.value.breakdowns, path: '/admin/pannes', routeName: 'admin-pannes' },
  {
    icon: icons.interventions,
    label: content.value.interventions,
    path: '/admin/interventions',
    routeName: 'admin-interventions',
  },
  {
    icon: icons.preventiveMaintenance,
    label: content.value.preventiveMaintenance,
    path: '/admin/preventive-maintenance',
    routeName: 'admin-preventive-maintenance',
  },
  { icon: icons.spareParts, label: content.value.spareParts, path: '/admin/spare-parts', routeName: 'admin-spare-parts' },
  {
    icon: icons.maintenanceRequests,
    label: content.value.maintenanceRequests,
    path: '/admin/maintenance-requests',
    routeName: 'admin-maintenance-requests',
  },
])

const bottomItems = computed(() => [
  { icon: icons.reports, label: content.value.reports, path: '/admin/reports', routeName: 'admin-reports' },
  { icon: icons.kpis, label: content.value.kpis, path: '/admin/kpi-statistics', routeName: 'admin-kpi-statistics' },
  { icon: icons.notifications, label: content.value.notifications, path: '/admin/notifications', routeName: 'admin-notifications' },
  { icon: icons.activityLog, label: content.value.activityLog, path: '/admin/activity-log', routeName: 'admin-activity-log' },
])

function isActive(item) {
  if (!item.routeName) return false

  if (item.routeName === 'admin-machines') {
    return route.name === 'admin-machines' || route.name === 'admin-machine-details'
  }

  if (item.routeName === 'admin-production-lines') {
    return route.name === 'admin-production-lines' || route.name === 'admin-production-line-details'
  }

  return route.name === item.routeName
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 90;
  width: 284px;
  height: 100vh;
  max-height: 100dvh;
  min-height: 100vh;
  background: var(--sc-secondary);
  color: var(--sc-dark);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--sc-border);
  box-shadow: 14px 0 34px rgba(74, 10, 10, 0.08);
  font-family: Arial, Helvetica, sans-serif;
  transform: translateX(-100%);
  visibility: hidden;
  pointer-events: none;
  transition:
    transform 0.24s ease,
    visibility 0.24s ease;
  will-change: transform;
}

.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0)),
    radial-gradient(circle at 0 100%, rgba(255, 255, 255, 0.34), transparent 32%);
  pointer-events: none;
}

.sidebar.sidebar-open {
  transform: translateX(0);
  visibility: visible;
  pointer-events: auto;
}

.sidebar[dir='rtl'] {
  right: 0;
  left: auto;
  transform: translateX(100%);
  border-right: 0;
  border-left: 1px solid rgba(23, 33, 10, 0.1);
  box-shadow: -14px 0 34px rgba(37, 49, 15, 0.08);
}

.sidebar[dir='rtl'].sidebar-open {
  transform: translateX(0);
}

.sidebar-brand,
.sidebar-header,
.nav,
.sidebar-footer {
  position: relative;
  z-index: 2;
}

.sidebar-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 92;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(23, 33, 10, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.46);
  color: #1f2b0c;
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.sidebar-close:hover {
  background: #ffffff;
  transform: translateY(-1px);
}

.sidebar-close span {
  position: absolute;
  width: 15px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.sidebar-close span:first-child {
  transform: rotate(45deg);
}

.sidebar-close span:last-child {
  transform: rotate(-45deg);
}

.sidebar[dir='rtl'] .sidebar-close {
  right: auto;
  left: 14px;
}

.sidebar-brand {
  padding: 58px 16px 8px;
}

.sidebar-brand :deep(.flex) {
  width: 100%;
  height: 52px;
  border: 1px solid rgba(74, 10, 10, 0.1);
  box-shadow: 0 12px 24px rgba(74, 10, 10, 0.1);
}

.sidebar-brand :deep(.h-11) {
  width: 48px;
  height: 40px;
}

.sidebar-brand :deep(.text-2xl) {
  font-size: 20px;
}

.sidebar-header {
  padding: 16px 24px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-frame {
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  padding: 4px;
  background: var(--sc-bg);
  border: 1px solid var(--sc-border);
  border-radius: 50%;
  box-shadow: 0 12px 22px rgba(37, 49, 15, 0.16);
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--sc-soft-primary);
  color: var(--sc-dark);
  font-size: 19px;
  font-weight: 900;
  line-height: 1;
}

.profile-copy {
  min-width: 0;
}

.profile-copy h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
}

.profile-copy p {
  width: max-content;
  margin: 6px 0 0;
  padding: 4px 9px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  color: var(--sc-dark);
  font-size: 11px;
  font-weight: 800;
}

.nav {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px 14px 22px;
  overflow-y: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.nav-section {
  margin: 16px 10px 7px;
  border-top: 1px solid rgba(74, 10, 10, 0.16);
  color: var(--sc-muted);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.nav-section span {
  display: inline-block;
  background: var(--sc-secondary);
  padding-right: 10px;
  transform: translateY(-6px);
}

.nav-link,
.settings-link {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 12px;
  border-radius: 14px;
  color: var(--sc-dark);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.2;
  text-decoration: none;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.nav-link:hover,
.settings-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(2px);
}

.nav-link.active,
.settings-link.active {
  background: var(--sc-surface);
  box-shadow: 0 12px 24px rgba(74, 10, 10, 0.14);
  color: var(--sc-dark);
}

.nav-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.36);
  border-radius: 10px;
  color: var(--sc-dark);
  line-height: 1;
}

.nav-icon svg {
  width: 17px;
  height: 17px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.nav-link.active .nav-icon,
.settings-link.active .nav-icon {
  background: var(--sc-soft-primary);
  color: var(--sc-primary);
}

.sidebar-footer {
  margin-bottom: 112px;
  padding: 16px 14px 22px;
  border-top: 1px solid rgba(23, 33, 10, 0.12);
}

:global(:root[data-theme='dark']) .sidebar {
  background: #172112;
  color: #eef6dc;
  border-right-color: rgba(215, 236, 120, 0.16);
  box-shadow: 14px 0 34px rgba(0, 0, 0, 0.32);
}

:global(:root[data-theme='dark']) .sidebar[dir='rtl'] {
  border-left-color: rgba(215, 236, 120, 0.16);
  box-shadow: -14px 0 34px rgba(0, 0, 0, 0.32);
}

:global(:root[data-theme='dark']) .sidebar::before {
  background:
    linear-gradient(180deg, rgba(215, 236, 120, 0.08), rgba(215, 236, 120, 0)),
    radial-gradient(circle at 0 100%, rgba(184, 204, 76, 0.16), transparent 32%);
}

:global(:root[data-theme='dark']) .sidebar-close {
  border-color: rgba(215, 236, 120, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #eef6dc;
}

:global(:root[data-theme='dark']) .sidebar-close:hover {
  background: rgba(215, 236, 120, 0.16);
}

:global(:root[data-theme='dark']) .avatar-frame {
  background: #223019;
  border-color: rgba(215, 236, 120, 0.18);
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.24);
}

:global(:root[data-theme='dark']) .avatar-initials {
  background: #10170d;
  color: #d7ec78;
}

:global(:root[data-theme='dark']) .profile-copy h2,
:global(:root[data-theme='dark']) .nav-link,
:global(:root[data-theme='dark']) .settings-link {
  color: #eef6dc;
}

:global(:root[data-theme='dark']) .profile-copy p {
  background: rgba(215, 236, 120, 0.14);
  border-color: rgba(215, 236, 120, 0.16);
  color: #d7ec78;
}

:global(:root[data-theme='dark']) .nav-section {
  border-top-color: rgba(215, 236, 120, 0.18);
  color: rgba(238, 246, 220, 0.62);
}

:global(:root[data-theme='dark']) .nav-section span {
  background: #172112;
}

:global(:root[data-theme='dark']) .nav-link:hover,
:global(:root[data-theme='dark']) .settings-link:hover {
  background: rgba(215, 236, 120, 0.12);
}

:global(:root[data-theme='dark']) .nav-link.active,
:global(:root[data-theme='dark']) .settings-link.active {
  background: #223019;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.24);
  color: #f6ffe8;
}

:global(:root[data-theme='dark']) .nav-icon {
  background: rgba(215, 236, 120, 0.14);
  color: #d7ec78;
}

:global(:root[data-theme='dark']) .nav-link.active .nav-icon,
:global(:root[data-theme='dark']) .settings-link.active .nav-icon {
  background: #b8cc4c;
  color: #17210a;
}

:global(:root[data-theme='dark']) .sidebar-footer {
  border-top-color: rgba(215, 236, 120, 0.16);
}

:global(:root[data-theme='dark']) .sidebar-wave {
  color: #10170d;
}

.sidebar-wave {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 170px;
  color: #f8fafc;
  pointer-events: none;
}

.sidebar-wave svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}

@media (max-width: 860px) {
  .sidebar {
    width: 244px;
  }

  .sidebar-wave {
    height: 150px;
  }

  .sidebar-footer {
    margin-bottom: 96px;
  }

  .sidebar-header {
    padding-inline: 18px;
  }

  .nav-link,
  .settings-link {
    font-size: 13px;
  }
}

@media (max-width: 620px) {
  .sidebar {
    width: min(284px, 86vw);
  }

  .sidebar-wave {
    height: 150px;
  }

  .sidebar-footer {
    margin-bottom: 96px;
  }

  .sidebar-header {
    padding: 24px 20px 18px;
  }

  .profile-copy,
  .nav-link span:last-child,
  .settings-link span:last-child,
  .nav-section {
    display: block;
  }

  .nav {
    align-items: stretch;
    padding-inline: 14px;
  }

  .nav-link,
  .settings-link {
    width: auto;
    justify-content: flex-start;
    padding: 0 12px;
  }
}
</style>
