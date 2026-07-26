<template>
  <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
      <span>📋</span> {{ content.title }}
    </h3>
    <div class="overflow-x-auto">
      <table
        class="w-full text-sm text-slate-600"
        :class="language === 'AR' ? 'text-right' : 'text-left'"
      >
        <thead class="text-xs text-slate-400 uppercase bg-slate-50">
          <tr>
            <th class="py-3 px-4">{{ content.columns.id }}</th>
            <th class="py-3 px-4">{{ content.columns.machine }}</th>
            <th class="py-3 px-4">{{ content.columns.type }}</th>
            <th class="py-3 px-4">{{ content.columns.technician }}</th>
            <th class="py-3 px-4">{{ content.columns.status }}</th>
            <th class="py-3 px-4">{{ content.columns.time }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in data" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="py-3 px-4 font-bold text-slate-800">{{ item.id }}</td>
            <td class="py-3 px-4 font-medium text-slate-700">{{ displayMachine(item) }}</td>
            <td class="py-3 px-4">
              <span :class="getTypeClass(item)">{{ displayType(item) }}</span>
            </td>
            <td class="py-3 px-4 font-medium text-slate-600">{{ displayTechnician(item) }}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 text-xs rounded-full font-semibold" :class="getStatusClass(item)">
                {{ displayStatus(item) }}
              </span>
            </td>
            <td class="py-3 px-4 text-xs text-slate-400">{{ displayTime(item.time) }}</td>
          </tr>
          <tr v-if="!data?.length">
            <td colspan="6" class="py-8 px-4 text-center text-sm font-bold text-slate-500">
              {{ content.unavailable }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RouterLink
      :to="{ name: 'admin-interventions' }"
      class="mt-5 inline-flex items-center gap-3 text-sm font-extrabold text-green-700 transition hover:text-green-800"
    >
      {{ content.viewAll }}
      <span class="text-2xl leading-none">-></span>
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
})

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const tableContent = {
  FR: {
    title: 'Dernieres Interventions',
    viewAll: 'Voir toutes les interventions',
    unavailable: 'Donnees indisponibles',
    columns: {
      id: 'ID',
      machine: 'Machine',
      type: 'Type',
      technician: 'Technicien',
      status: 'Statut',
      time: 'Heure',
    },
  },
  EN: {
    title: 'Latest Interventions',
    viewAll: 'View all interventions',
    unavailable: 'Data unavailable',
    columns: {
      id: 'ID',
      machine: 'Machine',
      type: 'Type',
      technician: 'Technician',
      status: 'Status',
      time: 'Time',
    },
  },
  AR: {
    title: 'آخر التدخلات',
    viewAll: 'عرض كل التدخلات',
    unavailable: 'Donnees indisponibles',
    columns: {
      id: 'المعرف',
      machine: 'الآلة',
      type: 'النوع',
      technician: 'التقني',
      status: 'الحالة',
      time: 'الوقت',
    },
  },
}

const content = computed(() => tableContent[language.value] || tableContent.FR)

const displayMachine = (item) => item.machine || '-'

const displayType = (item) => item.type || '-'

const displayTechnician = (item) => item.technician || '-'

const displayStatus = (item) => item.status || '-'

const displayTime = (time) => time || '-'
const getStatusClass = (item) => {
  if (item.statusKey === 'inProgress') return 'bg-amber-100 text-amber-800'
  if (item.statusKey === 'pending') return 'bg-rose-100 text-rose-800'
  return 'bg-emerald-100 text-emerald-800'
}

const getTypeClass = (item) => {
  if (item.typeKey === 'curative') return 'text-rose-600 font-medium'
  if (item.typeKey === 'preventive') return 'text-amber-600 font-medium'
  return 'text-emerald-600 font-medium'
}
</script>
