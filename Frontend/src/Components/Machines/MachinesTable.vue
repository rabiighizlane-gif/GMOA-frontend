<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.count(machines.length) }}</p>
      </div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button v-if="column.sortable" type="button" @click="toggleSort(column.key)">
                {{ column.label }} <span>{{ sortIcon(column.key) }}</span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="machine in paginatedMachines" :key="machine.id" :class="{ critical: machine.criticality === 'Critique' }">
            <td class="id-cell">{{ machine.id }}</td>
            <td>
              <div class="machine-cell">
                <img class="machine-photo" :src="machine.imageUrl || fallbackImage" :alt="displayMachineName(machine.name)" />
                <div><strong>{{ displayMachineName(machine.name) }}</strong><small>{{ displayCategory(machine.category) }}</small></div>
              </div>
            </td>
            <td>{{ displayLine(machine.line) }}</td>
            <td><span class="category-badge">{{ displayCategory(machine.category) }}</span></td>
            <td><MachineStatusBadge :status="machine.status" /></td>
            <td><MachineCriticalityBadge :criticality="machine.criticality" /></td>
            <td>{{ machine.lastMaintenance }}</td>
            <td>{{ displayDateText(machine.nextMaintenance) }}</td>
            <td><AvailabilityProgressBar :value="machine.availability" /></td>
            <td>
              <div class="actions">
                <button type="button" :title="content.view" @click="$emit('view', machine)">&#8981;</button>
                <div class="menu-wrap">
                  <button type="button" :title="content.more" @click="toggleMenu(machine.id)">...</button>
                  <div v-if="openMenuId === machine.id" class="action-menu">
                    <button type="button" @click="selectAction('edit', machine)">{{ content.edit }}</button>
                    <button type="button" @click="selectAction('intervention', machine)">{{ content.intervention }}</button>
                    <button type="button" @click="selectAction('plan', machine)">{{ content.plan }}</button>
                    <button type="button" @click="selectAction('breakdown', machine)">{{ content.breakdown }}</button>
                    <button type="button" @click="selectAction('history', machine)">{{ content.history }}</button>
                    <button type="button" class="danger" @click="selectAction('delete', machine)">{{ content.delete }}</button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedMachines.length === 0">
            <td colspan="10" class="empty-state">
              <strong>{{ content.emptyTitle }}</strong>
              <p>{{ content.emptyText }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer v-if="machines.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">&lt; {{ content.previous }}</button>
      <div class="page-numbers">
        <button v-for="page in totalPages" :key="page" type="button" :class="{ active: currentPage === page }" @click="currentPage = page">{{ page }}</button>
      </div>
      <span>{{ startItem }}-{{ endItem }} {{ content.of }} {{ machines.length }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">{{ content.next }} &gt;</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AvailabilityProgressBar from '@/Components/Machines/AvailabilityProgressBar.vue'
import MachineCriticalityBadge from '@/Components/Machines/MachineCriticalityBadge.vue'
import MachineStatusBadge from '@/Components/Machines/MachineStatusBadge.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  machines: { type: Array, default: () => [] },
  content: { type: Object, required: true },
})
const emit = defineEmits(['view', 'edit', 'intervention', 'plan', 'breakdown', 'history', 'delete'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const fallbackImage = '/documents/machines/common/photo-zone-machine.svg'

const translatedValues = {
  EN: {
    categories: {
      Mecanique: 'Mechanical',
      Hydraulique: 'Hydraulic',
      Conditionnement: 'Packaging',
      Pneumatique: 'Pneumatic',
      Electrique: 'Electrical',
    },
    lines: {
      'Ligne Production 1': 'Production Line 1',
      'Ligne Production 2': 'Production Line 2',
      'Ligne Conditionnement': 'Packaging Line',
      'Ligne Utilites': 'Utilities Line',
    },
    dates: {
      "Aujourd'hui": 'Today',
      'En retard de 2 jours': '2 days overdue',
    },
    names: {
      "Tour d'usinage": 'Machining lathe',
      'Presse hydraulique': 'Hydraulic press',
      'Convoyeur a bande': 'Belt conveyor',
      "Compresseur d'air": 'Air compressor',
      'Etiqueteuse automatique': 'Automatic labeler',
    },
  },
  AR: {
    categories: {
      Mecanique: '\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a\u0629',
      Hydraulique: '\u0647\u064a\u062f\u0631\u0648\u0644\u064a\u0643\u064a\u0629',
      Conditionnement: '\u0627\u0644\u062a\u0639\u0628\u0626\u0629',
      Pneumatique: '\u0647\u0648\u0627\u0626\u064a\u0629',
      Electrique: '\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629',
    },
    lines: {
      'Ligne Production 1': '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c 1',
      'Ligne Production 2': '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c 2',
      'Ligne Conditionnement': '\u062e\u0637 \u0627\u0644\u062a\u0639\u0628\u0626\u0629',
      'Ligne Utilites': '\u062e\u0637 \u0627\u0644\u0645\u0631\u0627\u0641\u0642',
    },
    dates: {
      "Aujourd'hui": '\u0627\u0644\u064a\u0648\u0645',
      'En retard de 2 jours': '\u0645\u062a\u0623\u062e\u0631\u0629 \u0628\u064a\u0648\u0645\u064a\u0646',
    },
    names: {
      "Tour d'usinage": '\u0645\u062e\u0631\u0637\u0629 \u062a\u0635\u0646\u064a\u0639',
      'Presse hydraulique': '\u0645\u0643\u0628\u0633 \u0647\u064a\u062f\u0631\u0648\u0644\u064a\u0643\u064a',
      'Convoyeur a bande': '\u0646\u0627\u0642\u0644 \u0628\u0627\u0644\u062d\u0632\u0627\u0645',
      "Compresseur d'air": '\u0636\u0627\u063a\u0637 \u0647\u0648\u0627\u0621',
      'Etiqueteuse automatique': '\u0622\u0644\u0629 \u0648\u0633\u0645 \u0623\u0648\u062a\u0648\u0645\u0627\u062a\u064a\u0643\u064a\u0629',
    },
  },
}

const columns = computed(() => [
  { key: 'id', label: props.content.columns.id, sortable: true },
  { key: 'name', label: props.content.columns.name, sortable: true },
  { key: 'line', label: props.content.columns.line, sortable: true },
  { key: 'category', label: props.content.columns.category, sortable: true },
  { key: 'status', label: props.content.columns.status, sortable: true },
  { key: 'criticality', label: props.content.columns.criticality, sortable: true },
  { key: 'lastMaintenance', label: props.content.columns.lastMaintenance, sortable: true },
  { key: 'nextMaintenance', label: props.content.columns.nextMaintenance, sortable: true },
  { key: 'availability', label: props.content.columns.availability, sortable: true },
  { key: 'actions', label: props.content.columns.actions, sortable: false },
])
const currentPage = ref(1)
const itemsPerPage = 4
const sortKey = ref('id')
const sortDirection = ref('asc')
const openMenuId = ref('')
const sortedMachines = computed(() => [...props.machines].sort((a, b) => {
  const direction = sortDirection.value === 'asc' ? 1 : -1
  const first = a[sortKey.value]
  const second = b[sortKey.value]
  if (typeof first === 'number' && typeof second === 'number') return (first - second) * direction
  return String(first).localeCompare(String(second), 'fr') * direction
}))
const totalPages = computed(() => Math.max(1, Math.ceil(sortedMachines.value.length / itemsPerPage)))
const paginatedMachines = computed(() => sortedMachines.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const startItem = computed(() => (props.machines.length ? (currentPage.value - 1) * itemsPerPage + 1 : 0))
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, props.machines.length))
watch(() => props.machines.map((machine) => machine.id).join('|'), () => { currentPage.value = 1 })
function toggleSort(key) { if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'; else { sortKey.value = key; sortDirection.value = 'asc' } }
function sortIcon(key) { if (sortKey.value !== key) return '<>'; return sortDirection.value === 'asc' ? '^' : 'v' }
function previousPage() { if (currentPage.value > 1) currentPage.value -= 1 }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value += 1 }
function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? '' : id }
function selectAction(action, machine) { openMenuId.value = ''; emit(action, machine) }
function displayCategory(category) { return translatedValues[language.value]?.categories?.[category] || category }
function displayLine(line) { return translatedValues[language.value]?.lines?.[line] || line }
function displayDateText(value) { return translatedValues[language.value]?.dates?.[value] || value }
function displayMachineName(name) { return translatedValues[language.value]?.names?.[name] || name }
</script>

