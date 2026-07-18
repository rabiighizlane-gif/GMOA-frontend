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
        </tbody>
      </table>
    </div>

    <RouterLink
      to="/admin/interventions"
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
  data: Array,
})

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const tableContent = {
  FR: {
    title: 'Dernieres Interventions',
    viewAll: 'Voir toutes les interventions',
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

const machineLabels = {
  'Pasteurisateur #2': {
    FR: 'Pasteurisateur #2',
    EN: 'Pasteurizer #2',
    AR: 'المبستر #2',
  },
  'Pasteurizer #2': {
    FR: 'Pasteurisateur #2',
    EN: 'Pasteurizer #2',
    AR: 'المبستر #2',
  },
  'المبستر #2': {
    FR: 'Pasteurisateur #2',
    EN: 'Pasteurizer #2',
    AR: 'المبستر #2',
  },
  'Convoyeur #4': {
    FR: 'Convoyeur #4',
    EN: 'Conveyor #4',
    AR: 'الناقل #4',
  },
  'Conveyor #4': {
    FR: 'Convoyeur #4',
    EN: 'Conveyor #4',
    AR: 'الناقل #4',
  },
  'الناقل #4': {
    FR: 'Convoyeur #4',
    EN: 'Conveyor #4',
    AR: 'الناقل #4',
  },
  'Pompe #1': {
    FR: 'Pompe #1',
    EN: 'Pump #1',
    AR: 'المضخة #1',
  },
  'Pump #1': {
    FR: 'Pompe #1',
    EN: 'Pump #1',
    AR: 'المضخة #1',
  },
  'المضخة #1': {
    FR: 'Pompe #1',
    EN: 'Pump #1',
    AR: 'المضخة #1',
  },
}

const typeLabels = {
  preventive: {
    FR: 'Preventif',
    EN: 'Preventive',
    AR: 'وقائي',
  },
  curative: {
    FR: 'Curatif',
    EN: 'Curative',
    AR: 'إصلاحي',
  },
  improvement: {
    FR: 'Amelioration',
    EN: 'Improvement',
    AR: 'تحسين',
  },
}

const technicianLabels = {
  Ahmed: {
    FR: 'Ahmed',
    EN: 'Ahmed',
    AR: 'أحمد',
  },
  Nabil: {
    FR: 'Nabil',
    EN: 'Nabil',
    AR: 'نبيل',
  },
  Youssef: {
    FR: 'Youssef',
    EN: 'Youssef',
    AR: 'يوسف',
  },
}

const statusLabels = {
  inProgress: {
    FR: 'En cours',
    EN: 'In progress',
    AR: 'قيد الإنجاز',
  },
  pending: {
    FR: 'En attente',
    EN: 'Pending',
    AR: 'في الانتظار',
  },
  completed: {
    FR: 'Termine',
    EN: 'Completed',
    AR: 'مكتمل',
  },
}

const relativeTimeLabels = {
  Hier: {
    FR: 'Hier',
    EN: 'Yesterday',
    AR: 'أمس',
  },
  Yesterday: {
    FR: 'Hier',
    EN: 'Yesterday',
    AR: 'أمس',
  },
  'أمس': {
    FR: 'Hier',
    EN: 'Yesterday',
    AR: 'أمس',
  },
}

function pickLabel(labels, key, fallback) {
  return labels[key]?.[language.value] || fallback
}

const displayMachine = (item) => pickLabel(machineLabels, item.machine, item.machine)

const displayType = (item) => pickLabel(typeLabels, item.typeKey, item.type)

const displayTechnician = (item) => pickLabel(technicianLabels, item.technician, item.technician)

const displayStatus = (item) => pickLabel(statusLabels, item.statusKey, item.status)

const displayTime = (time) => pickLabel(relativeTimeLabels, time, time)

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
