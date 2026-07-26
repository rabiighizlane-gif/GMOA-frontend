<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.count(machines.length) }}</p>
      </div>
    </div>
    <div class="table-wrapper">
      <table :style="{ minWidth: tableMinWidth }">
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
          <tr v-for="machine in paginatedMachines" :key="machine.id" :class="{ critical: isFieldEnabled('criticality') && machine.criticality === 'Critique' }">
            <td class="id-cell">{{ machine.id }}</td>
            <td>
              <div class="machine-cell">
                <img v-if="isFieldEnabled('image_url') && machine.imageUrl" class="machine-photo" :src="machine.imageUrl" :alt="displayMachineName(machine.name)" />
                <div><strong>{{ displayMachineName(machine.name) }}</strong><small dir="ltr">{{ machine.code || content.unavailableValue }}</small></div>
              </div>
            </td>
            <td>{{ displayLine(machine.line) }}</td>
            <td><span class="category-badge">{{ displayCategory(machine.periodicity) }}</span></td>
            <td v-if="isFieldEnabled('category')">{{ displayValue(machine.category) }}</td>
            <td><MachineStatusBadge :status="machine.status" /></td>
            <td v-if="isFieldEnabled('criticality')"><MachineCriticalityBadge :criticality="machine.criticality" /></td>
            <td v-if="isFieldEnabled('last_maintenance')">{{ displayValue(machine.lastMaintenance) }}</td>
            <td v-if="isFieldEnabled('next_maintenance')">{{ displayDateText(machine.nextMaintenance) }}</td>
            <td v-if="isFieldEnabled('availability')"><AvailabilityProgressBar :value="machine.availability" /></td>
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
            <td :colspan="columns.length" class="empty-state">
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

const props = defineProps({
  machines: { type: Array, default: () => [] },
  content: { type: Object, required: true },
  enabledOptionalFields: { type: Array, default: () => [] },
})
const emit = defineEmits(['view', 'edit', 'intervention', 'plan', 'breakdown', 'history', 'delete'])

const columns = computed(() => [
  { key: 'id', label: props.content.columns.id, sortable: true },
  { key: 'name', label: props.content.columns.name, sortable: true },
  { key: 'line', label: props.content.columns.line, sortable: true },
  { key: 'periodicity', label: props.content.columns.periodicity, sortable: true },
  ...optionalColumns.value.filter((column) => column.key === 'category'),
  { key: 'status', label: props.content.columns.status, sortable: true },
  ...optionalColumns.value.filter((column) => column.key !== 'category'),
  { key: 'actions', label: props.content.columns.actions, sortable: false },
])
const optionalColumns = computed(() => [
  { key: 'category', label: props.content.columns.category, sortable: true },
  { key: 'criticality', label: props.content.columns.criticality, sortable: true },
  { key: 'lastMaintenance', fieldKey: 'last_maintenance', label: props.content.columns.lastMaintenance, sortable: true },
  { key: 'nextMaintenance', fieldKey: 'next_maintenance', label: props.content.columns.nextMaintenance, sortable: true },
  { key: 'availability', label: props.content.columns.availability, sortable: true },
].filter((column) => isFieldEnabled(column.fieldKey || column.key)))
const tableMinWidth = computed(() => `${Math.max(980, columns.value.length * 132)}px`)
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
function displayCategory(category) { return category || props.content.unavailableValue }
function displayLine(line) { return line || props.content.unavailableValue }
function displayDateText(value) { return value || props.content.unavailableValue }
function displayMachineName(name) { return name || props.content.unavailableValue }
function displayValue(value) { return value ?? props.content.unavailableValue }
function isFieldEnabled(fieldKey) { return props.enabledOptionalFields.includes(fieldKey) }
</script>

