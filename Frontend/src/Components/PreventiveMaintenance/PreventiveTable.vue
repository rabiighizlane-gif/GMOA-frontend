<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.shown(maintenances.length) }}</p>
      </div>

      <button class="export-button" type="button" @click="$emit('export')">
        <PreventiveIcon name="download" />
        {{ content.export }}
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>{{ content.columns.plan }}</th>
            <th>{{ content.columns.machine }}</th>
            <th>{{ content.columns.frequency }}</th>
            <th>{{ content.columns.lastExecution }}</th>
            <th>{{ content.columns.nextDueDate }}</th>
            <th>{{ content.columns.responsible }}</th>
            <th>{{ content.columns.status }}</th>
            <th>{{ content.columns.actions }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="maintenance in paginatedMaintenances" :key="maintenance.id">
            <td class="id-cell">{{ maintenance.id }}</td>

            <td>
              <div class="plan-cell">
                <span class="plan-icon"><PreventiveIcon name="tool" /></span>
                <div>
                  <strong>{{ planLabel(maintenance.plan) }}</strong>
                  <small>{{ lineLabel(maintenance.line) }}</small>
                </div>
              </div>
            </td>

            <td><strong class="machine-name">{{ machineLabel(maintenance.machine) }}</strong></td>
            <td><span class="frequency-badge">{{ frequencyLabel(maintenance.frequency) }}</span></td>
            <td>{{ maintenance.lastExecution }}</td>

            <td>
              <div class="deadline-cell">
                <strong>{{ maintenance.nextDueDate }}</strong>
                <small :class="`deadline-${maintenance.deadlineColor}`">{{ deadlineLabel(maintenance) }}</small>
              </div>
            </td>

            <td>
              <div class="technician-cell">
                <span class="avatar">{{ initialsLabel(maintenance) }}</span>
                <span>{{ technicianLabel(maintenance.technician) }}</span>
              </div>
            </td>

            <td>
              <span class="status-badge" :class="getStatusClass(maintenance.status)">
                {{ statusLabel(maintenance.status) }}
              </span>
            </td>

            <td>
              <div class="actions">
                <button type="button" :title="content.actions.view" @click="$emit('view', maintenance)">
                  <PreventiveIcon name="eye" />
                </button>
                <button type="button" :title="content.actions.edit" @click="$emit('edit', maintenance)">
                  <PreventiveIcon name="edit" />
                </button>
                <button
                  v-if="!['Realisee', 'Réalisée'].includes(maintenance.status)"
                  type="button"
                  :title="content.actions.complete"
                  @click="$emit('complete', maintenance)"
                >
                  <PreventiveIcon name="check" />
                </button>
                <button type="button" :title="content.actions.delete" class="delete-button" @click="$emit('delete', maintenance)">
                  <PreventiveIcon name="trash" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedMaintenances.length === 0">
            <td colspan="9" class="empty-state">
              <div class="empty-content">
                <span><PreventiveIcon name="search" /></span>
                <strong>{{ content.emptyTitle }}</strong>
                <p>{{ content.emptyText }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="maintenances.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">
        {{ content.previous }}
      </button>

      <div class="page-numbers">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>

      <span>{{ content.range(startItem, endItem, maintenances.length) }}</span>

      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">
        {{ content.next }}
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'

const props = defineProps({
  maintenances: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['view', 'edit', 'complete', 'delete', 'export'])

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const currentPage = ref(1)
const itemsPerPage = 3

const translations = {
  FR: {
    title: 'Plans de maintenance preventive',
    export: 'Exporter',
    shown: (count) => `${count} plan(s) affiche(s)`,
    columns: {
      plan: 'Plan',
      machine: 'Machine',
      frequency: 'Frequence',
      lastExecution: 'Derniere realisation',
      nextDueDate: 'Prochaine echeance',
      responsible: 'Responsable',
      status: 'Statut',
      actions: 'Actions',
    },
    actions: {
      view: 'Voir les details',
      edit: 'Modifier',
      complete: 'Marquer comme realisee',
      delete: 'Supprimer',
    },
    emptyTitle: 'Aucun plan trouve',
    emptyText: 'Aucun plan de maintenance ne correspond aux filtres selectionnes.',
    previous: '<- Precedent',
    next: 'Suivant ->',
    range: (start, end, total) => `${start}-${end} sur ${total}`,
    statuses: { Planifiee: 'Planifiee', 'A venir': 'A venir', 'En retard': 'En retard', Realisee: 'Realisee' },
    frequencies: { Quotidienne: 'Quotidienne', Hebdomadaire: 'Hebdomadaire', Mensuelle: 'Mensuelle', Trimestrielle: 'Trimestrielle', Annuelle: 'Annuelle' },
  },
  EN: {
    title: 'Preventive maintenance plans',
    export: 'Export',
    shown: (count) => `${count} plan(s) shown`,
    columns: {
      plan: 'Plan',
      machine: 'Machine',
      frequency: 'Frequency',
      lastExecution: 'Last completion',
      nextDueDate: 'Next due date',
      responsible: 'Responsible',
      status: 'Status',
      actions: 'Actions',
    },
    actions: {
      view: 'View details',
      edit: 'Edit',
      complete: 'Mark as completed',
      delete: 'Delete',
    },
    emptyTitle: 'No plan found',
    emptyText: 'No maintenance plan matches the selected filters.',
    previous: '<- Previous',
    next: 'Next ->',
    range: (start, end, total) => `${start}-${end} of ${total}`,
    statuses: { Planifiee: 'Planned', 'A venir': 'Upcoming', 'En retard': 'Overdue', Realisee: 'Completed' },
    frequencies: { Quotidienne: 'Daily', Hebdomadaire: 'Weekly', Mensuelle: 'Monthly', Trimestrielle: 'Quarterly', Annuelle: 'Yearly' },
  },
  AR: {
    title: 'خطط الصيانة الوقائية',
    export: 'تصدير',
    shown: (count) => `${count} خطة معروضة`,
    columns: {
      plan: 'الخطة',
      machine: 'الآلة',
      frequency: 'التواتر',
      lastExecution: 'آخر إنجاز',
      nextDueDate: 'الموعد القادم',
      responsible: 'المسؤول',
      status: 'الحالة',
      actions: 'الإجراءات',
    },
    actions: {
      view: 'عرض التفاصيل',
      edit: 'تعديل',
      complete: 'تعليم كمنجزة',
      delete: 'حذف',
    },
    emptyTitle: 'لا توجد خطة',
    emptyText: 'لا توجد خطة صيانة توافق الفلاتر المختارة.',
    previous: 'السابق <-',
    next: 'التالي ->',
    range: (start, end, total) => `${start}-${end} من ${total}`,
    statuses: { Planifiee: 'مبرمجة', 'A venir': 'قادمة', 'En retard': 'متأخرة', Realisee: 'منجزة' },
    frequencies: { Quotidienne: 'يومية', Hebdomadaire: 'أسبوعية', Mensuelle: 'شهرية', Trimestrielle: 'ربع سنوية', Annuelle: 'سنوية' },
  },
}

const content = computed(() => translations[language.value] || translations.FR)
const displayMaps = {
  FR: {
    plans: {
      'Graissage du moteur': 'Graissage du moteur',
      'Controle de temperature': 'Controle de temperature',
      'Contrôle de température': 'Controle de temperature',
      'Nettoyage des filtres': 'Nettoyage des filtres',
      'Inspection des buses': 'Inspection des buses',
    },
    machines: {
      'Convoyeur M-309': 'Convoyeur M-309',
      'Pasteurisateur P-204': 'Pasteurisateur P-204',
      'Compresseur M-412': 'Compresseur M-412',
      'Remplisseuse R-118': 'Remplisseuse R-118',
    },
    lines: {
      'Ligne Conditionnement': 'Ligne Conditionnement',
      'Ligne Production 1': 'Ligne Production 1',
      'Ligne Utilites': 'Ligne Utilites',
      'Ligne Utilités': 'Ligne Utilites',
    },
    technicians: {
      'Sara El Idrissi': 'Sara El Idrissi',
      'Nabil Amrani': 'Nabil Amrani',
      'Youssef Berrada': 'Youssef Berrada',
      'Ahmed El Mansouri': 'Ahmed El Mansouri',
    },
    initials: { 'Sara El Idrissi': 'SE', 'Nabil Amrani': 'NA', 'Youssef Berrada': 'YB', 'Ahmed El Mansouri': 'AE' },
  },
  EN: {
    plans: {
      'Graissage du moteur': 'Motor greasing',
      'Controle de temperature': 'Temperature check',
      'Contrôle de température': 'Temperature check',
      'Nettoyage des filtres': 'Filter cleaning',
      'Inspection des buses': 'Nozzle inspection',
    },
    machines: {
      'Convoyeur M-309': 'Conveyor M-309',
      'Pasteurisateur P-204': 'Pasteurizer P-204',
      'Compresseur M-412': 'Compressor M-412',
      'Remplisseuse R-118': 'Filling machine R-118',
    },
    lines: {
      'Ligne Conditionnement': 'Packaging line',
      'Ligne Production 1': 'Production line 1',
      'Ligne Utilites': 'Utilities line',
      'Ligne Utilités': 'Utilities line',
    },
    technicians: {
      'Sara El Idrissi': 'Sara El Idrissi',
      'Nabil Amrani': 'Nabil Amrani',
      'Youssef Berrada': 'Youssef Berrada',
      'Ahmed El Mansouri': 'Ahmed El Mansouri',
    },
    initials: { 'Sara El Idrissi': 'SE', 'Nabil Amrani': 'NA', 'Youssef Berrada': 'YB', 'Ahmed El Mansouri': 'AE' },
  },
  AR: {
    plans: {
      'Graissage du moteur': 'تشحيم المحرك',
      'Controle de temperature': 'مراقبة درجة الحرارة',
      'Contrôle de température': 'مراقبة درجة الحرارة',
      'Nettoyage des filtres': 'تنظيف المرشحات',
      'Inspection des buses': 'فحص الفوهات',
    },
    machines: {
      'Convoyeur M-309': 'ناقل M-309',
      'Pasteurisateur P-204': 'مبستر P-204',
      'Compresseur M-412': 'ضاغط M-412',
      'Remplisseuse R-118': 'آلة تعبئة R-118',
    },
    lines: {
      'Ligne Conditionnement': 'خط التكييف',
      'Ligne Production 1': 'خط الإنتاج 1',
      'Ligne Utilites': 'خط المرافق',
      'Ligne Utilités': 'خط المرافق',
    },
    technicians: {
      'Sara El Idrissi': 'سارة الإدريسي',
      'Nabil Amrani': 'نبيل العمراني',
      'Youssef Berrada': 'يوسف برادة',
      'Ahmed El Mansouri': 'أحمد المنصوري',
    },
    initials: { 'Sara El Idrissi': 'سإ', 'Nabil Amrani': 'نع', 'Youssef Berrada': 'يب', 'Ahmed El Mansouri': 'أم' },
  },
}
const displayMap = computed(() => displayMaps[language.value] || displayMaps.FR)
const totalPages = computed(() => Math.max(1, Math.ceil(props.maintenances.length / itemsPerPage)))
const paginatedMaintenances = computed(() => props.maintenances.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const startItem = computed(() => (props.maintenances.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1))
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, props.maintenances.length))

watch(
  () => props.maintenances.map((maintenance) => maintenance.id).join('|'),
  () => {
    currentPage.value = 1
  }
)

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

const statusLabel = (status) => content.value.statuses[status] || status
const frequencyLabel = (frequency) => content.value.frequencies[frequency] || frequency
const planLabel = (plan) => displayMap.value.plans[plan] || plan
const machineLabel = (machine) => displayMap.value.machines[machine] || machine
const lineLabel = (line) => displayMap.value.lines[line] || line
const technicianLabel = (technician) => displayMap.value.technicians[technician] || technician
const initialsLabel = (maintenance) => displayMap.value.initials[maintenance.technician] || maintenance.initials
const deadlineLabel = (maintenance) => {
  if (language.value === 'FR') return maintenance.deadlineLabel

  const label = String(maintenance.deadlineLabel || '')
  const daysMatch = label.match(/^Dans\s+(\d+)\s+jours?$/i)
  const lateMatch = label.match(/^En retard de\s+(\d+)\s+jours?$/i)
  const completedMatch = label.match(/^R[eé]alis[eé]e le\s+(.+)$/i)

  if (language.value === 'EN') {
    if (daysMatch) return `In ${daysMatch[1]} day${Number(daysMatch[1]) > 1 ? 's' : ''}`
    if (lateMatch) return `${lateMatch[1]} day${Number(lateMatch[1]) > 1 ? 's' : ''} overdue`
    if (completedMatch) return `Completed on ${completedMatch[1]}`
  }

  if (language.value === 'AR') {
    if (daysMatch) return `بعد ${daysMatch[1]} يوم`
    if (lateMatch) return Number(lateMatch[1]) === 1 ? 'متأخرة بيوم واحد' : `متأخرة بـ ${lateMatch[1]} أيام`
    if (completedMatch) return `منجزة في ${completedMatch[1]}`
  }

  if (maintenance.status === 'En retard') return content.value.statuses['En retard']
  if (maintenance.status === 'Realisee') return content.value.statuses.Realisee
  if (maintenance.status === 'A venir') return content.value.statuses['A venir']
  return maintenance.deadlineLabel
}

const getStatusClass = (status) => {
  const statusClasses = {
    Planifiee: 'status-planned',
    Planifiée: 'status-planned',
    'A venir': 'status-upcoming',
    'À venir': 'status-upcoming',
    'En retard': 'status-late',
    Realisee: 'status-completed',
    Réalisée: 'status-completed',
    'En cours': 'status-progress',
  }

  return statusClasses[status] || 'status-default'
}
</script>

<style scoped>
.table-card {
  overflow: hidden;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #edf0e8;
}

.table-header h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
}

.table-header p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.export-button {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: white;
  border: 1px solid #dfe5d6;
  border-radius: 11px;
  color: #4a0a0a;
  font-weight: 700;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1350px;
  border-collapse: collapse;
}

thead {
  background: #fafbf7;
}

th {
  padding: 14px 15px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 15px;
  color: #4a0a0a;
  border-top: 1px solid #edf0e8;
  font-size: 12px;
  vertical-align: middle;
}

tbody tr:hover {
  background: #fbfcf8;
}

.id-cell {
  color: #4a0a0a;
  font-weight: 900;
}

.plan-cell,
.technician-cell,
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-cell {
  gap: 10px;
}

.plan-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  place-items: center;
  background: #f0f5e5;
  border-radius: 10px;
  color: #6a9a2a;
}

