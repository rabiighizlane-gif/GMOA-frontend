<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>Parc machines</h2>
        <p>{{ machines.length }} machine(s) affichée(s)</p>
      </div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button v-if="column.sortable" type="button" @click="toggleSort(column.key)">{{ column.label }} <span>{{ sortIcon(column.key) }}</span></button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="machine in paginatedMachines" :key="machine.id" :class="{ critical: machine.criticality === 'Critique' }">
            <td class="id-cell">{{ machine.id }}</td>
            <td>
              <div class="machine-cell">
                <span class="machine-icon">▦</span>
                <div><strong>{{ machine.name }}</strong><small>{{ machine.category }}</small></div>
              </div>
            </td>
            <td>{{ machine.line }}</td>
            <td><span class="category-badge">{{ machine.category }}</span></td>
            <td><MachineStatusBadge :status="machine.status" /></td>
            <td><MachineCriticalityBadge :criticality="machine.criticality" /></td>
            <td>{{ machine.lastMaintenance }}</td>
            <td>{{ machine.nextMaintenance }}</td>
            <td><AvailabilityProgressBar :value="machine.availability" /></td>
            <td>
              <div class="actions">
                <button type="button" title="Voir" @click="$emit('view', machine)">⌕</button>
                <div class="menu-wrap">
                  <button type="button" title="Plus" @click="toggleMenu(machine.id)">⋯</button>
                  <div v-if="openMenuId === machine.id" class="action-menu">
                    <button type="button" @click="selectAction('edit', machine)">Modifier</button>
                    <button type="button" @click="selectAction('intervention', machine)">Créer une intervention</button>
                    <button type="button" @click="selectAction('plan', machine)">Planifier une maintenance</button>
                    <button type="button" @click="selectAction('breakdown', machine)">Déclarer une panne</button>
                    <button type="button" @click="selectAction('history', machine)">Voir l’historique</button>
                    <button type="button" class="danger" @click="selectAction('delete', machine)">Supprimer</button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedMachines.length === 0">
            <td colspan="10" class="empty-state"><strong>Aucune machine trouvée</strong><p>Aucune machine ne correspond aux filtres sélectionnés.</p></td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer v-if="machines.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">← Précédent</button>
      <div class="page-numbers"><button v-for="page in totalPages" :key="page" type="button" :class="{ active: currentPage === page }" @click="currentPage = page">{{ page }}</button></div>
      <span>{{ startItem }}-{{ endItem }} sur {{ machines.length }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">Suivant →</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AvailabilityProgressBar from '@/Components/Machines/AvailabilityProgressBar.vue'
import MachineCriticalityBadge from '@/Components/Machines/MachineCriticalityBadge.vue'
import MachineStatusBadge from '@/Components/Machines/MachineStatusBadge.vue'

const props = defineProps({ machines: { type: Array, default: () => [] } })
const emit = defineEmits(['view', 'edit', 'intervention', 'plan', 'breakdown', 'history', 'delete'])
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Machine', sortable: true },
  { key: 'line', label: 'Ligne de production', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'status', label: 'État', sortable: true },
  { key: 'criticality', label: 'Criticité', sortable: true },
  { key: 'lastMaintenance', label: 'Dernière maintenance', sortable: true },
  { key: 'nextMaintenance', label: 'Prochaine maintenance', sortable: true },
  { key: 'availability', label: 'Disponibilité', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]
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
function sortIcon(key) { if (sortKey.value !== key) return '↕'; return sortDirection.value === 'asc' ? '↑' : '↓' }
function previousPage() { if (currentPage.value > 1) currentPage.value -= 1 }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value += 1 }
function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? '' : id }
function selectAction(action, machine) { openMenuId.value = ''; emit(action, machine) }
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
.machine-icon { display: grid; width: 36px; height: 36px; place-items: center; background: #f0f5e5; border-radius: 10px; color: #6a9a2a; font-weight: 900; }
.category-badge { display: inline-flex; padding: 7px 10px; background: #f0f5e5; border-radius: 999px; color: #6a9a2a; font-size: 10px; font-weight: 900; }
.actions { display: flex; gap: 6px; position: relative; }
.actions button { display: grid; min-width: 34px; height: 34px; place-items: center; background: white; border: 1px solid #e4e9dc; border-radius: 9px; color: #4a0a0a; cursor: pointer; transition: 0.2s ease; }
.actions button:hover { background: #f1f6e7; transform: translateY(-1px); }
.menu-wrap { position: relative; }
.action-menu { position: absolute; right: 0; top: 40px; z-index: 20; display: grid; min-width: 220px; padding: 8px; background: white; border: 1px solid #edf0e8; border-radius: 14px; box-shadow: 0 18px 45px rgba(74, 10, 10, 0.14); }
.action-menu button { display: block; width: 100%; height: auto; min-height: 34px; padding: 8px 10px; border: 0; text-align: left; }
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