<style scoped>
.table-card { overflow: visible; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24); }
.table-header { padding: 20px 22px; border-bottom: 1px solid rgba(116, 135, 158, 0.15); }
.table-header h2 { margin: 0; color: #f8fbff; font-size: 17px; }
.table-header p { margin: 5px 0 0; color: #8d9aab; font-size: 11px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead { background: rgba(43, 55, 68, 0.72); }
th, td { padding: 14px 15px; border-top: 1px solid rgba(116, 135, 158, 0.15); text-align: left; vertical-align: middle; }
[dir='rtl'] th, [dir='rtl'] td { text-align: right; }
th { border-top: 0; color: #aeb9c8; font-size: 10px; font-weight: 900; text-transform: uppercase; }
th button { padding: 0; background: transparent; border: 0; color: inherit; font: inherit; cursor: pointer; }
td { color: #f4f7fb; font-size: 12px; }
tbody tr { transition: 0.2s ease; }
tbody tr:hover { background: rgba(35, 49, 64, 0.92); }
tbody tr.critical { box-shadow: inset 4px 0 #e31e24; }
.id-cell { font-weight: 900; }
.machine-cell { display: flex; align-items: center; gap: 10px; min-height: 46px; }
.machine-cell strong, .machine-cell small { display: block; }
.machine-cell strong { color: #f8fbff; }
.machine-cell small { margin-top: 4px; color: #8d9aab; font-size: 10px; }
.machine-photo { width: 46px; height: 46px; flex: 0 0 46px; object-fit: cover; background: rgba(13, 21, 32, 0.72); border: 1px solid rgba(126, 146, 170, 0.22); border-radius: 8px; }
.category-badge { display: inline-flex; padding: 7px 10px; background: rgba(131, 185, 92, 0.18); border-radius: 999px; color: #bce39d; font-size: 10px; font-weight: 900; }
.actions { display: flex; gap: 6px; position: relative; }
.actions button { display: grid; min-width: 34px; height: 34px; place-items: center; background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); border-radius: 8px; color: #f2f6fb; cursor: pointer; transition: 0.2s ease; }
.actions button:hover { border-color: rgba(91, 155, 215, 0.72); color: #cfe9ff; transform: translateY(-1px); }
.menu-wrap { position: relative; }
.action-menu { position: absolute; right: 0; top: 40px; z-index: 20; display: grid; min-width: 220px; padding: 8px; background: #121c28; border: 1px solid rgba(126, 146, 170, 0.24); border-radius: 12px; box-shadow: 0 18px 45px rgba(0,0,0,.36); }
[dir='rtl'] .action-menu { right: auto; left: 0; }
.action-menu button { display: block; width: 100%; height: auto; min-height: 34px; padding: 8px 10px; border: 0; text-align: left; }
[dir='rtl'] .action-menu button { text-align: right; }
.action-menu .danger { color: #ff7f8e; }
.empty-state { padding: 50px !important; text-align: center; }
.empty-state strong { color: #f8fbff; }
.empty-state p { margin: 6px 0 0; color: #8d9aab; }
.pagination { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 15px; padding: 16px 20px; border-top: 1px solid rgba(116, 135, 158, 0.15); }
.pagination > button, .page-numbers button { height: 38px; padding: 0 13px; background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); border-radius: 8px; color: #f2f6fb; font-weight: 800; cursor: pointer; }
.pagination > button:disabled { cursor: not-allowed; opacity: 0.4; }
.page-numbers { display: flex; justify-content: center; gap: 5px; }
.page-numbers button { width: 38px; padding: 0; }
.page-numbers button.active { background: #5f8f2f; border-color: rgba(131, 185, 92, 0.44); color: white; }
.pagination > span { color: #8d9aab; font-size: 11px; font-weight: 800; }
:global(:root[data-theme='light']) .action-menu {
  background: #4a0a0a;
  border-color: rgba(74, 10, 10, 0.2);
  box-shadow: 0 18px 45px rgba(74, 10, 10, 0.24);
}

:global(:root[data-theme='light']) .action-menu button {
  background: #ffffff;
  color: #4a0a0a;
}

:global(:root[data-theme='light']) .action-menu button:hover {
  background: #f7f9f3;
  color: #6a9a2a;
}

:global(:root[data-theme='light']) .action-menu .danger {
  color: #e31e24;
}
@media (max-width: 700px) { .pagination { grid-template-columns: 1fr 1fr; } .page-numbers { display: none; } }
</style>
