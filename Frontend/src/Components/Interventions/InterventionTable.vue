<template>
  <section class="intervention-table-card">
    <header>
      <div>
        <h2>Liste des interventions</h2>
        <p>{{ rows.length }} interventions trouvées</p>
      </div>
      <div class="pagination-mini">Page {{ currentPage }} / {{ totalPages }}</div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button type="button" @click="sortBy(column.key)">
                {{ column.label }}
                <span>{{ sort.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedRows" :key="item.id">
            <td><strong class="row-id">{{ item.id }}</strong></td>
            <td>{{ item.machine }}</td>
            <td>{{ item.line }}</td>
            <td>{{ item.type }}</td>
            <td><span class="badge priority" :class="priorityTone(item.priority)">{{ item.priority }}</span></td>
            <td>
              <div class="technician-cell">
                <span class="avatar" :style="{ background: item.technician.color }">{{ item.technician.initials }}</span>
                <span>{{ item.technician.name }}</span>
              </div>
            </td>
            <td>{{ item.start }}</td>
            <td>{{ item.end }}</td>
            <td><span class="badge status" :class="statusTone(item.status)">{{ item.status }}</span></td>
            <td>
              <div class="actions">
                <button type="button" title="Voir" @click="$emit('view', item)">
                  <InterventionIcon name="eye" />
                </button>
                <button v-if="canManage" type="button" title="Modifier">
                  <InterventionIcon name="edit" />
                </button>
                <button v-if="canManage" type="button" title="Plus">
                  <InterventionIcon name="more" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">Précédent</button>
      <span>{{ firstRow }}-{{ lastRow }} sur {{ rows.length }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="currentPage += 1">Suivant</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import InterventionIcon from './InterventionIcon.vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  canManage: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['view'])

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'machine', label: 'Machine' },
  { key: 'line', label: 'Ligne' },
  { key: 'type', label: 'Type' },
  { key: 'priority', label: 'Priorité' },
  { key: 'technicianName', label: 'Technicien' },
  { key: 'start', label: 'Début' },
  { key: 'end', label: 'Fin' },
  { key: 'status', label: 'Statut' },
  { key: 'actions', label: 'Actions' },
]

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
