<template>
  <section class="intervention-table-card">
    <header>
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.count(rows.length) }}</p>
      </div>
      <div class="pagination-mini">{{ content.page(currentPage, totalPages) }}</div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button type="button" @click="sortBy(column.key)">
                {{ column.label }}
                <span>{{ sortIcon(column.key) }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedRows" :key="item.id">
            <td><strong class="row-id">{{ item.id }}</strong></td>
            <td>{{ displayMachine(item.machine) }}</td>
            <td>{{ displayLine(item.line) }}</td>
            <td>{{ displayType(item.type) }}</td>
            <td><span class="badge priority" :class="priorityTone(item.priority)">{{ displayPriority(item.priority) }}</span></td>
            <td>
              <div class="technician-cell">
                <span class="avatar" :style="{ background: item.technician.color }">{{ item.technician.initials }}</span>
                <span>{{ displayTechnician(item.technician.name) }}</span>
              </div>
            </td>
            <td>{{ item.start }}</td>
            <td>{{ item.end }}</td>
            <td><span class="badge status" :class="statusTone(item.status)">{{ displayStatus(item.status) }}</span></td>
            <td>
              <div class="actions">
                <button type="button" :title="content.view" @click="$emit('view', item)">
                  <InterventionIcon name="eye" />
                </button>
                <button v-if="canManage" type="button" :title="content.edit">
                  <InterventionIcon name="edit" />
                </button>
                <button v-if="canManage" type="button" :title="content.more">
                  <InterventionIcon name="more" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">{{ content.previous }}</button>
      <span>{{ firstRow }}-{{ lastRow }} {{ content.of }} {{ rows.length }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="currentPage += 1">{{ content.next }}</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import InterventionIcon from './InterventionIcon.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  canManage: {
    type: Boolean,
    default: true,
  },
  content: {
    type: Object,
    required: true,
  },
})

defineEmits(['view'])

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const columns = computed(() => [
  { key: 'id', label: props.content.columns.id },
  { key: 'machine', label: props.content.columns.machine },
  { key: 'line', label: props.content.columns.line },
  { key: 'type', label: props.content.columns.type },
  { key: 'priority', label: props.content.columns.priority },
  { key: 'technicianName', label: props.content.columns.technicianName },
  { key: 'start', label: props.content.columns.start },
  { key: 'end', label: props.content.columns.end },
  { key: 'status', label: props.content.columns.status },
  { key: 'actions', label: props.content.columns.actions },
])

const displayValues = {
  EN: {
    statuses: { Terminee: 'Completed', 'En cours': 'In progress', 'En attente': 'Pending' },
    priorities: { Critique: 'Critical', Haute: 'High', Moyenne: 'Medium', Basse: 'Low' },
    types: { Corrective: 'Corrective', Preventive: 'Preventive', Amelioration: 'Improvement' },
    lines: { 'Ligne Production 1': 'Production Line 1', 'Ligne Production 2': 'Production Line 2', 'Ligne Conditionnement': 'Packaging Line', 'Ligne Utilites': 'Utilities Line' },
    machines: { 'Tour usinage M-102': 'Machining lathe M-102', 'Presse hydraulique M-215': 'Hydraulic press M-215', 'Convoyeur a bande M-309': 'Belt conveyor M-309', "Compresseur d'air M-412": 'Air compressor M-412', 'Etiqueteuse E-330': 'Labeler E-330', 'Pompe CIP P-101': 'CIP pump P-101', 'Pasteurisateur P-204': 'Pasteurizer P-204', 'Remplisseuse R-118': 'Filling machine R-118' },
    technicians: { 'Nabil Amrani': 'Nabil Amrani', 'Ahmed El Mansouri': 'Ahmed El Mansouri', 'Youssef Berrada': 'Youssef Berrada', 'Sara El Idrissi': 'Sara El Idrissi', 'Karim El Fassi': 'Karim El Fassi' },
  },
  AR: {
    statuses: { Terminee: '\u0645\u0643\u062a\u0645\u0644\u0629', 'En cours': '\u0642\u064a\u062f \u0627\u0644\u062a\u0646\u0641\u064a\u0630', 'En attente': '\u0641\u064a \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631' },
    priorities: { Critique: '\u062d\u0631\u062c\u0629', Haute: '\u0639\u0627\u0644\u064a\u0629', Moyenne: '\u0645\u062a\u0648\u0633\u0637\u0629', Basse: '\u0645\u0646\u062e\u0641\u0636\u0629' },
    types: { Corrective: '\u062a\u0635\u062d\u064a\u062d\u064a', Preventive: '\u0648\u0642\u0627\u0626\u064a', Amelioration: '\u062a\u062d\u0633\u064a\u0646' },
    lines: { 'Ligne Production 1': '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c 1', 'Ligne Production 2': '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c 2', 'Ligne Conditionnement': '\u062e\u0637 \u0627\u0644\u062a\u0639\u0628\u0626\u0629', 'Ligne Utilites': '\u062e\u0637 \u0627\u0644\u0645\u0631\u0627\u0641\u0642' },
    machines: { 'Tour usinage M-102': '\u0645\u062e\u0631\u0637\u0629 \u062a\u0635\u0646\u064a\u0639 M-102', 'Presse hydraulique M-215': '\u0645\u0643\u0628\u0633 \u0647\u064a\u062f\u0631\u0648\u0644\u064a\u0643\u064a M-215', 'Convoyeur a bande M-309': '\u0646\u0627\u0642\u0644 \u0628\u0627\u0644\u062d\u0632\u0627\u0645 M-309', "Compresseur d'air M-412": '\u0636\u0627\u063a\u0637 \u0647\u0648\u0627\u0621 M-412', 'Etiqueteuse E-330': '\u0622\u0644\u0629 \u0648\u0633\u0645 E-330', 'Pompe CIP P-101': '\u0645\u0636\u062e\u0629 CIP P-101', 'Pasteurisateur P-204': '\u0628\u0633\u062a\u0631\u0629 P-204', 'Remplisseuse R-118': '\u0622\u0644\u0629 \u062a\u0639\u0628\u0626\u0629 R-118' },
    technicians: { 'Nabil Amrani': '\u0646\u0628\u064a\u0644 \u0627\u0644\u0639\u0645\u0631\u0627\u0646\u064a', 'Ahmed El Mansouri': '\u0623\u062d\u0645\u062f \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u064a', 'Youssef Berrada': '\u064a\u0648\u0633\u0641 \u0628\u0631\u0627\u062f\u0629', 'Sara El Idrissi': '\u0633\u0627\u0631\u0629 \u0627\u0644\u0625\u062f\u0631\u064a\u0633\u064a', 'Karim El Fassi': '\u0643\u0631\u064a\u0645 \u0627\u0644\u0641\u0627\u0633\u064a' },
  },
}

