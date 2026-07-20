import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const storageKey = 'adminNotifications'

const defaultNotifications = [
  {
    id: 1,
    category: 'critical',
    tone: 'critical',
    icon: '!',
    title: 'Compresseur M-412 en panne',
    description: 'Arret immediat detecte sur la ligne utilites.',
    date: '18/07/2026 20:42',
    module: 'Pannes',
    read: false,
  },
  {
    id: 2,
    category: 'maintenance',
    tone: 'warning',
    icon: '!',
    title: 'Maintenance preventive prevue demain',
    description: 'Controle temperature programme pour Pasteurisateur P-204.',
    date: '18/07/2026 18:30',
    module: 'Maintenance preventive',
    read: false,
  },
  {
    id: 3,
    category: 'stock',
    tone: 'attention',
    icon: '!',
    title: 'Stock faible : Roulement SKF',
    description: 'Le stock est passe sous le seuil minimum.',
    date: '18/07/2026 17:10',
    module: 'Pieces de rechange',
    read: false,
  },
  {
    id: 4,
    category: 'interventions',
    tone: 'success',
    icon: 'OK',
    title: 'Intervention INT-889 terminee',
    description: 'Sara El Idrissi a cloture l intervention.',
    date: '18/07/2026 16:05',
    module: 'Interventions',
    read: true,
  },
  {
    id: 5,
    category: 'requests',
    tone: 'info',
    icon: '+',
    title: 'Nouvelle demande de maintenance creee',
    description: 'Demande DM-005 en attente de validation.',
    date: '18/07/2026 15:34',
    module: 'Demandes',
    read: true,
  },
]

function loadNotifications() {
  try {
    const storedNotifications = JSON.parse(localStorage.getItem(storageKey) || 'null')

    if (Array.isArray(storedNotifications)) {
      return storedNotifications
    }
  } catch {
    localStorage.removeItem(storageKey)
  }

  return defaultNotifications
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref(loadNotifications())

  const unreadNotifications = computed(() => notifications.value.filter((notification) => !notification.read))
  const unreadCount = computed(() => unreadNotifications.value.length)

  function markAsRead(notificationId) {
    const notification = notifications.value.find((item) => item.id === notificationId)

    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach((notification) => {
      notification.read = true
    })
  }

  watch(
    notifications,
    (nextNotifications) => {
      localStorage.setItem(storageKey, JSON.stringify(nextNotifications))
    },
    { deep: true },
  )

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
})
