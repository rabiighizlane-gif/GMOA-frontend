<template>
  <section class="table-card" :dir="pageDirection">
    <div class="table-header">
      <div>
        <h2>{{ t.title }}</h2>
        <p>{{ requests.length }} {{ t.displayed }}</p>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button v-if="column.sortable" type="button" @click="toggleSort(column.key)">
                {{ column.label }}
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="request in paginatedRequests" :key="request.id" :class="{ critical: request.priority === 'Critique' }">
            <td class="id-cell" dir="ltr">{{ request.id }}</td>
            <td>{{ translate('machines', request.machine) }}</td>
            <td>{{ translate('lines', request.line) }}</td>
            <td>
              <div class="requester-cell">
                <span>{{ initials(request.requester) }}</span>
                {{ translate('names', request.requester) }}
              </div>
            </td>
            <td class="description-cell">{{ translate('descriptions', request.shortDescription) }}</td>
            <td><PriorityBadge :priority="request.priority" /></td>
            <td dir="ltr">{{ request.createdAt }}</td>
            <td><span class="status-badge" :class="statusClass(request.status)">{{ translate('statuses', request.status) }}</span></td>
            <td dir="ltr">{{ request.interventionId || '-' }}</td>
            <td>
              <div class="actions">
                <button type="button" :title="t.view" @click="$emit('view', request)">{{ t.view }}</button>
                <button v-if="can('edit', request)" type="button" :title="t.edit" @click="$emit('edit', request)">{{ t.edit }}</button>
                <button v-if="can('accept', request)" type="button" :title="t.accept" @click="$emit('validate', { action: 'accept', request })">{{ t.accept }}</button>
                <button v-if="can('reject', request)" type="button" :title="t.reject" @click="$emit('validate', { action: 'reject', request })">{{ t.reject }}</button>
                <button v-if="can('askInfo', request)" type="button" :title="t.askInfo" @click="$emit('validate', { action: 'askInfo', request })">{{ t.askInfoShort }}</button>
                <button v-if="can('transform', request)" type="button" :title="t.transform" @click="$emit('transform', request)">{{ t.transformShort }}</button>
                <button v-if="can('delete', request)" type="button" :title="t.delete" class="delete-button" @click="$emit('delete', request)">{{ t.delete }}</button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedRequests.length === 0">
            <td colspan="10" class="empty-state">
              <strong>{{ t.emptyTitle }}</strong>
              <p>{{ t.emptyText }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="requests.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">{{ t.previous }}</button>
      <div class="page-numbers">
        <button v-for="page in totalPages" :key="page" type="button" :class="{ active: currentPage === page }" @click="currentPage = page">{{ page }}</button>
      </div>
      <span>{{ startItem }}-{{ endItem }} {{ t.of }} {{ requests.length }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">{{ t.next }}</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PriorityBadge from '@/Components/MaintenanceRequests/PriorityBadge.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  requests: { type: Array, default: () => [] },
  can: { type: Function, required: true },
})

defineEmits(['view', 'edit', 'validate', 'transform', 'delete'])

const languageStore = useLanguageStore()
const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const labels = {
  FR: {
    title: 'Liste des demandes',
    displayed: 'demande(s) affichee(s)',
    previous: 'Precedent',
    next: 'Suivant',
    of: 'sur',
    emptyTitle: 'Aucune demande trouvee',
    emptyText: 'Aucune demande ne correspond aux filtres selectionnes.',
    view: 'Voir',
    edit: 'Modifier',
    accept: 'Accepter',
    reject: 'Refuser',
    askInfo: 'Demander des informations',
    askInfoShort: 'Infos',
    transform: 'Transformer en intervention',
    transformShort: 'Transformer',
    delete: 'Supprimer',
    columns: ['ID', 'Machine', 'Ligne', 'Demandeur', 'Description courte', 'Priorite', 'Date de creation', 'Statut', 'Intervention liee', 'Actions'],
  },
  EN: {
    title: 'Request list',
    displayed: 'request(s) displayed',
    previous: 'Previous',
    next: 'Next',
    of: 'of',
    emptyTitle: 'No request found',
    emptyText: 'No request matches the selected filters.',
    view: 'View',
    edit: 'Edit',
    accept: 'Accept',
    reject: 'Reject',
    askInfo: 'Request information',
    askInfoShort: 'Info',
    transform: 'Convert to intervention',
    transformShort: 'Convert',
    delete: 'Delete',
    columns: ['ID', 'Machine', 'Line', 'Requester', 'Short description', 'Priority', 'Creation date', 'Status', 'Related intervention', 'Actions'],
  },
  AR: {
    title: 'لائحة الطلبات',
    displayed: 'طلب معروض',
    previous: 'السابق',
    next: 'التالي',
    of: 'من',
    emptyTitle: 'لم يتم العثور على أي طلب',
    emptyText: 'لا يوجد طلب مطابق للفلاتر المختارة.',
    view: 'عرض',
    edit: 'تعديل',
    accept: 'قبول',
    reject: 'رفض',
    askInfo: 'طلب معلومات',
    askInfoShort: 'طلب معلومات',
    transform: 'تحويل إلى تدخل',
    transformShort: 'تحويل',
    delete: 'حذف',
    columns: ['المعرف', 'الآلة', 'الخط', 'مقدم الطلب', 'وصف قصير', 'الأولوية', 'تاريخ الإنشاء', 'الحالة', 'التدخل المرتبط', 'الإجراءات'],
  },
}

