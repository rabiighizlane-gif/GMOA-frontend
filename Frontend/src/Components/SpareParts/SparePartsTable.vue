<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>Inventaire des pièces</h2>
        <p>{{ parts.length }} pièce(s) affichée(s)</p>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button
                v-if="column.sortable"
                type="button"
                @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <span>{{ sortIcon(column.key) }}</span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="part in paginatedParts" :key="part.reference">
            <td class="reference-cell">{{ part.reference }}</td>
            <td>
              <div class="part-cell">
                <span class="category-icon">{{ categoryIcon(part.category) }}</span>
                <div>
                  <strong>{{ part.name }}</strong>
                  <small>{{ part.unit }}</small>
                </div>
              </div>
            </td>
            <td><span class="category-badge">{{ part.category }}</span></td>
            <td>{{ part.machine }}</td>
            <td>
              <StockProgressBar
                :current-stock="part.currentStock"
                :minimum-stock="part.minimumStock"
                :maximum-stock="part.maximumStock"
              />
            </td>
            <td>{{ part.minimumStock }}</td>
            <td>{{ part.location }}</td>
            <td>{{ part.supplier }}</td>
            <td>{{ part.unitPrice }} DH</td>
            <td>
              <span class="status-badge" :class="statusClass(part.status)">
                {{ part.status }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button type="button" title="Voir" @click="$emit('view', part)">⌕</button>
                <button type="button" title="Modifier" @click="$emit('edit', part)">✎</button>
                <button type="button" title="Ajuster le stock" @click="$emit('adjust', part)">±</button>
                <button type="button" title="Supprimer" class="delete-button" @click="$emit('delete', part)">⌫</button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedParts.length === 0">
            <td colspan="11" class="empty-state">
              <strong>Aucune pièce trouvée</strong>
              <p>Aucune référence ne correspond aux filtres sélectionnés.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="parts.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">
        ← Précédent
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

      <span>{{ startItem }}-{{ endItem }} sur {{ parts.length }}</span>

      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">
        Suivant →
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import StockProgressBar from '@/Components/SpareParts/StockProgressBar.vue'

const props = defineProps({
  parts: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view', 'edit', 'adjust', 'delete'])

const columns = [
  { key: 'reference', label: 'Référence', sortable: true },
  { key: 'name', label: 'Pièce', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'machine', label: 'Machine compatible', sortable: true },
  { key: 'currentStock', label: 'Stock actuel', sortable: true },
  { key: 'minimumStock', label: 'Seuil minimum', sortable: true },
  { key: 'location', label: 'Emplacement', sortable: true },
  { key: 'supplier', label: 'Fournisseur', sortable: true },
  { key: 'unitPrice', label: 'Prix unitaire', sortable: true },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]

const currentPage = ref(1)
const itemsPerPage = 4
const sortKey = ref('reference')
const sortDirection = ref('asc')

const sortedParts = computed(() => {
  return [...props.parts].sort((first, second) => {
    const firstValue = first[sortKey.value]
    const secondValue = second[sortKey.value]
    const direction = sortDirection.value === 'asc' ? 1 : -1

    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
      return (firstValue - secondValue) * direction
    }

    return String(firstValue).localeCompare(String(secondValue), 'fr') * direction
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedParts.value.length / itemsPerPage)))

const paginatedParts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedParts.value.slice(start, start + itemsPerPage)
})

const startItem = computed(() => {
  if (props.parts.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * itemsPerPage + 1
})

const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, props.parts.length))

watch(
  () => props.parts.map((part) => part.reference).join('|'),
  () => {
    currentPage.value = 1
  }
)

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

const sortIcon = (key) => {
  if (sortKey.value !== key) {
    return '↕'
  }

  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const statusClass = (status) => ({
  'status-available': status === 'Disponible',
  'status-warning': status === 'Stock faible',
  'status-danger': status === 'Rupture'
})

const categoryIcon = (category) => {
  const icons = {
    Mécanique: '⚙',
    Électrique: '⌁',
    Pneumatique: '⇄',
    Hydraulique: '◈',
    Lubrification: '◒',
    Filtration: '▥',
    Transmission: '⛓'
  }

  return icons[category] || '▦'
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

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1320px;
  border-collapse: collapse;
}

thead {
  background: #fafbf7;
}

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
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

tbody tr {
  transition: 0.2s ease;
}

tbody tr:hover {
  background: #fbfcf8;
}

.reference-cell {
  font-weight: 900;
}

.part-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.part-cell strong,
.part-cell small {
  display: block;
}

.part-cell strong {
  color: #111827;
}

.part-cell small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 10px;
}

.category-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  place-items: center;
  background: #f0f5e5;
  border-radius: 10px;
  color: #6a9a2a;
  font-weight: 900;
}

.category-badge,
.status-badge {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.category-badge {
  background: #f0f5e5;
  color: #6a9a2a;
}

.status-available {
  background: #e3f4df;
  color: #43852c;
}

.status-warning {
  background: #fff0df;
  color: #ff6a00;
}

.status-danger {
  background: #ffe2e2;
  color: #e31e24;
}

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

.empty-state strong {
  color: #111827;
}

.empty-state p {
  margin: 6px 0 0;
  color: #94a3b8;
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
  font-weight: 800;
  cursor: pointer;
}

.pagination > button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
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

.pagination > span {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

@media (max-width: 700px) {
  .pagination {
    grid-template-columns: 1fr 1fr;
  }

  .page-numbers {
    display: none;
  }
}
</style>
