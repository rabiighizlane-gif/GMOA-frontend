<template>
  <section class="light-intervention-table">
    <header class="light-panel-header">
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.subtitle }}</p>
      </div>
      <span>{{ content.count(totalRows) }}</span>
    </header>

    <div class="light-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Equipement</th>
            <th>Ligne / Zone</th>
            <th>Type</th>
            <th>Priorite</th>
            <th>Technicien</th>
            <th>Planification</th>
            <th>Duree</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="`light-${item.raw?.id || item.id}`">
            <td data-label="Code"><span class="code-badge">{{ item.code }}</span></td>
            <td data-label="Equipement">
              <div class="stacked-cell" :title="item.machine">
                <strong>{{ equipmentName(item) }}</strong>
                <small>{{ equipmentCode(item) }}</small>
              </div>
            </td>
            <td data-label="Ligne / Zone">
              <div class="stacked-cell" :title="`${item.line} - ${item.zone}`">
                <strong>{{ item.raw?.production_line?.name || item.line }}</strong>
                <small>{{ item.raw?.production_zone?.name || item.zone }}</small>
              </div>
            </td>
            <td data-label="Type"><span class="light-badge type"><i></i>{{ item.typeLabel }}</span></td>
            <td data-label="Priorite"><span class="light-badge" :class="priorityTone(item.priority)"><i></i>{{ item.priorityLabel }}</span></td>
            <td data-label="Technicien">
              <div class="technician-cell">
                <span class="avatar" :style="{ background: item.technician.color }">{{ item.technician.initials }}</span>
                <span>{{ item.technician.name }}</span>
              </div>
            </td>
            <td data-label="Planification">
              <div class="stacked-cell compact">
                <span>{{ content.plannedStart }}: {{ item.start }}</span>
                <small>{{ content.plannedEnd }}: {{ item.end === '-' ? content.notCompleted : item.end }}</small>
              </div>
            </td>
            <td data-label="Duree">{{ item.duration }}</td>
            <td data-label="Statut"><span class="light-badge status" :class="statusTone(item.status)"><i></i>{{ item.statusLabel }}</span></td>
            <td data-label="Actions">
              <div class="actions">
                <button type="button" :aria-label="content.view" :title="content.view" @click="$emit('view', item)">
                  <InterventionIcon name="eye" />
                </button>
                <button v-if="canManage" type="button" :aria-label="content.edit" :title="content.edit" @click="$emit('edit', item)">
                  <InterventionIcon name="edit" />
                </button>
                <button v-if="canManage" type="button" :aria-label="content.assign" :title="content.assign" @click="$emit('edit', item)">
                  <InterventionIcon name="users" />
                </button>
                <button v-if="canManage" type="button" :aria-label="content.statusAction" :title="content.statusAction" @click="$emit('edit', item)">
                  <InterventionIcon name="clock" />
                </button>
                <button
                  v-if="canManage"
                  type="button"
                  class="danger-action"
                  :aria-label="content.delete"
                  :title="content.delete"
                  @click="$emit('delete', item)"
                >
                  <InterventionIcon name="trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <button type="button" :disabled="currentPage <= 1" @click="$emit('page-change', currentPage - 1)">
        {{ content.previous }}
      </button>
      <span>{{ firstRow }}-{{ lastRow }} {{ content.of }} {{ totalRows }}</span>
      <button type="button" :disabled="currentPage >= totalPages" @click="$emit('page-change', currentPage + 1)">
        {{ content.next }}
      </button>
    </footer>
  </section>

  <section class="intervention-table-card">
    <header>
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.count(totalRows) }}</p>
      </div>
      <div class="pagination-mini">{{ content.page(currentPage, totalPages) }}</div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button type="button" :disabled="column.key === 'actions'" @click="sortBy(column.key)">
                {{ column.label }}
                <span>{{ sortIcon(column.key) }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.raw?.id || item.id">
            <td><strong class="row-id">{{ item.code }}</strong></td>
            <td>{{ item.machine }}</td>
            <td>{{ item.line }}</td>
            <td>{{ item.zone }}</td>
            <td>{{ item.typeLabel }}</td>
            <td><span class="badge priority" :class="priorityTone(item.priority)">{{ item.priorityLabel }}</span></td>
            <td>
              <div class="technician-cell">
                <span class="avatar" :style="{ background: item.technician.color }">{{ item.technician.initials }}</span>
                <span>{{ item.technician.name }}</span>
              </div>
            </td>
            <td>{{ item.start }}</td>
            <td>{{ item.end }}</td>
            <td>{{ item.duration }}</td>
            <td><span class="badge status" :class="statusTone(item.status)">{{ item.statusLabel }}</span></td>
            <td>
              <div class="actions">
                <button type="button" :aria-label="content.view" :title="content.view" @click="$emit('view', item)">
                  <InterventionIcon name="eye" />
                </button>
                <button
                  v-if="canManage"
                  type="button"
                  :aria-label="content.edit"
                  :title="content.edit"
                  @click="$emit('edit', item)"
                >
                  <InterventionIcon name="edit" />
                </button>
                <button
                  v-if="canManage"
                  type="button"
                  class="danger-action"
                  :aria-label="content.delete"
                  :title="content.delete"
                  @click="$emit('delete', item)"
                >
                  <InterventionIcon name="trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <button type="button" :disabled="currentPage <= 1" @click="$emit('page-change', currentPage - 1)">
        {{ content.previous }}
      </button>
      <span>{{ firstRow }}-{{ lastRow }} {{ content.of }} {{ totalRows }}</span>
      <button type="button" :disabled="currentPage >= totalPages" @click="$emit('page-change', currentPage + 1)">
        {{ content.next }}
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import InterventionIcon from './InterventionIcon.vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  pagination: {
    type: Object,
    default: () => ({ page: 1, limit: 10, total: 0, total_pages: 0 }),
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

const emit = defineEmits(['delete', 'edit', 'page-change', 'sort', 'view'])
const sort = ref({ key: 'created_at', direction: 'desc' })
const columns = computed(() => [
  { key: 'code', label: props.content.columns.code },
  { key: 'equipment', label: props.content.columns.machine },
  { key: 'production_line', label: props.content.columns.line },
  { key: 'production_zone', label: props.content.columns.zone },
  { key: 'type', label: props.content.columns.type },
  { key: 'priority', label: props.content.columns.priority },
  { key: 'technician', label: props.content.columns.technicianName },
  { key: 'started_at', label: props.content.columns.start },
  { key: 'completed_at', label: props.content.columns.end },
  { key: 'duration_minutes', label: props.content.columns.duration },
  { key: 'status', label: props.content.columns.status },
  { key: 'actions', label: props.content.columns.actions },
])
const currentPage = computed(() => Number(props.pagination?.page || 1))
const pageLimit = computed(() => Number(props.pagination?.limit || 10))
const totalRows = computed(() => Number(props.pagination?.total ?? props.rows.length))
const totalPages = computed(() => Math.max(1, Number(props.pagination?.total_pages || Math.ceil(totalRows.value / pageLimit.value) || 1)))
const firstRow = computed(() => (totalRows.value ? (currentPage.value - 1) * pageLimit.value + 1 : 0))
const lastRow = computed(() => Math.min(currentPage.value * pageLimit.value, totalRows.value))

function sortBy(key) {
  if (key === 'actions') return
  sort.value = {
    key,
    direction: sort.value.key === key && sort.value.direction === 'asc' ? 'desc' : 'asc',
  }
  emit('sort', sort.value)
}

function sortIcon(key) {
  if (key === 'actions') return ''
  if (sort.value.key !== key) return '+'
  return sort.value.direction === 'asc' ? '^' : 'v'
}

function statusTone(status) {
  if (status === 'in_progress') return 'in-progress'
  if (['pending', 'planned'].includes(status)) return 'pending'
  if (['cancelled'].includes(status)) return 'cancelled'
  return 'done'
}

function priorityTone(priority) {
  if (priority === 'critical') return 'critical'
  if (priority === 'high') return 'warning'
  if (priority === 'medium') return 'attention'
  return 'low'
}

function equipmentName(item) {
  return item.raw?.equipment?.name || item.machine || '-'
}

function equipmentCode(item) {
  return item.raw?.equipment?.code || '-'
}
</script>

<style scoped>
.light-intervention-table {
  display: none;
}

.intervention-table-card {
  overflow: hidden;
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background: rgba(17, 27, 38, 0.9);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
}

:global(html[data-theme='light']) .light-intervention-table {
  display: block;
  overflow: hidden;
  border: 1px solid #edf0e8;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(74, 10, 10, 0.07);
}

:global(html[data-theme='light']) .intervention-table-card {
  display: none;
}

:global(html[data-theme='light']) .light-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #edf0e8;
}

