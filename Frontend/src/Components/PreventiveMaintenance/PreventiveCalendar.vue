<template>
  <section class="calendar-card">
    <header class="calendar-header">
      <div>
        <h2>Calendrier préventif</h2>
        <p>Planning des opérations de maintenance</p>
      </div>

      <div class="calendar-navigation">
        <button
          type="button"
          @click="previousMonth"
        >
          ‹
        </button>

        <strong>{{ currentMonthLabel }}</strong>

        <button
          type="button"
          @click="nextMonth"
        >
          ›
        </button>
      </div>
    </header>

    <div class="week-days">
      <span
        v-for="day in weekDays"
        :key="day"
      >
        {{ day }}
      </span>
    </div>

    <div class="calendar-grid">
      <article
        v-for="calendarDay in calendarDays"
        :key="calendarDay.key"
        class="calendar-day"
        :class="{
          muted: !calendarDay.currentMonth,
          today: calendarDay.isToday
        }"
      >
        <div class="day-number">
          <span>{{ calendarDay.day }}</span>

          <small v-if="calendarDay.isToday">
            Aujourd’hui
          </small>
        </div>

        <button
          v-for="maintenance in calendarDay.maintenances"
          :key="maintenance.id"
          type="button"
          class="maintenance-event"
          :class="getEventClass(maintenance.status)"
          @click="$emit('select', maintenance)"
        >
          <span class="event-time">
            {{ maintenance.time || '09:00' }}
          </span>

          <strong>{{ maintenance.plan }}</strong>

          <small>{{ maintenance.machine }}</small>
        </button>

        <span
          v-if="calendarDay.maintenances.length === 0"
          class="empty-day"
        >
          —
        </span>
      </article>
    </div>

    <footer class="calendar-legend">
      <div>
        <span class="legend-dot planned"></span>
        Planifiée
      </div>

      <div>
        <span class="legend-dot upcoming"></span>
        À venir
      </div>

      <div>
        <span class="legend-dot late"></span>
        En retard
      </div>

      <div>
        <span class="legend-dot completed"></span>
        Réalisée
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  maintenances: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])

const today = new Date()
const displayedDate = ref(
  new Date(today.getFullYear(), today.getMonth(), 1)
)

const weekDays = [
  'Lun',
  'Mar',
  'Mer',
  'Jeu',
  'Ven',
  'Sam',
  'Dim'
]

const monthNames = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
]

const currentMonthLabel = computed(() => {
  return `${monthNames[displayedDate.value.getMonth()]} ${displayedDate.value.getFullYear()}`
})

const parseFrenchDate = (dateString) => {
  if (!dateString || dateString === '—') {
    return null
  }

  const parts = dateString.split('/')

  if (parts.length !== 3) {
    return null
  }

  const [day, month, year] = parts.map(Number)

  return new Date(year, month - 1, day)
}

const calendarDays = computed(() => {
  const year = displayedDate.value.getFullYear()
  const month = displayedDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const firstWeekDay = (firstDay.getDay() + 6) % 7
  const totalCurrentMonthDays = lastDay.getDate()

  const previousMonthLastDay = new Date(year, month, 0).getDate()

  const days = []

  for (let index = firstWeekDay - 1; index >= 0; index -= 1) {
    const day = previousMonthLastDay - index
    const date = new Date(year, month - 1, day)

    days.push(createCalendarDay(date, false))
  }

  for (let day = 1; day <= totalCurrentMonthDays; day += 1) {
    const date = new Date(year, month, day)

    days.push(createCalendarDay(date, true))
  }

  let nextMonthDay = 1

  while (days.length < 42) {
    const date = new Date(year, month + 1, nextMonthDay)

    days.push(createCalendarDay(date, false))
    nextMonthDay += 1
  }

  return days
})

