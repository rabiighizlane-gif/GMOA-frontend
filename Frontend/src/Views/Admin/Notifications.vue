<template>
  <main class="notifications-layout" :dir="pageDirection">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.menu"
      @click="toggleSidebar"
    >
      <span></span><span></span><span></span>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="notifications-page">
      <header class="page-header">
        <div>
          <p class="breadcrumb">{{ content.breadcrumb }}</p>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
        <button type="button" class="mark-button" @click="markAllAsRead">{{ content.markAll }}</button>
      </header>

      <section class="filters-card">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :class="{ active: selectedFilter === filter.value }"
          @click="selectedFilter = filter.value"
        >
          {{ content.filters[filter.value] }}
          <span>{{ countByFilter(filter.value) }}</span>
        </button>
      </section>

      <section class="notifications-card">
        <article v-for="notification in translatedNotifications" :key="notification.id" :class="['notification-row', { unread: !notification.read }]">
          <div class="notification-icon" :class="notification.tone">{{ notification.icon }}</div>
          <div>
            <div class="notification-title">
              <strong>{{ notification.title }}</strong>
              <span v-if="!notification.read">{{ content.unread }}</span>
            </div>
            <p>{{ notification.description }}</p>
            <small>
              <span dir="ltr">{{ notification.date }}</span>
              -
              {{ notification.module }}
            </small>
          </div>
          <button v-if="!notification.read" type="button" @click="markAsRead(notification.id)">
            {{ content.markRead }}
          </button>
        </article>
      </section>

      <Transition name="toast"><div v-if="toastMessage" class="toast">{{ toastMessage }}</div></Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import Sidebar from '@/Components/sidebar.vue'
import { useLanguageStore } from '@/stores/language'
import { useNotificationsStore } from '@/stores/notifications'

const languageStore = useLanguageStore()
const notificationsStore = useNotificationsStore()

const isSidebarOpen = ref(false)
const selectedFilter = ref('all')
const toastMessage = ref('')

const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))
const notifications = computed(() => notificationsStore.notifications)

const filters = [
  { value: 'all' },
  { value: 'unread' },
  { value: 'critical' },
  { value: 'maintenance' },
  { value: 'stock' },
  { value: 'interventions' },
]

const labels = {
  FR: {
    menu: 'Afficher le menu',
    breadcrumb: 'Accueil / Notifications',
    title: 'Notifications',
    subtitle: "Centre d'alertes maintenance, stock, interventions et demandes.",
    markAll: 'Tout marquer comme lu',
    markRead: 'Marquer lu',
    unread: 'Non lue',
    toast: 'Toutes les notifications sont marquees comme lues.',
    filters: {
      all: 'Toutes',
      unread: 'Non lues',
      critical: 'Critiques',
      maintenance: 'Maintenance',
      stock: 'Stock',
      interventions: 'Interventions',
    },
  },
  EN: {
    menu: 'Show menu',
    breadcrumb: 'Home / Notifications',
    title: 'Notifications',
    subtitle: 'Alert center for maintenance, stock, interventions, and requests.',
    markAll: 'Mark all as read',
    markRead: 'Mark read',
    unread: 'Unread',
    toast: 'All notifications are marked as read.',
    filters: {
      all: 'All',
      unread: 'Unread',
      critical: 'Critical',
      maintenance: 'Maintenance',
      stock: 'Stock',
      interventions: 'Interventions',
    },
  },
  AR: {
    menu: 'عرض القائمة',
    breadcrumb: 'الرئيسية / الإشعارات',
    title: 'الإشعارات',
    subtitle: 'مركز تنبيهات الصيانة والمخزون والتدخلات والطلبات.',
    markAll: 'وضع الكل كمقروء',
    markRead: 'وضع كمقروء',
    unread: 'غير مقروءة',
    toast: 'تم وضع كل الإشعارات كمقروءة.',
    filters: {
      all: 'الكل',
      unread: 'غير مقروءة',
      critical: 'حرجة',
      maintenance: 'الصيانة',
      stock: 'المخزون',
      interventions: 'التدخلات',
    },
  },
}

