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
        <InterventionsChart :aria-label="content.chartLabel" :empty-message="content.unavailable" />

        <div class="mt-1 flex items-center gap-3 text-sm font-bold text-slate-600">
          <span class="h-3 w-3 rounded-full bg-[#6A9A2A]"></span>
          {{ content.interventionCount }}
        </div>
      </div>

      <div class="border-t border-slate-100 p-6 lg:border-l lg:border-t-0">
        <h3 class="mb-8 text-sm font-extrabold text-slate-900">{{ content.statusBreakdown }}</h3>
        <div class="flex flex-col items-center gap-8 md:flex-row lg:flex-col xl:flex-row">
          <StatusDonutChart
            class="shadow-inner"
            :series="statusSeries"
            :labels="statusLabels"
            :total-label="content.total"
            :aria-label="content.statusBreakdown"
            :empty-message="content.unavailable"
          />

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
import InterventionsChart from '@/Components/Dashboard/Charts/InterventionsChart.vue'
import StatusDonutChart from '@/Components/Dashboard/Charts/StatusDonutChart.vue'

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
    unavailable: 'Donnees indisponibles',
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
    unavailable: 'Data unavailable',
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
    unavailable: 'Donnees indisponibles',
    completed: 'مكتملة',
    inProgress: 'قيد الإنجاز',
    pending: 'في الانتظار',
  },
}

const content = computed(() => chartContent[language.value] || chartContent.FR)

const statusItems = computed(() => [
  { label: content.value.completed, value: content.value.unavailable, colorClass: 'bg-[#6A9A2A]' },
  { label: content.value.inProgress, value: content.value.unavailable, colorClass: 'bg-[#FF6A00]' },
  { label: content.value.pending, value: content.value.unavailable, colorClass: 'bg-[#E31E24]' },
])

const statusSeries = []
const statusLabels = computed(() => [content.value.completed, content.value.inProgress, content.value.pending])
</script>