:global(html[data-theme='light']) .light-panel-header h2 {
  margin: 0;
  color: #4a0a0a;
  font-size: 20px;
  font-weight: 950;
}

:global(html[data-theme='light']) .light-panel-header p {
  margin: 6px 0 0;
  color: #53667f;
  font-size: 14px;
  font-weight: 750;
}

:global(html[data-theme='light']) .light-panel-header > span {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #e3edcf;
  color: #6a9a2a;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 950;
  white-space: nowrap;
}

:global(html[data-theme='light']) .light-table-wrap {
  overflow-x: auto;
  padding: 8px;
}

:global(html[data-theme='light']) .light-intervention-table table {
  width: 100%;
  min-width: 1180px;
  border-collapse: separate;
  border-spacing: 0 6px;
}

:global(html[data-theme='light']) .light-intervention-table th,
:global(html[data-theme='light']) .light-intervention-table td {
  padding: 14px 15px;
  text-align: left;
  vertical-align: middle;
  font-size: 13px;
}

:global(html[data-theme='light']) .light-intervention-table th {
  background: transparent;
  color: #53667f;
  font-weight: 950;
}

:global(html[data-theme='light']) .light-intervention-table td {
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  background: #ffffff;
  color: #4a0a0a;
  font-weight: 780;
}