const notificationText = {
  FR: {
    criticalBreakdown: {
      title: 'Compresseur M-412 en panne',
      description: 'Arret immediat detecte sur la ligne utilites.',
      module: 'Pannes',
    },
    preventiveTomorrow: {
      title: 'Maintenance preventive prevue demain',
      description: 'Controle temperature programme pour Pasteurisateur P-204.',
      module: 'Maintenance preventive',
    },
    lowStock: {
      title: 'Stock faible : Roulement SKF',
      description: 'Le stock est passe sous le seuil minimum.',
      module: 'Pieces de rechange',
    },
    interventionDone: {
      title: 'Intervention INT-889 terminee',
      description: 'Sara El Idrissi a cloture l intervention.',
      module: 'Interventions',
    },
    requestCreated: {
      title: 'Nouvelle demande de maintenance creee',
      description: 'Demande DM-005 en attente de validation.',
      module: 'Demandes',
    },
  },
  EN: {
    criticalBreakdown: {
      title: 'Compressor M-412 is down',
      description: 'Immediate shutdown detected on the utilities line.',
      module: 'Breakdowns',
    },
    preventiveTomorrow: {
      title: 'Preventive maintenance scheduled tomorrow',
      description: 'Temperature check scheduled for Pasteurizer P-204.',
      module: 'Preventive maintenance',
    },
    lowStock: {
      title: 'Low stock: SKF bearing',
      description: 'Stock has dropped below the minimum threshold.',
      module: 'Spare parts',
    },
    interventionDone: {
      title: 'Intervention INT-889 completed',
      description: 'Sara El Idrissi closed the intervention.',
      module: 'Interventions',
    },
    requestCreated: {
      title: 'New maintenance request created',
      description: 'Request DM-005 is waiting for validation.',
      module: 'Requests',
    },
  },
  AR: {
    criticalBreakdown: {
      title: 'ضاغط M-412 متوقف',
      description: 'تم اكتشاف توقف فوري في خط المرافق.',
      module: 'الأعطال',
    },
    preventiveTomorrow: {
      title: 'صيانة وقائية مبرمجة غدا',
      description: 'مراقبة الحرارة مبرمجة للمبستر P-204.',
      module: 'الصيانة الوقائية',
    },
    lowStock: {
      title: 'مخزون منخفض: محمل SKF',
      description: 'انخفض المخزون تحت الحد الأدنى.',
      module: 'قطع الغيار',
    },
    interventionDone: {
      title: 'تم إنهاء التدخل INT-889',
      description: 'سارة الإدريسي أغلقت التدخل.',
      module: 'التدخلات',
    },
    requestCreated: {
      title: 'تم إنشاء طلب صيانة جديد',
      description: 'الطلب DM-005 في انتظار المصادقة.',
      module: 'الطلبات',
    },
  },
}

const titleToKey = {
  'Compresseur M-412 en panne': 'criticalBreakdown',
  'Maintenance preventive prevue demain': 'preventiveTomorrow',
  'Stock faible : Roulement SKF': 'lowStock',
  'Intervention INT-889 terminee': 'interventionDone',
  'Nouvelle demande de maintenance creee': 'requestCreated',
}

const idToKey = {
  1: 'criticalBreakdown',
  2: 'preventiveTomorrow',
  3: 'lowStock',
  4: 'interventionDone',
  5: 'requestCreated',
}

const content = computed(() => labels[languageStore.language] || labels.FR)
const textPack = computed(() => notificationText[languageStore.language] || notificationText.FR)

const translatedNotifications = computed(() => {
  const filtered = selectedFilter.value === 'all'
    ? notifications.value
    : selectedFilter.value === 'unread'
      ? notifications.value.filter((item) => !item.read)
      : notifications.value.filter((item) => item.category === selectedFilter.value)

  return filtered.map((notification) => {
    const key = notification.textKey || titleToKey[notification.title] || idToKey[notification.id]
    const translated = textPack.value[key] || {}

    return {
      ...notification,
      icon: notification.icon === 'OK' && languageStore.language === 'AR' ? 'تم' : notification.icon,
      title: translated.title || notification.title,
      description: translated.description || notification.description,
      module: translated.module || notification.module,
    }
  })
})

function countByFilter(filter) {
  if (filter === 'all') return notifications.value.length
  if (filter === 'unread') return notifications.value.filter((item) => !item.read).length
  return notifications.value.filter((item) => item.category === filter).length
}

function markAllAsRead() {
  notificationsStore.markAllAsRead()
  showToast(content.value.toast)
}

function markAsRead(notificationId) {
  notificationsStore.markAsRead(notificationId)
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
.notifications-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 0%, rgba(77, 126, 172, 0.14), transparent 28%),
    linear-gradient(180deg, #111927 0%, #101822 46%, #0d1520 100%);
  color: #f4f7fb;
}

.notifications-page {
  display: grid;
  gap: 18px;
  min-height: 100vh;
  padding: 28px 28px 38px 88px;
}