.plan-cell strong,
.plan-cell small,
.deadline-cell strong,
.deadline-cell small {
  display: block;
}

.plan-cell strong,
.machine-name {
  color: #111827;
  font-size: 12px;
}

.plan-cell small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 9px;
}

.frequency-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.frequency-badge {
  padding: 6px 9px;
  background: #f0f5e5;
  color: #6a9a2a;
}

.deadline-cell small {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 700;
}

.deadline-green { color: #6a9a2a; }
.deadline-yellow { color: #b88700; }
.deadline-orange { color: #ff6a00; }
.deadline-red { color: #e31e24; }

.avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  background: #6a9a2a;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  font-weight: 800;
}

.status-badge {
  padding: 7px 10px;
}

.status-planned { background: #e9f3db; color: #5f8c23; }
.status-upcoming { background: #fff4cf; color: #ad7a00; }
.status-late { background: #ffe2e2; color: #d51c22; }
.status-completed { background: #e3f4df; color: #43852c; }
.status-progress { background: #fff0df; color: #ff6a00; }
.status-default { background: #f1f5f9; color: #64748b; }

.actions {
  gap: 6px;
}

.actions button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  background: white;
  border: 1px solid #e4e9dc;
  border-radius: 9px;
  cursor: pointer;
}

.actions button svg,
.export-button svg {
  width: 16px;
  height: 16px;
}

.actions button:hover {
  background: #f1f6e7;
  transform: translateY(-1px);
}

.actions .delete-button:hover {
  background: #fff0f0;
}

.empty-state {
  padding: 50px !important;
  text-align: center;
}

.empty-content {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.empty-content > span {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: #f0f5e5;
  border-radius: 14px;
  color: #6a9a2a;
}

.empty-content strong {
  margin-top: 10px;
  color: #111827;
}

.empty-content p {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.pagination {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 15px;
  padding: 16px 20px;
  border-top: 1px solid #edf0e8;
}

.pagination > button,
.page-numbers button {
  height: 38px;
  padding: 0 13px;
  background: white;
  border: 1px solid #e1e7d9;
  border-radius: 9px;
  color: #4a0a0a;
  font-weight: 700;
  cursor: pointer;
}

.pagination > button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.pagination > span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.page-numbers {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.page-numbers button {
  width: 38px;
  padding: 0;
}

.page-numbers button.active {
  background: #6a9a2a;
  border-color: #6a9a2a;
  color: white;
}

@media (max-width: 700px) {
  .table-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .pagination {
    grid-template-columns: 1fr 1fr;
  }

  .page-numbers {
    display: none;
  }
}
</style>