:global(html[data-theme='light']) .light-intervention-table tbody tr:nth-child(even) td {
  background: rgba(106, 154, 42, 0.035);
}

:global(html[data-theme='light']) .light-intervention-table tbody tr:hover td {
  border-color: rgba(106, 154, 42, 0.16);
  background: #f7f9f3;
}

:global(html[data-theme='light']) .light-intervention-table tbody td:first-child {
  border-left: 1px solid transparent;
  border-radius: 8px 0 0 8px;
}

:global(html[data-theme='light']) .light-intervention-table tbody td:last-child {
  border-right: 1px solid transparent;
  border-radius: 0 8px 8px 0;
}

:global(html[data-theme='light']) .code-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 6px;
  background: #f7f9f3;
  color: #4a0a0a;
  padding: 0 9px;
  font-weight: 950;
}

:global(html[data-theme='light']) .stacked-cell {
  display: grid;
  gap: 3px;
  min-width: 0;
}

:global(html[data-theme='light']) .stacked-cell strong,
:global(html[data-theme='light']) .stacked-cell span {
  overflow: hidden;
  color: #4a0a0a;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(html[data-theme='light']) .stacked-cell small {
  overflow: hidden;
  color: #53667f;
  font-size: 12px;
  font-weight: 780;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(html[data-theme='light']) .stacked-cell.compact span {
  font-size: 12px;
}

:global(html[data-theme='light']) .light-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 950;
}

:global(html[data-theme='light']) .light-badge i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

:global(html[data-theme='light']) .light-badge.type,
:global(html[data-theme='light']) .light-badge.low,
:global(html[data-theme='light']) .light-badge.done {
  background: #edf5de;
  color: #6a9a2a;
}

:global(html[data-theme='light']) .light-badge.warning,
:global(html[data-theme='light']) .light-badge.in-progress {
  background: #fff0df;
  color: #ff6a00;
}

:global(html[data-theme='light']) .light-badge.attention,
:global(html[data-theme='light']) .light-badge.pending {
  background: #fff4cf;
  color: #ad7a00;
}

:global(html[data-theme='light']) .light-badge.critical,
:global(html[data-theme='light']) .light-badge.cancelled {
  background: #ffe2e2;
  color: #e31e24;
}

:global(html[data-theme='light']) .light-intervention-table .actions button {
  background: #ffffff;
  border-color: #dfe5d6;
  color: #6a9a2a;
}

:global(html[data-theme='light']) .light-intervention-table .actions button:hover {
  background: #edf5de;
  transform: translateY(-1px);
}

