import { createRouter, createWebHistory } from 'vue-router'
import ActivityLogPage from '@/Views/Admin/ActivityLogPage.vue'
import Dashboard from '@/Views/Admin/Dashboard.vue'
import Interventions from '@/Views/Admin/Interventions.vue'
import KPIStatisticsPage from '@/Views/Admin/KPIStatisticsPage.vue'
import MachineDetails from '@/Views/Admin/MachineDetails.vue'
import Machines from '@/Views/Admin/Machines.vue'
import MaintenanceRequestsPage from '@/Views/Admin/MaintenanceRequestsPage.vue'
import Notifications from '@/Views/Admin/Notifications.vue'
import Pannes from '@/Views/Admin/Pannes.vue'
import PreventiveMaintenancePage from '@/Views/Admin/PreventiveMaintenancePage.vue'
import ProductionLineDetails from '@/Views/Admin/ProductionLineDetails.vue'
import ProductionLines from '@/Views/Admin/ProductionLines.vue'
import Profile from '@/Views/Admin/Profile.vue'
import ReportsPage from '@/Views/Admin/ReportsPage.vue'
import SettingsPage from '@/Views/Admin/SettingsPage.vue'
import SparePartsPage from '@/Views/Admin/SparePartsPage.vue'
import Users from '@/Views/Admin/Users.vue'
import LandingPage from '@/Views/auth/LandingPage.vue'
import LoginPage from '@/Views/auth/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: Dashboard,
    },
    {
      path: '/admin/profile',
      name: 'admin-profile',
      component: Profile,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: Users,
    },
    {
      path: '/admin/machines',
      name: 'admin-machines',
      component: Machines,
    },
    {
      path: '/admin/machines/:id',
      name: 'admin-machine-details',
      component: MachineDetails,
    },
    {
      path: '/admin/pannes',
      name: 'admin-pannes',
      component: Pannes,
    },
    {
      path: '/admin/interventions',
      name: 'admin-interventions',
      component: Interventions,
    },
    {
      path: '/admin/preventive-maintenance',
      name: 'admin-preventive-maintenance',
      component: PreventiveMaintenancePage,
    },
    {
      path: '/admin/spare-parts',
      name: 'admin-spare-parts',
      component: SparePartsPage,
    },
    {
      path: '/admin/maintenance-requests',
      name: 'admin-maintenance-requests',
      component: MaintenanceRequestsPage,
    },
    {
      path: '/admin/reports',
      name: 'admin-reports',
      component: ReportsPage,
    },
    {
      path: '/admin/kpi-statistics',
      name: 'admin-kpi-statistics',
      component: KPIStatisticsPage,
    },
    {
      path: '/admin/activity-log',
      name: 'admin-activity-log',
      component: ActivityLogPage,
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: SettingsPage,
    },
    {
      path: '/admin/production-lines',
      name: 'admin-production-lines',
      component: ProductionLines,
    },
    {
      path: '/admin/production-lines/:id',
      name: 'admin-production-line-details',
      component: ProductionLineDetails,
    },
    {
      path: '/admin/notifications',
      name: 'admin-notifications',
      component: Notifications,
    },
    {
      path: '/operator/dashboard',
      name: 'operator-dashboard',
      component: Dashboard,
    },
    {
      path: '/technician/dashboard',
      name: 'technician-dashboard',
      component: Dashboard,
    },
  ],
})

export default router
