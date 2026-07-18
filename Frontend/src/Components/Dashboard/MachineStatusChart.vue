<template>
  <section class="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
    <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <h2 class="text-xl font-extrabold text-slate-900">{{ content.title }}</h2>
      <button
        class="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        type="button"
      >
        <svg
          class="h-4 w-4 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
          <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
        {{ content.today }}
        <svg
          class="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr]">
      <div class="p-6">
        <h3 class="mb-5 text-sm font-extrabold text-slate-900">{{ content.interventions }}</h3>
        <svg
          class="h-72 w-full overflow-visible"
          viewBox="0 0 620 280"
          preserveAspectRatio="none"
          role="img"
          :aria-label="content.chartLabel"
        >
          <defs>
            <linearGradient id="intervention-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#6a9a2a" stop-opacity="0.24" />
              <stop offset="100%" stop-color="#6a9a2a" stop-opacity="0" />
            </linearGradient>
          </defs>

          <g class="text-slate-200">
            <line v-for="line in gridLines" :key="line" x1="46" x2="590" :y1="line" :y2="line" stroke="currentColor" />
          </g>

          <line x1="46" x2="590" y1="220" y2="220" stroke="#e2e8f0" />
          <polygon :points="areaPoints" fill="url(#intervention-fill)" />
          <polyline
            :points="linePoints"
            fill="none"
            stroke="#6a9a2a"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="point in dots"
            :key="point.hour"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#6a9a2a"
            stroke="#ffffff"
            stroke-width="2"
          />

          <g class="text-[12px] font-bold text-slate-500">
            <text v-for="tick in yTicks" :key="tick.value" x="28" :y="tick.y + 4" text-anchor="end" fill="currentColor">
              {{ tick.value }}
            </text>
            <text v-for="tick in xTicks" :key="tick.label" :x="tick.x" y="252" text-anchor="middle" fill="currentColor">
              {{ tick.label }}
            </text>
          </g>
        </svg>

        <div class="mt-1 flex items-center gap-3 text-sm font-bold text-slate-600">
          <span class="h-3 w-3 rounded-full bg-[#6A9A2A]"></span>
          {{ content.interventionCount }}
        </div>
      </div>

      <div class="border-t border-slate-100 p-6 lg:border-l lg:border-t-0">
        <h3 class="mb-8 text-sm font-extrabold text-slate-900">{{ content.statusBreakdown }}</h3>
        <div class="flex flex-col items-center gap-8 md:flex-row lg:flex-col xl:flex-row">
          <div class="relative grid h-48 w-48 place-items-center rounded-full donut-chart shadow-inner" :aria-label="content.statusBreakdown">
            <div class="absolute inset-12 rounded-full bg-white shadow-sm"></div>
            <div class="relative text-center">
              <p class="text-3xl font-extrabold text-slate-900">82</p>
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ content.total }}</p>
            </div>
          </div>

          <div class="space-y-7 text-sm font-bold text-slate-700">
            <div v-for="item in statusItems" :key="item.label" class="flex items-start gap-3">
              <span class="mt-1 h-3 w-3 rounded-full" :class="item.colorClass"></span>
              <div>
                <p>{{ item.label }}</p>
                <p class="mt-1 text-slate-500">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const chartContent = {
  FR: {
    title: 'Vue générale',
    today: "Aujourd'hui",
    interventions: 'Interventions',
    chartLabel: "Nombre d'interventions par heure",
    interventionCount: "Nombre d'interventions",
    statusBreakdown: 'Répartition par statut',
    total: 'Total',
    completed: 'Terminées',
    inProgress: 'En cours',
    pending: 'En attente',
  },
  EN: {
    title: 'Overview',
    today: 'Today',
    interventions: 'Interventions',
    chartLabel: 'Number of interventions per hour',
    interventionCount: 'Number of interventions',
    statusBreakdown: 'Breakdown by status',
    total: 'Total',
    completed: 'Completed',
    inProgress: 'In progress',
    pending: 'Pending',
  },
  AR: {
    title: 'نظرة عامة',
    today: 'اليوم',
    interventions: 'التدخلات',
    chartLabel: 'عدد التدخلات حسب الساعة',
    interventionCount: 'عدد التدخلات',
    statusBreakdown: 'التوزيع حسب الحالة',
    total: 'المجموع',
    completed: 'مكتملة',
    inProgress: 'قيد الإنجاز',
    pending: 'في الانتظار',
  },
}

const content = computed(() => chartContent[language.value] || chartContent.FR)

const chartValues = [
  { hour: '00:00', value: 2 },
  { hour: '02:00', value: 7 },
  { hour: '04:00', value: 13 },
  { hour: '06:00', value: 24 },
  { hour: '08:00', value: 31 },
  { hour: '10:00', value: 38 },
  { hour: '12:00', value: 35 },
  { hour: '14:00', value: 41 },
  { hour: '16:00', value: 36 },
  { hour: '18:00', value: 40 },
  { hour: '20:00', value: 36 },
  { hour: '22:00', value: 45 },
  { hour: '24:00', value: 49 },
]

const statusItems = computed(() => [
  { label: content.value.completed, value: '45 (55%)', colorClass: 'bg-[#6A9A2A]' },
  { label: content.value.inProgress, value: '27 (33%)', colorClass: 'bg-[#FF6A00]' },
  { label: content.value.pending, value: '10 (12%)', colorClass: 'bg-[#E31E24]' },
])

const gridLines = [28, 66, 104, 142, 180, 220]
const left = 46
const right = 590
const top = 28
const bottom = 220
const maxValue = 50
const step = (right - left) / (chartValues.length - 1)

const yTicks = computed(() =>
  [0, 10, 20, 30, 40, 50].map((value) => ({
    value,
    y: bottom - (value / maxValue) * (bottom - top),
  })),
)

const xTicks = computed(() =>
  ['00:00', '04:00', '08:00', '12:00', '16:00', '24:00'].map((label) => {
    const index = chartValues.findIndex((point) => point.hour === label)

    return {
      label,
      x: left + index * step,
    }
  }),
)

const dots = computed(() =>
  chartValues.map((point, index) => ({
    hour: point.hour,
    x: left + index * step,
    y: bottom - (point.value / maxValue) * (bottom - top),
  })),
)

const linePoints = computed(() => dots.value.map((point) => `${point.x},${point.y}`).join(' '))

const areaPoints = computed(() => {
  const first = dots.value[0]
  const last = dots.value[dots.value.length - 1]

  return `${first.x},${bottom} ${linePoints.value} ${last.x},${bottom}`
})
</script>

<style scoped>
.donut-chart {
  background: conic-gradient(#6a9a2a 0 55%, #ff6a00 55% 88%, #e31e24 88% 100%);
}
</style>
