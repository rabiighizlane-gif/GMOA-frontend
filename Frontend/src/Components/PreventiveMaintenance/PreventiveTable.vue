<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>Plans de maintenance préventive</h2>
        <p>{{ maintenances.length }} plan(s) affiché(s)</p>
      </div>

      <button
        class="export-button"
        type="button"
        @click="$emit('export')"
      >
        <PreventiveIcon name="download" />
        Exporter
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Plan</th>
            <th>Machine</th>
            <th>Fréquence</th>
            <th>Dernière réalisation</th>
            <th>Prochaine échéance</th>
            <th>Responsable</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="maintenance in paginatedMaintenances"
            :key="maintenance.id"
          >
            <td class="id-cell">
              {{ maintenance.id }}
            </td>

            <td>
              <div class="plan-cell">
                <span class="plan-icon">
                  <PreventiveIcon name="tool" />
                </span>

                <div>
                  <strong>{{ maintenance.plan }}</strong>
                  <small>{{ maintenance.line }}</small>
                </div>
              </div>
            </td>

            <td>
              <strong class="machine-name">
                {{ maintenance.machine }}
              </strong>
            </td>

            <td>
              <span class="frequency-badge">
                {{ maintenance.frequency }}
              </span>
            </td>

            <td>
              {{ maintenance.lastExecution }}
            </td>

            <td>
              <div class="deadline-cell">
                <strong>{{ maintenance.nextDueDate }}</strong>

                <small :class="`deadline-${maintenance.deadlineColor}`">
                  {{ maintenance.deadlineLabel }}
                </small>
              </div>
            </td>

            <td>
              <div class="technician-cell">
                <span class="avatar">
                  {{ maintenance.initials }}
                </span>

                <span>{{ maintenance.technician }}</span>
              </div>
            </td>

            <td>
              <span
                class="status-badge"
                :class="getStatusClass(maintenance.status)"
              >
                {{ maintenance.status }}
              </span>
            </td>

            <td>
              <div class="actions">
                <button
                  type="button"
                  title="Voir les détails"
                  @click="$emit('view', maintenance)"
                >
                  <PreventiveIcon name="eye" />
                </button>

                <button
                  type="button"
                  title="Modifier"
                  @click="$emit('edit', maintenance)"
                >
                  <PreventiveIcon name="edit" />
                </button>

                <button
                  v-if="maintenance.status !== 'Réalisée'"
                  type="button"
                  title="Marquer comme réalisée"
                  @click="$emit('complete', maintenance)"
                >
                  <PreventiveIcon name="check" />
                </button>

                <button
                  type="button"
                  title="Supprimer"
                  class="delete-button"
                  @click="$emit('delete', maintenance)"
                >
                  <PreventiveIcon name="trash" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedMaintenances.length === 0">
            <td
              colspan="9"
              class="empty-state"
            >
              <div class="empty-content">
                <span><PreventiveIcon name="search" /></span>
                <strong>Aucun plan trouvé</strong>
                <p>
                  Aucun plan de maintenance ne correspond aux filtres sélectionnés.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      v-if="maintenances.length > 0"
      class="pagination"
    >
      <button
        type="button"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
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

      <span>
        {{ startItem }}-{{ endItem }} sur {{ maintenances.length }}
      </span>

      <button
        type="button"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        Suivant →
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PreventiveIcon from '@/Components/PreventiveMaintenance/PreventiveIcon.vue'

const props = defineProps({
  maintenances: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'view',
  'edit',
  'complete',
  'delete',
  'export'
])

const currentPage = ref(1)
const itemsPerPage = 3

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(props.maintenances.length / itemsPerPage)
  )
})

const paginatedMaintenances = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return props.maintenances.slice(start, end)
})

const startItem = computed(() => {
  if (props.maintenances.length === 0) {
    return 0
  }

  return (currentPage.value - 1) * itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(
    currentPage.value * itemsPerPage,
    props.maintenances.length
  )
})

watch(
  () => props.maintenances.map((maintenance) => maintenance.id).join('|'),
  () => {
    currentPage.value = 1
  }
)

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

const getStatusClass = (status) => {
  const statusClasses = {
    Planifiée: 'status-planned',
    'À venir': 'status-upcoming',
    'En retard': 'status-late',
    Réalisée: 'status-completed',
    'En cours': 'status-progress'
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
  letter-spacing: 0.03em;
}

td {
  padding: 15px;
  color: #4a0a0a;
  border-top: 1px solid #edf0e8;
  font-size: 12px;
  vertical-align: middle;
}

tbody tr {
  transition: 0.2s ease;
}

tbody tr:hover {
  background: #fbfcf8;
}

.id-cell {
  color: #4a0a0a;
  font-weight: 900;
}

.plan-cell {
  display: flex;
  align-items: center;
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
  font-size: 17px;
}

.plan-cell strong,
.plan-cell small,
.deadline-cell strong,
.deadline-cell small {
  display: block;
}

.plan-cell strong {
  color: #111827;
  font-size: 12px;
}

.plan-cell small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 9px;
}

.machine-name {
  color: #4a0a0a;
  font-size: 12px;
}

.frequency-badge {
  display: inline-flex;
  padding: 6px 9px;
  background: #f0f5e5;
  border-radius: 999px;
  color: #6a9a2a;
  font-size: 10px;
  font-weight: 800;
}

.deadline-cell small {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 700;
}

.deadline-green {
  color: #6a9a2a;
}

.deadline-yellow {
  color: #b88700;
}

.deadline-orange {
  color: #ff6a00;
}

.deadline-red {
  color: #e31e24;
}

.technician-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

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
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.status-planned {
  background: #e9f3db;
  color: #5f8c23;
}

.status-upcoming {
  background: #fff4cf;
  color: #ad7a00;
}

.status-late {
  background: #ffe2e2;
  color: #d51c22;
}

.status-completed {
  background: #e3f4df;
  color: #43852c;
}

.status-progress {
  background: #fff0df;
  color: #ff6a00;
}

.status-default {
  background: #f1f5f9;
  color: #64748b;
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
  cursor: pointer;
  transition: 0.2s ease;
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
  font-size: 22px;
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
