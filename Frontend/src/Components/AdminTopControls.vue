<template>
  <div class="admin-top-controls" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <label class="search-control">
      <input
        :value="modelValue"
        type="search"
        :placeholder="content.searchPlaceholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span aria-hidden="true">🔍</span>
    </label>

    <AdminLanguageSwitcher />

    <div ref="notificationsRef" class="notification-wrap">
      <button
        class="notification-control"
        type="button"
        :aria-label="content.notifications"
        :aria-expanded="isNotificationsOpen"
        aria-haspopup="true"
        @click.stop="toggleNotifications"
      >
        <span aria-hidden="true">🔔</span>
        <strong>{{ notifications.length }}</strong>
      </button>

      <section v-if="isNotificationsOpen" class="notifications-menu">
        <header>
          <h3>{{ content.notifications }}</h3>
          <span>{{ notifications.length }}</span>
        </header>

        <ul>
          <li v-for="notification in notifications" :key="notification.title">
            <span class="notification-dot" :class="notification.tone" aria-hidden="true"></span>
            <div>
              <strong>{{ notification.title }}</strong>
              <small>{{ notification.time }}</small>
            </div>
          </li>
        </ul>

        <button type="button" class="notifications-action" @click="openNotificationsPage">
          {{ content.viewAll }}
        </button>
      </section>
    </div>

    <div class="date-control">
      <span aria-hidden="true">🗓️</span>
      <strong>{{ formattedDate }}</strong>
    </div>

    <div class="time-control">{{ formattedTime }}</div>

    <span class="live-control">{{ content.live }}</span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLanguageSwitcher from '@/Components/AdminLanguageSwitcher.vue'
import { useLanguageStore } from '@/stores/language'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const languageStore = useLanguageStore()
const router = useRouter()
const now = ref(new Date())
const isNotificationsOpen = ref(false)
const notificationsRef = ref(null)
let clockInterval

const language = computed(() => languageStore.language)

const content = computed(() => {
  const labels = {
    FR: {
      locale: 'fr-FR',
      searchPlaceholder: 'Rechercher...',
      notifications: 'Notifications',
      viewAll: 'Voir toutes les notifications',
      live: 'En direct',
    },
    EN: {
      locale: 'en-US',
      searchPlaceholder: 'Search...',
      notifications: 'Notifications',
      viewAll: 'View all notifications',
      live: 'Live',
    },
    AR: {
      locale: 'ar-MA',
      searchPlaceholder: 'بحث...',
      notifications: 'الإشعارات',
      viewAll: 'عرض كل الإشعارات',
      live: 'مباشر',
    },
  }

  return labels[language.value] || labels.FR
})

const formattedDate = computed(() =>
  new Intl.DateTimeFormat(content.value.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now.value),
)

const formattedTime = computed(() =>
  new Intl.DateTimeFormat(content.value.locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now.value),
)

const notifications = computed(() => [
  {
    tone: 'critical',
    title:
      language.value === 'AR'
        ? 'عطل حرج في آلة'
        : language.value === 'EN'
          ? 'Critical machine breakdown'
          : 'Panne critique sur une machine',
    time:
      language.value === 'AR'
        ? 'منذ 5 دقائق'
        : language.value === 'EN'
          ? '5 min ago'
          : 'Il y a 5 min',
  },
  {
    tone: 'warning',
    title:
      language.value === 'AR'
        ? 'صيانة وقائية متأخرة'
        : language.value === 'EN'
          ? 'Preventive maintenance overdue'
          : 'Maintenance preventive en retard',
    time:
      language.value === 'AR'
        ? 'منذ 28 دقيقة'
        : language.value === 'EN'
          ? '28 min ago'
          : 'Il y a 28 min',
  },
  {
    tone: 'info',
    title:
      language.value === 'AR'
        ? 'تمت إضافة تقرير جديد'
        : language.value === 'EN'
          ? 'New report added'
          : 'Nouveau rapport ajoute',
    time:
      language.value === 'AR'
        ? 'اليوم على 09:20'
        : language.value === 'EN'
          ? 'Today at 09:20'
          : "Aujourd'hui a 09:20",
  },
])

function toggleNotifications() {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

function openNotificationsPage() {
  isNotificationsOpen.value = false
  router.push('/admin/notifications')
}

function closeNotificationsOnOutsideClick(event) {
  if (!notificationsRef.value?.contains(event.target)) {
    isNotificationsOpen.value = false
  }
}

onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
  document.addEventListener('click', closeNotificationsOnOutsideClick)
})

onBeforeUnmount(() => {
  window.clearInterval(clockInterval)
  document.removeEventListener('click', closeNotificationsOnOutsideClick)
})
</script>