.notifications-layout[dir='rtl'] .notifications-page { padding-right: 88px; padding-left: 28px; }
.sidebar-toggle { position: fixed; top: 22px; left: 22px; z-index: 90; display: inline-flex; width: 42px; height: 42px; align-items: center; justify-content: center; flex-direction: column; gap: 5px; background: rgba(28, 40, 54, 0.9); border: 1px solid rgba(126, 146, 170, 0.22); border-radius: 12px; color: #d9e4ef; box-shadow: 0 12px 28px rgba(0,0,0,.24); cursor: pointer; }
.notifications-layout[dir='rtl'] .sidebar-toggle { right: 24px; left: auto; }
.sidebar-toggle.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.sidebar-toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 999px; }
.sidebar-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(5,10,18,.56); backdrop-filter: blur(3px); }
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.breadcrumb { margin: 0 0 7px; color: #83b95c; font-size: 12px; font-weight: 900; }
.page-header h1 { margin: 0; color: #f8fbff; font-size: 34px; font-weight: 950; letter-spacing: 0; }
.page-header p { margin: 8px 0 0; color: #aab7c7; font-size: 15px; font-weight: 720; }
.mark-button { min-height: 44px; padding: 0 18px; border: 1px solid rgba(131, 185, 92, 0.44); border-radius: 12px; background: #5f8f2f; color: #f8fbff; font-weight: 950; cursor: pointer; box-shadow: 0 16px 34px rgba(0,0,0,.24); }
.mark-button:hover { background: #6fa43c; }
.filters-card { display: flex; flex-wrap: wrap; gap: 10px; padding: 16px; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); }
.filters-card button { display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 13px; border: 1px solid rgba(126, 146, 170, 0.26); border-radius: 999px; background: rgba(13, 21, 32, 0.72); color: #aeb9c8; font-weight: 900; cursor: pointer; }
.filters-card button:hover { border-color: rgba(91, 155, 215, 0.54); color: #dcecff; }
.filters-card button.active { border-color: rgba(131, 185, 92, 0.64); background: rgba(131, 185, 92, 0.16); color: #bce39d; }
.filters-card span { min-width: 22px; height: 22px; display: inline-grid; place-items: center; border-radius: 999px; background: rgba(244, 247, 251, 0.08); color: #f4f7fb; font-size: 11px; }
.notifications-card { overflow: hidden; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); }
.notification-row { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; align-items: center; gap: 16px; padding: 18px 20px; border-top: 1px solid rgba(116, 135, 158, 0.15); background: rgba(17, 27, 38, 0.72); }
.notifications-layout[dir='rtl'] .notification-row { grid-template-columns: auto minmax(0, 1fr) 46px; }
.notification-row:first-child { border-top: 0; }
.notification-row.unread { background: linear-gradient(90deg, rgba(228, 171, 68, 0.08), rgba(17, 27, 38, 0.72)); }
.notification-row:hover { background: rgba(35, 49, 64, 0.92); }
.notification-icon { width: 46px; height: 46px; display: inline-grid; place-items: center; border-radius: 12px; font-size: 18px; font-weight: 950; }
.notification-icon.critical { background: rgba(220, 55, 71, 0.18); color: #ff7f8e; }
.notification-icon.warning { background: rgba(228, 171, 68, 0.18); color: #ffd27b; }
.notification-icon.attention { background: rgba(228, 171, 68, 0.16); color: #e4ab44; }
.notification-icon.success { background: rgba(131, 185, 92, 0.18); color: #bce39d; }
.notification-icon.info { background: rgba(75, 153, 212, 0.18); color: #8fcaff; }
.notification-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.notification-title strong { color: #f4f7fb; font-size: 15px; font-weight: 950; }
.notification-title span { padding: 4px 8px; border-radius: 999px; background: rgba(220, 55, 71, 0.16); color: #ff9ca7; font-size: 10px; font-weight: 950; }
.notification-row p { margin: 5px 0; color: #aab7c7; font-size: 13px; font-weight: 720; }
.notification-row small { color: #8d9aab; font-size: 12px; font-weight: 800; }
.notification-row button { min-height: 38px; padding: 0 12px; border: 1px solid rgba(210, 221, 234, 0.28); border-radius: 8px; background: rgba(13, 21, 32, 0.82); color: #f2f6fb; font-weight: 900; cursor: pointer; }
.notification-row button:hover { border-color: rgba(91, 155, 215, 0.72); color: #cfe9ff; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 11000; padding: 14px 18px; background: #101924; border: 1px solid rgba(126, 146, 170, 0.24); border-radius: 12px; color: #f4f7fb; font-weight: 900; box-shadow: 0 18px 44px rgba(0,0,0,.36); }
.notifications-layout[dir='rtl'] .toast { right: auto; left: 24px; }
.toast-enter-active, .toast-leave-active { transition: .22s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 760px) {
  .notifications-page,
  .notifications-layout[dir='rtl'] .notifications-page { padding: 88px 16px 32px; }
  .page-header { display: flex; align-items: stretch; flex-direction: column; }
  .notification-row,
  .notifications-layout[dir='rtl'] .notification-row { grid-template-columns: 46px minmax(0, 1fr); }
  .notification-row button { grid-column: 2; width: max-content; }
}
</style>
