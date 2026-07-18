<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>Liste des demandes</h2>
        <p>{{ requests.length }} demande(s) affichée(s)</p>
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
          <tr
            v-for="request in paginatedRequests"
            :key="request.id"
            :class="{ critical: request.priority === 'Critique' }"
          >
            <td class="id-cell">{{ request.id }}</td>
            <td>{{ request.machine }}</td>
            <td>{{ request.line }}</td>
            <td>
              <div class="requester-cell">
                <span>{{ initials(request.requester) }}</span>
                {{ request.requester }}
              </div>
            </td>
            <td class="description-cell">{{ request.shortDescription }}</td>
            <td><PriorityBadge :priority="request.priority" /></td>
            <td>{{ request.createdAt }}</td>
            <td><span class="status-badge" :class="statusClass(request.status)">{{ request.status }}</span></td>
            <td>{{ request.interventionId || '—' }}</td>
            <td>
              <div class="actions">
                <button type="button" title="Voir" @click="$emit('view', request)">⌕</button>
                <button v-if="can('edit', request)" type="button" title="Modifier" @click="$emit('edit', request)">✎</button>
                <button v-if="can('accept', request)" type="button" title="Accepter" @click="$emit('validate', { action: 'accept', request })">✓</button>
                <button v-if="can('reject', request)" type="button" title="Refuser" @click="$emit('validate', { action: 'reject', request })">×</button>
                <button v-if="can('askInfo', request)" type="button" title="Demander des informations" @click="$emit('validate', { action: 'askInfo', request })">?</button>
                <button v-if="can('transform', request)" type="button" title="Transformer en intervention" @click="$emit('transform', request)">↗</button>
                <button v-if="can('delete', request)" type="button" title="Supprimer" class="delete-button" @click="$emit('delete', request)">⌫</button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedRequests.length === 0">
            <td colspan="10" class="empty-state">
              <strong>Aucune demande trouvée</strong>
              <p>Aucune demande ne correspond aux filtres sélectionnés.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="requests.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">← Précédent</button>
      <div class="page-numbers">
        <button v-for="page in totalPages" :key="page" type="button" :class="{ active: currentPage === page }" @click="currentPage = page">{{ page }}</button>
      </div>
      <span>{{ startItem }}-{{ endItem }} sur {{ requests.length }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">Suivant →</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PriorityBadge from '@/Components/MaintenanceRequests/PriorityBadge.vue'

const props = defineProps({
  requests: { type: Array, default: () => [] },
  can: { type: Function, required: true }
})

defineEmits(['view', 'edit', 'validate', 'transform', 'delete'])

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'machine', label: 'Machine', sortable: true },
  { key: 'line', label: 'Ligne', sortable: true },
  { key: 'requester', label: 'Demandeur', sortable: true },
  { key: 'shortDescription', label: 'Description courte', sortable: true },
  { key: 'priority', label: 'Priorité', sortable: true },
  { key: 'createdAt', label: 'Date de création', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'interventionId', label: 'Intervention liée', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

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

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

function sortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
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
    accepted: status === 'Acceptée',
    rejected: status === 'Refusée',
    info: status === 'Informations demandées',
    intervention: status === 'Intervention créée'
  }
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

.table-wrapper { overflow-x: auto; }

table {
  width: 100%;
  min-width: 1380px;
  border-collapse: collapse;
}

thead { background: #fafbf7; }

th,
td {
  padding: 14px 15px;
  border-top: 1px solid #edf0e8;
  text-align: left;
  vertical-align: middle;
}

th {
  border-top: 0;
  color: #64748b;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

th button {
  padding: 0;
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

td {
  color: #4a0a0a;
  font-size: 12px;
}

tbody tr { transition: 0.2s ease; }
tbody tr:hover { background: #fbfcf8; }
tbody tr.critical { box-shadow: inset 4px 0 #e31e24; }

.id-cell { font-weight: 900; }
.description-cell { max-width: 230px; }

.requester-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
}

.requester-cell span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  background: #6a9a2a;
  border-radius: 50%;
  color: white;
  font-size: 10px;
}

.status-badge {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.draft { background: #f1f5f9; color: #64748b; }
.pending { background: #fff4cf; color: #ad7a00; }
.accepted { background: #e3f4df; color: #43852c; }
.rejected { background: #ffe2e2; color: #e31e24; }
.info { background: #fff0df; color: #ff6a00; }
.intervention { background: #edf5de; color: #6a9a2a; }

.actions {
  display: flex;
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
  color: #4a0a0a;
  cursor: pointer;
  transition: 0.2s ease;
}

.actions button:hover {
  background: #f1f6e7;
  transform: translateY(-1px);
}

.actions .delete-button:hover {
  background: #fff0f0;
  color: #e31e24;
}

.empty-state {
  padding: 50px !important;
  text-align: center;
}

.empty-state strong { color: #111827; }
.empty-state p { margin: 6px 0 0; color: #94a3b8; }

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
  font-weight: 800;
  cursor: pointer;
}

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