:global(html[data-theme='light']) .light-intervention-table .actions button.danger-action {
  color: #e31e24;
}

:global(html[data-theme='light']) .light-intervention-table footer {
  border-top: 1px solid #edf0e8;
  padding: 15px 20px;
}

:global(html[data-theme='light']) .light-intervention-table footer button {
  background: #ffffff;
  border-color: #dfe5d6;
  color: #4a0a0a;
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
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

h2,
p {
  margin: 0;
}

h2 {
  color: #f8fbff;
  font-size: 20px;
  font-weight: 950;
}

p,
.pagination-mini,
footer span {
  color: #8d9aab;
  font-size: 12px;
  font-weight: 850;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 18px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
  text-align: left;
}

[dir='rtl'] th,
[dir='rtl'] td {
  text-align: right;
}

th {
  background: rgba(43, 55, 68, 0.72);
}

th button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

th button:disabled {
  cursor: default;
}

td {
  color: #f4f7fb;
  font-size: 13px;
  font-weight: 820;
}

tbody tr {
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

tbody tr:hover {
  background: rgba(35, 49, 64, 0.92);
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
.status.pending,
.status.cancelled {
  background: rgba(220, 55, 71, 0.18);
  color: #ff7f8e;
}

.priority.warning {
  background: rgba(249, 115, 22, 0.18);
  color: #fdba74;
}

.priority.attention {
  background: rgba(250, 204, 21, 0.16);
  color: #fde047;
}

.priority.low,
.status.done {
  background: rgba(131, 185, 92, 0.18);
  color: #bce39d;
}

.status.in-progress {
  background: rgba(228, 171, 68, 0.18);
  color: #ffd27b;
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
  border: 1px solid rgba(210, 221, 234, 0.28);
  background: rgba(13, 21, 32, 0.82);
  color: #f2f6fb;
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
  border-radius: 8px;
  font-size: 16px;
}

.actions button.danger-action {
  color: #ff7f8e;
}

.actions button:hover,
footer button:hover:not(:disabled) {
  background: rgba(24, 38, 53, 0.92);
  transform: translateY(-1px);
}

footer {
  border-top: 1px solid rgba(116, 135, 158, 0.15);
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

:global(html[data-theme='light']) .light-intervention-table {
  display: block;
  overflow: hidden;
  border: 1px solid #edf0e8;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(74, 10, 10, 0.07);
}

:global(html[data-theme='light']) .intervention-table-card {
  display: none;
}

:global(html[data-theme='light']) .light-intervention-table .light-table-wrap table {
  min-width: 1180px;
  border-collapse: separate;
  border-spacing: 0 6px;
}

:global(html[data-theme='light']) .light-intervention-table th {
  background: transparent;
  color: #53667f;
}

:global(html[data-theme='light']) .light-intervention-table td {
  border-color: transparent;
  background: #ffffff;
  color: #4a0a0a;
}

@media (max-width: 760px) {
  :global(html[data-theme='light']) .light-panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  :global(html[data-theme='light']) .light-table-wrap {
    padding: 12px;
  }

  :global(html[data-theme='light']) .light-intervention-table table,
  :global(html[data-theme='light']) .light-intervention-table thead,
  :global(html[data-theme='light']) .light-intervention-table tbody,
  :global(html[data-theme='light']) .light-intervention-table tr,
  :global(html[data-theme='light']) .light-intervention-table th,
  :global(html[data-theme='light']) .light-intervention-table td {
    display: block;
    min-width: 0;
    width: 100%;
  }

  :global(html[data-theme='light']) .light-intervention-table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  :global(html[data-theme='light']) .light-intervention-table tbody {
    display: grid;
    gap: 12px;
  }

  :global(html[data-theme='light']) .light-intervention-table tbody tr {
    display: grid;
    overflow: hidden;
    border: 1px solid #edf0e8;
    border-left: 5px solid #6a9a2a;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 10px 26px rgba(74, 10, 10, 0.06);
  }

  :global(html[data-theme='light']) .light-intervention-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border: 0;
    border-radius: 0;
    padding: 12px 14px;
  }

  :global(html[data-theme='light']) .light-intervention-table td::before {
    content: attr(data-label);
    color: #53667f;
    font-size: 12px;
    font-weight: 950;
  }
}
</style>