const pageSize = 6
const currentPage = ref(1)
const sort = ref({ key: 'id', direction: 'asc' })

const sortedRows = computed(() => {
  const rows = [...props.rows]
  const direction = sort.value.direction === 'asc' ? 1 : -1

  return rows.sort((a, b) => {
    if (sort.value.key === 'actions') return 0
    const left = sortValue(a, sort.value.key)
    const right = sortValue(b, sort.value.key)
    return String(left).localeCompare(String(right), 'fr', { numeric: true }) * direction
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize)))
const firstRow = computed(() => (sortedRows.value.length ? (currentPage.value - 1) * pageSize + 1 : 0))
const lastRow = computed(() => Math.min(currentPage.value * pageSize, sortedRows.value.length))
const paginatedRows = computed(() => sortedRows.value.slice(firstRow.value - 1, lastRow.value))

watch(
  () => props.rows.length,
  () => {
    currentPage.value = 1
  },
)

function sortBy(key) {
  if (key === 'actions') return
  sort.value = {
    key,
    direction: sort.value.key === key && sort.value.direction === 'asc' ? 'desc' : 'asc',
  }
}

function sortIcon(key) {
  if (key === 'actions') return ''
  if (sort.value.key !== key) return '\u2195'
  return sort.value.direction === 'asc' ? '\u2191' : '\u2193'
}

function sortValue(row, key) {
  if (key === 'technicianName') return row.technician.name
  return row[key]
}

function statusTone(status) {
  if (status === 'En cours') return 'in-progress'
  if (status === 'En attente') return 'pending'
  return 'done'
}

function priorityTone(priority) {
  if (priority === 'Critique') return 'critical'
  if (priority === 'Haute') return 'warning'
  if (priority === 'Moyenne') return 'attention'
  return 'low'
}

function displayStatus(status) { return displayValues[language.value]?.statuses?.[status] || status }
function displayPriority(priority) { return displayValues[language.value]?.priorities?.[priority] || priority }
function displayType(type) { return displayValues[language.value]?.types?.[type] || type }
function displayLine(line) { return displayValues[language.value]?.lines?.[line] || line }
function displayMachine(machine) { return displayValues[language.value]?.machines?.[machine] || machine }
function displayTechnician(name) { return displayValues[language.value]?.technicians?.[name] || name }
</script>

<style scoped>
.intervention-table-card {
  overflow: hidden;
  border: 1px solid var(--sc-border);
  border-radius: 20px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
}

header,
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
}

header {
  border-bottom: 1px solid var(--sc-border);
}

h2,
p {
  margin: 0;
}

h2 {
  color: var(--sc-dark);
  font-size: 20px;
  font-weight: 950;
}

p,
.pagination-mini,
footer span {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 850;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 18px;
  border-bottom: 1px solid var(--sc-border);
  text-align: left;
}

[dir='rtl'] th,
[dir='rtl'] td {
  text-align: right;
}

th {
  background: rgba(247, 249, 243, 0.74);
}

th button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

td {
  color: var(--sc-dark);
  font-size: 13px;
  font-weight: 820;
}

tbody tr {
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

tbody tr:hover {
  background: rgba(247, 249, 243, 0.86);
  transform: translateX(3px);
}

.row-id {
  font-weight: 950;
}

.badge {
  display: inline-flex;
  align-items: center;
  min-height: 27px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 950;
}

.priority.critical,
.status.pending {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.priority.warning {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.priority.attention {
  background: var(--sc-soft-attention);
  color: #8a6b00;
}

.priority.low,
.status.done {
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.status.in-progress {
  background: rgba(232, 179, 0, 0.18);
  color: var(--sc-attention);
}

.technician-cell {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.avatar {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 950;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.actions button,
footer button {
  border: 1px solid var(--sc-border);
  background: var(--sc-surface);
  color: var(--sc-dark);
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.actions button {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  font-size: 16px;
}

.actions button:hover,
footer button:hover:not(:disabled) {
  background: var(--sc-soft-primary);
  transform: translateY(-1px);
}

footer {
  border-top: 1px solid var(--sc-border);
}

footer button {
  min-height: 38px;
  border-radius: 12px;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 900;
}

footer button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  header,
  footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