const createCalendarDay = (date, currentMonth) => {
  const maintenances = props.maintenances.filter((maintenance) => {
    const dueDate = parseFrenchDate(maintenance.nextDueDate)

    if (!dueDate) {
      return false
    }

    return (
      dueDate.getFullYear() === date.getFullYear() &&
      dueDate.getMonth() === date.getMonth() &&
      dueDate.getDate() === date.getDate()
    )
  })

  return {
    key: date.toISOString(),
    day: date.getDate(),
    currentMonth,
    isToday:
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate(),
    maintenances
  }
}

const previousMonth = () => {
  displayedDate.value = new Date(
    displayedDate.value.getFullYear(),
    displayedDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  displayedDate.value = new Date(
    displayedDate.value.getFullYear(),
    displayedDate.value.getMonth() + 1,
    1
  )
}

const getEventClass = (status) => {
  const classes = {
    Planifiée: 'event-planned',
    'À venir': 'event-upcoming',
    'En retard': 'event-late',
    Réalisée: 'event-completed'
  }

  return classes[status] || 'event-default'
}
</script>

<style scoped>
.calendar-card {
  overflow: hidden;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 22px;
  border-bottom: 1px solid #edf0e8;
}

.calendar-header h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
}

.calendar-header p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 12px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-navigation strong {
  min-width: 150px;
  color: #4a0a0a;
  font-size: 14px;
  text-align: center;
}

.calendar-navigation button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  background: #f7f9f3;
  border: 1px solid #e3e9da;
  border-radius: 10px;
  color: #4a0a0a;
  font-size: 20px;
  cursor: pointer;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fafbf7;
  border-bottom: 1px solid #edf0e8;
}

.week-days span {
  padding: 12px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(145px, 1fr));
  overflow-x: auto;
}

.calendar-day {
  min-height: 150px;
  padding: 10px;
  background: white;
  border-right: 1px solid #edf0e8;
  border-bottom: 1px solid #edf0e8;
}

.calendar-day:nth-child(7n) {
  border-right: 0;
}

.calendar-day.muted {
  background: #fbfcf9;
  opacity: 0.58;
}

.calendar-day.today {
  background: #fbfdf5;
  box-shadow: inset 0 0 0 2px rgba(106, 154, 42, 0.35);
}

.day-number {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day-number > span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  color: #4a0a0a;
  font-size: 12px;
  font-weight: 800;
}

.today .day-number > span {
  background: #6a9a2a;
  border-radius: 50%;
  color: white;
}

.day-number small {
  color: #6a9a2a;
  font-size: 9px;
  font-weight: 800;
}

.maintenance-event {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 7px;
  padding: 8px;
  border: 0;
  border-left: 3px solid;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.maintenance-event:hover {
  transform: translateY(-1px);
  filter: brightness(0.98);
}

.maintenance-event strong {
  overflow: hidden;
  width: 100%;
  color: #4a0a0a;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.maintenance-event small {
  overflow: hidden;
  width: 100%;
  margin-top: 3px;
  color: #64748b;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  margin-bottom: 3px;
  font-size: 9px;
  font-weight: 800;
}

.event-planned {
  background: #edf5de;
  border-color: #6a9a2a;
}

.event-upcoming {
  background: #fff5d6;
  border-color: #e8b300;
}

.event-late {
  background: #ffe5e5;
  border-color: #e31e24;
}

.event-completed {
  background: #e5f5df;
  border-color: #43852c;
}

.event-default {
  background: #f1f5f9;
  border-color: #64748b;
}

.empty-day {
  display: block;
  margin-top: 20px;
  color: #d1d5db;
  text-align: center;
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px 22px;
  color: #64748b;
  font-size: 11px;
}

.calendar-legend div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.legend-dot.planned {
  background: #6a9a2a;
}

.legend-dot.upcoming {
  background: #e8b300;
}

.legend-dot.late {
  background: #e31e24;
}

.legend-dot.completed {
  background: #43852c;
}

@media (max-width: 700px) {
  .calendar-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