<style scoped>
.admin-top-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.search-control {
  position: relative;
  width: min(100%, 320px);
}

.search-control input {
  width: 100%;
  height: 48px;
  border: 1px solid var(--sc-border);
  border-radius: 16px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  padding: 0 46px 0 16px;
  font-size: 15px;
  font-weight: 750;
  box-shadow: var(--sc-shadow);
  outline: none;
}

[dir='rtl'] .search-control input {
  padding-right: 16px;
  padding-left: 46px;
}

.search-control input:focus {
  border-color: rgba(106, 154, 42, 0.4);
  box-shadow: 0 0 0 4px var(--sc-soft-secondary);
}

.search-control span {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  font-size: 18px;
}

[dir='rtl'] .search-control span {
  right: auto;
  left: 15px;
}

.notification-wrap {
  position: relative;
  display: inline-flex;
}

.notification-control,
.date-control,
.time-control,
.live-control {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sc-border);
  border-radius: 16px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  box-shadow: var(--sc-shadow);
  font-size: 15px;
  font-weight: 950;
}

.notification-control {
  position: relative;
  width: 56px;
  border: 0;
  cursor: pointer;
}

.notification-control > span {
  font-size: 24px;
}

.notification-control strong {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--sc-primary);
  color: var(--sc-surface);
  padding: 0 7px;
  font-size: 12px;
  font-weight: 950;
}

[dir='rtl'] .notification-control strong {
  right: auto;
  left: -8px;
}

.notifications-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 80;
  width: min(330px, 86vw);
  overflow: hidden;
  border: 1px solid var(--sc-border);
  border-radius: 16px;
  background: var(--sc-surface);
  box-shadow: 0 22px 60px rgba(74, 10, 10, 0.16);
}

[dir='rtl'] .notifications-menu {
  right: auto;
  left: 0;
}

.notifications-menu header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 10px;
}

.notifications-menu h3 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 15px;
  font-weight: 950;
}

.notifications-menu header span {
  min-width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  font-size: 12px;
  font-weight: 950;
}

.notifications-menu ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.notifications-menu li {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid var(--sc-border);
}

.notification-dot {
  width: 9px;
  height: 9px;
  margin-top: 5px;
  border-radius: 999px;
  background: var(--sc-secondary);
}

.notification-dot.critical {
  background: var(--sc-danger);
}

.notification-dot.warning {
  background: var(--sc-warning);
}

.notification-dot.info {
  background: var(--sc-primary);
}

.notifications-menu strong,
.notifications-menu small {
  display: block;
}

.notifications-menu strong {
  color: var(--sc-dark);
  font-size: 13px;
  font-weight: 900;
}

.notifications-menu small {
  margin-top: 3px;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 750;
}

.notifications-action {
  width: calc(100% - 32px);
  min-height: 38px;
  margin: 10px 16px 16px;
  border: 1px solid var(--sc-border);
  border-radius: 10px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.notifications-action:hover {
  border-color: rgba(106, 154, 42, 0.28);
  background: var(--sc-soft-primary);
}

.date-control {
  gap: 10px;
  padding: 0 16px;
}

.date-control span {
  font-size: 22px;
}

.time-control {
  padding: 0 16px;
}

.live-control {
  border: 0;
  border-radius: 999px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  padding: 0 18px;
}

:global(:root[data-theme='dark']) .search-control input,
:global(:root[data-theme='dark']) .notification-control,
:global(:root[data-theme='dark']) .date-control,
:global(:root[data-theme='dark']) .time-control,
:global(:root[data-theme='dark']) .notifications-menu {
  border-color: rgba(215, 236, 120, 0.18);
  background: #172112;
  color: #eef6dc;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
}

:global(:root[data-theme='dark']) .notifications-menu h3,
:global(:root[data-theme='dark']) .notifications-menu strong {
  color: #f6ffe8;
}

:global(:root[data-theme='dark']) .notifications-menu li {
  border-top-color: rgba(215, 236, 120, 0.14);
}

:global(:root[data-theme='dark']) .notifications-menu small {
  color: #b8c7aa;
}

:global(:root[data-theme='dark']) .notifications-action {
  border-color: rgba(215, 236, 120, 0.18);
  background: #111a0d;
  color: #eef6dc;
}

:global(:root[data-theme='dark']) .live-control {
  background: rgba(16, 185, 129, 0.18);
  color: #a7f3d0;
}

@media (max-width: 760px) {
  .admin-top-controls {
    justify-content: stretch;
  }

  .search-control {
    width: 100%;
  }

  .date-control {
    flex: 1 1 190px;
  }
}
</style>
