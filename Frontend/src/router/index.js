import { createRouter, createWebHistory } from 'vue-router'

const ActivityLogPage = () => import('@/Views/Admin/ActivityLogPage.vue')
const Dashboard = () => import('@/Views/Admin/Dashboard.vue')
const Interventions = () => import('@/Views/Admin/Interventions.vue')
const KPIStatisticsPage = () => import('@/Views/Admin/KPIStatisticsPage.vue')
const MachineDetails = () => import('@/Views/Admin/MachineDetails.vue')
const Machines = () => import('@/Views/Admin/Machines.vue')
const MaintenanceRequestsPage = () => import('@/Views/Admin/MaintenanceRequestsPage.vue')
const Notifications = () => import('@/Views/Admin/Notifications.vue')
const Pannes = () => import('@/Views/Admin/Pannes.vue')
const PreventiveMaintenancePage = () => import('@/Views/Admin/PreventiveMaintenancePage.vue')
const ProductionLineDetails = () => import('@/Views/Admin/ProductionLineDetails.vue')
const ProductionLines = () => import('@/Views/Admin/ProductionLines.vue')
const Profile = () => import('@/Views/Admin/Profile.vue')
const ReportsPage = () => import('@/Views/Admin/ReportsPage.vue')
const SettingsPage = () => import('@/Views/Admin/SettingsPage.vue')
const SparePartsPage = () => import('@/Views/Admin/SparePartsPage.vue')
const Users = () => import('@/Views/Admin/Users.vue')
const LandingPage = () => import('@/Views/auth/LandingPage.vue')
const LoginPage = () => import('@/Views/auth/LoginPage.vue')

const publicRouteNames = new Set(['landing', 'login'])

function normalizeRole(role) {
  return String(role || '').toLowerCase().replace(/[\s_-]+/g, '')
}

function clearAuthState() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('selectedRole')
}

function readCurrentUser() {
  try {
    const rawUser = localStorage.getItem('user')
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    clearAuthState()
    return null
  }
}

function dashboardRouteForRole(role) {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === 'operator') return 'operator-dashboard'
  if (normalizedRole === 'technician') return 'technician-dashboard'
  if (normalizedRole === 'admin' || normalizedRole === 'superadmin') return 'admin-dashboard'

  return ''
}

function resolveHomeRoute() {
  const token = localStorage.getItem('token')

  if (!token) {
    return { name: 'login' }
  }

  const user = readCurrentUser()
  const dashboardRouteName = dashboardRouteForRole(user?.role)

  if (!dashboardRouteName) {
    clearAuthState()
    return { name: 'login' }
  }

  return { name: dashboardRouteName }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: resolveHomeRoute,
    },
    {
      path: '/home',
      name: 'landing',
      component: LandingPage,
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { public: true },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: Dashboard,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/profile',
      name: 'admin-profile',
      component: Profile,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: Users,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/machines',
      name: 'admin-machines',
      component: Machines,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/machines/:id',
      name: 'admin-machine-details',
      component: MachineDetails,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/pannes',
      name: 'admin-pannes',
      component: Pannes,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/interventions',
      name: 'admin-interventions',
      component: Interventions,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/preventive-maintenance',
      name: 'admin-preventive-maintenance',
      component: PreventiveMaintenancePage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/spare-parts',
      name: 'admin-spare-parts',
      component: SparePartsPage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/maintenance-requests',
      name: 'admin-maintenance-requests',
      component: MaintenanceRequestsPage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/reports',
      name: 'admin-reports',
      component: ReportsPage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/kpi-statistics',
      name: 'admin-kpi-statistics',
      component: KPIStatisticsPage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/activity-log',
      name: 'admin-activity-log',
      component: ActivityLogPage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: SettingsPage,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/production-lines',
      name: 'admin-production-lines',
      component: ProductionLines,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/production-lines/:id',
      name: 'admin-production-line-details',
      component: ProductionLineDetails,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/admin/notifications',
      name: 'admin-notifications',
      component: Notifications,
      meta: { roles: ['admin', 'superadmin'] },
    },
    {
      path: '/operator/dashboard',
      name: 'operator-dashboard',
      component: Dashboard,
      meta: { roles: ['operator'] },
    },
    {
      path: '/technician/dashboard',
      name: 'technician-dashboard',
      component: Dashboard,
      meta: { roles: ['technician'] },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: resolveHomeRoute,
    },
  ],
})

router.beforeEach((to) => {
  if (publicRouteNames.has(to.name) || to.meta.public) {
    return true
  }

  const token = localStorage.getItem('token')

  if (!token) {
    clearAuthState()
    return { name: 'login', query: to.fullPath !== '/login' ? { redirect: to.fullPath } : undefined }
  }

  const user = readCurrentUser()
  const role = normalizeRole(user?.role)

  if (!role) {
    clearAuthState()
    return { name: 'login' }
  }

  const allowedRoles = Array.isArray(to.meta.roles) ? to.meta.roles : []

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    const dashboardRouteName = dashboardRouteForRole(role)
    return dashboardRouteName ? { name: dashboardRouteName } : { name: 'login' }
  }

  return true
})

export default router