const dictionaries = {
  FR: {
    machines: {},
    lines: {},
    names: {},
    descriptions: {},
    statuses: { Brouillon: 'Brouillon', 'En attente': 'En attente', Acceptee: 'Acceptee', Refusee: 'Refusee', 'Informations demandees': 'Informations demandees', 'Intervention creee': 'Intervention creee' },
  },
  EN: {
    machines: { 'Convoyeur M-309': 'Conveyor M-309', 'Pasteurisateur P-204': 'Pasteurizer P-204', 'Compresseur M-412': 'Compressor M-412', 'Remplisseuse R-118': 'Filling machine R-118', "Tour d'usinage M-102": 'Machining lathe M-102' },
    lines: { 'Ligne Conditionnement': 'Packaging line', 'Ligne Production 1': 'Production line 1', 'Ligne Utilites': 'Utilities line' },
    names: {},
    descriptions: { 'Bruit anormal au niveau du moteur': 'Abnormal noise around the motor', 'Temperature instable pendant le cycle': 'Unstable temperature during the cycle', "Fuite d'air importante": 'Major air leak', 'Vibrations inhabituelles': 'Unusual vibrations', 'Informations a completer sur le capteur': 'Sensor information to complete' },
    statuses: { Brouillon: 'Draft', 'En attente': 'Pending', Acceptee: 'Accepted', Refusee: 'Rejected', 'Informations demandees': 'Information requested', 'Intervention creee': 'Intervention created' },
  },
  AR: {
    machines: { 'Convoyeur M-309': 'ناقل M-309', 'Pasteurisateur P-204': 'مبستر P-204', 'Compresseur M-412': 'ضاغط M-412', 'Remplisseuse R-118': 'آلة تعبئة R-118', "Tour d'usinage M-102": 'مخرطة تصنيع M-102' },
    lines: { 'Ligne Conditionnement': 'خط التكييف', 'Ligne Production 1': 'خط الإنتاج 1', 'Ligne Utilites': 'خط المرافق' },
    names: { 'Ahmed El Mansouri': 'أحمد المنصوري', 'Sara El Idrissi': 'سارة الإدريسي', 'Youssef Berrada': 'يوسف برادة', 'Nabil Amrani': 'نبيل العمراني', 'Karim El Fassi': 'كريم الفاسي' },
    descriptions: { 'Bruit anormal au niveau du moteur': 'ضجيج غير عادي قرب المحرك', 'Temperature instable pendant le cycle': 'حرارة غير مستقرة أثناء الدورة', "Fuite d'air importante": 'تسرب هواء كبير', 'Vibrations inhabituelles': 'اهتزازات غير عادية', 'Informations a completer sur le capteur': 'معلومات يجب إكمالها حول الحساس' },
    statuses: { Brouillon: 'مسودة', 'En attente': 'في الانتظار', Acceptee: 'مقبولة', Refusee: 'مرفوضة', 'Informations demandees': 'معلومات مطلوبة', 'Intervention creee': 'تم إنشاء تدخل' },
  },
}

const columnKeys = ['id', 'machine', 'line', 'requester', 'shortDescription', 'priority', 'createdAt', 'status', 'interventionId', 'actions']
const sortable = new Set(columnKeys.filter((key) => key !== 'actions'))
const t = computed(() => labels[languageStore.language] || labels.FR)
const dictionary = computed(() => dictionaries[languageStore.language] || dictionaries.FR)

const columns = computed(() => columnKeys.map((key, index) => ({ key, label: t.value.columns[index], sortable: sortable.has(key) })))