<style scoped>
.table-card { overflow: visible; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.table-header { padding: 20px 22px; border-bottom: 1px solid #edf0e8; }
.table-header h2 { margin: 0; color: #111827; font-size: 17px; }
.table-header p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 1380px; border-collapse: collapse; }
thead { background: #fafbf7; }
th, td { padding: 14px 15px; border-top: 1px solid #edf0e8; text-align: left; vertical-align: middle; }
[dir='rtl'] th, [dir='rtl'] td { text-align: right; }
th { border-top: 0; color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; }
th button { padding: 0; background: transparent; border: 0; color: inherit; font: inherit; cursor: pointer; }
td { color: #4a0a0a; font-size: 12px; }
tbody tr { transition: 0.2s ease; }
tbody tr:hover { background: #fbfcf8; }
tbody tr.critical { box-shadow: inset 4px 0 #e31e24; }
.id-cell { font-weight: 900; }
.machine-cell { display: flex; align-items: center; gap: 10px; }
.machine-cell strong, .machine-cell small { display: block; }
.machine-cell strong { color: #111827; }
.machine-cell small { margin-top: 4px; color: #94a3b8; font-size: 10px; }
.machine-photo { width: 46px; height: 46px; flex: 0 0 46px; object-fit: cover; background: #f0f5e5; border: 1px solid #e4e9dc; border-radius: 10px; }
.category-badge { display: inline-flex; padding: 7px 10px; background: #f0f5e5; border-radius: 999px; color: #6a9a2a; font-size: 10px; font-weight: 900; }
.actions { display: flex; gap: 6px; position: relative; }
.actions button { display: grid; min-width: 34px; height: 34px; place-items: center; background: white; border: 1px solid #e4e9dc; border-radius: 9px; color: #4a0a0a; cursor: pointer; transition: 0.2s ease; }
.actions button:hover { background: #f1f6e7; transform: translateY(-1px); }
.menu-wrap { position: relative; }
.action-menu { position: absolute; right: 0; top: 40px; z-index: 20; display: grid; min-width: 220px; padding: 8px; background: white; border: 1px solid #edf0e8; border-radius: 14px; box-shadow: 0 18px 45px rgba(74, 10, 10, 0.14); }
[dir='rtl'] .action-menu { right: auto; left: 0; }
.action-menu button { display: block; width: 100%; height: auto; min-height: 34px; padding: 8px 10px; border: 0; text-align: left; }
[dir='rtl'] .action-menu button { text-align: right; }
.action-menu .danger { color: #e31e24; }
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
@media (max-width: 700px) { .pagination { grid-template-columns: 1fr 1fr; } .page-numbers { display: none; } }
</style>