const currentPage = ref(1)
const itemsPerPage = 4
const sortKey = ref('createdAt')
const sortDirection = ref('desc')

const sortedRequests = computed(() => [...props.requests].sort((a, b) => {
  const direction = sortDirection.value === 'asc' ? 1 : -1
  return String(a[sortKey.value] || '').localeCompare(String(b[sortKey.value] || ''), 'fr') * direction
}))

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRequests.value.length / itemsPerPage)))
const paginatedRequests = computed(() => sortedRequests.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const startItem = computed(() => (props.requests.length ? (currentPage.value - 1) * itemsPerPage + 1 : 0))
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, props.requests.length))

watch(() => props.requests.map((request) => request.id).join('|'), () => {
  currentPage.value = 1
})

function translate(group, value) {
  return dictionary.value[group]?.[value] || value
}

function toggleSort(key) {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

function previousPage() {
  if (currentPage.value > 1) currentPage.value -= 1
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

function initials(name) {
  return name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
}

function statusClass(status) {
  return {
    draft: status === 'Brouillon',
    pending: status === 'En attente',
    accepted: status === 'Acceptee',
    rejected: status === 'Refusee',
    info: status === 'Informations demandees',
    intervention: status === 'Intervention creee',
  }
}
</script>

<style scoped>
.table-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.table-header { padding: 20px 22px; border-bottom: 1px solid #edf0e8; }
.table-header h2 { margin: 0; color: #111827; font-size: 17px; letter-spacing: 0; }
.table-header p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 1380px; border-collapse: collapse; }
thead { background: #fafbf7; }
th, td { padding: 14px 15px; border-top: 1px solid #edf0e8; text-align: start; vertical-align: middle; }
th { border-top: 0; color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; }
th button { padding: 0; background: transparent; border: 0; color: inherit; font: inherit; cursor: pointer; }
td { color: #4a0a0a; font-size: 12px; }
tbody tr { transition: 0.2s ease; }
tbody tr:hover { background: #fbfcf8; }
tbody tr.critical { box-shadow: inset 4px 0 #e31e24; }
.id-cell { font-weight: 900; }
.description-cell { max-width: 230px; }
.requester-cell { display: flex; align-items: center; gap: 8px; font-weight: 800; }
.requester-cell span { display: grid; width: 32px; height: 32px; place-items: center; background: #6a9a2a; border-radius: 50%; color: white; font-size: 10px; }
.status-badge { display: inline-flex; padding: 7px 10px; border-radius: 999px; font-size: 10px; font-weight: 900; white-space: nowrap; }
.draft { background: #f1f5f9; color: #64748b; }
.pending { background: #fff4cf; color: #ad7a00; }
.accepted { background: #e3f4df; color: #43852c; }
.rejected { background: #ffe2e2; color: #e31e24; }
.info { background: #fff0df; color: #ff6a00; }
.intervention { background: #edf5de; color: #6a9a2a; }
.actions { display: flex; flex-wrap: wrap; gap: 6px; }
.actions button { display: grid; min-width: 64px; height: 34px; padding: 0 9px; place-items: center; background: white; border: 1px solid #e4e9dc; border-radius: 9px; color: #4a0a0a; font-size: 10px; font-weight: 900; cursor: pointer; transition: 0.2s ease; }
.actions button:hover { background: #f1f6e7; transform: translateY(-1px); }
.actions .delete-button:hover { background: #fff0f0; color: #e31e24; }
.empty-state { padding: 50px !important; text-align: center; }
.empty-state strong { color: #111827; }
.empty-state p { margin: 6px 0 0; color: #94a3b8; }
.pagination { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 15px; padding: 16px 20px; border-top: 1px solid #edf0e8; }
.pagination > button, .page-numbers button { height: 38px; padding: 0 13px; background: white; border: 1px solid #e1e7d9; border-radius: 9px; color: #4a0a0a; font-weight: 800; cursor: pointer; }
.pagination > button:disabled { cursor: not-allowed; opacity: 0.4; }
.page-numbers { display: flex; justify-content: center; gap: 5px; }
.page-numbers button { width: 38px; padding: 0; }
.page-numbers button.active { background: #6a9a2a; border-color: #6a9a2a; color: white; }
.pagination > span { color: #64748b; font-size: 11px; font-weight: 800; }
@media (max-width: 700px) {
  .pagination { grid-template-columns: 1fr 1fr; }
  .page-numbers { display: none; }
}
</style>
