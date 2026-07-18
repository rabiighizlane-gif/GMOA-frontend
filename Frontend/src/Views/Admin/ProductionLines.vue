<template>
  <main class="lines-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button type="button" class="sidebar-toggle" :class="{ 'is-hidden': isSidebarOpen }" :aria-label="content.sidebarToggle" :aria-expanded="isSidebarOpen" @click="toggleSidebar">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="lines-page">
      <header class="page-header">
        <div>
          <h1>{{ content.title }}</h1>
          <p>{{ content.subtitle }}</p>
        </div>
        <button type="button" class="primary-button" @click="openAddModal">{{ content.addLine }}</button>
      </header>

      <AdminTopControls v-model="searchQuery" />

      <section class="table-panel" aria-labelledby="lines-table-title">
        <div class="panel-header">
          <div>
            <h2 id="lines-table-title">{{ content.tableTitle }}</h2>
            <p>{{ content.tableSubtitle }}</p>
          </div>
          <span>{{ filteredLines.length }} {{ content.results }}</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ content.columns.id }}</th>
                <th>{{ content.columns.name }}</th>
                <th>{{ content.columns.department }}</th>
                <th>{{ content.columns.manager }}</th>
                <th>{{ content.columns.action }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in filteredLines" :key="line.id" :class="['line-row', getLineWorkTone(line)]">
                <td><strong>{{ line.id }}</strong></td>
                <td>{{ lineLabel(line.name) }}</td>
                <td>
                  <span :class="['work-badge', getLineWorkTone(line)]">{{ departmentLabel(line.department) }}</span>
                </td>
                <td>{{ managerLabel(line.manager) }}</td>
                <td>
                  <RouterLink class="view-link" :to="{ name: 'admin-production-line-details', params: { id: line.id } }">
                    <span aria-hidden="true">👁</span>
                    {{ content.view }}
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div v-if="isAddModalOpen" class="modal-backdrop" role="presentation" @click.self="closeAddModal">
        <section class="line-modal" role="dialog" aria-modal="true" :aria-label="content.addLine">
          <header>
            <div>
              <p>{{ content.addEyebrow }}</p>
              <h2>{{ content.addLine }}</h2>
            </div>
            <button type="button" class="modal-close" :aria-label="content.cancel" @click="closeAddModal">×</button>
          </header>

          <form class="add-form" @submit.prevent="saveNewLine">
            <label v-for="field in addFields" :key="field.key" :class="{ wide: field.type === 'textarea' }">
              <span>{{ field.label }}</span>
              <textarea v-if="field.type === 'textarea'" v-model="newLine[field.key]" rows="4"></textarea>
              <select v-else-if="field.type === 'select'" v-model="newLine[field.key]">
                <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <input v-else v-model="newLine[field.key]" :type="field.type || 'text'" :required="field.required" />
            </label>

            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="closeAddModal">{{ content.cancel }}</button>
              <button type="submit" class="save-button">{{ content.save }}</button>
            </div>
          </form>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AdminTopControls from '@/Components/AdminTopControls.vue'
import Sidebar from '@/Components/sidebar.vue'
import { addProductionLine, getProductionLines } from '@/data/productionLines'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const router = useRouter()
const isSidebarOpen = ref(false)
const isAddModalOpen = ref(false)
const searchQuery = ref('')
const linesList = ref(getProductionLines())
const language = computed(() => languageStore.language)

const emptyLine = {
  id: '',
  name: '',
  department: '',
  manager: '',
  status: 'Active',
  capacity: '',
  machinesCount: 0,
  operatorsCount: 0,
  location: '',
  description: '',
}
const newLine = reactive({ ...emptyLine })

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    title: 'Lignes de production',
    subtitle: 'Liste simple pour identifier rapidement une ligne.',
    tableTitle: 'Tableau Lignes de production',
    tableSubtitle: 'ID, nom, département, responsable et accès à la fiche complète.',
    results: 'lignes',
    view: 'Voir',
    addLine: 'Ajouter une ligne',
    addEyebrow: 'Espace Super Admin',
    cancel: 'Annuler',
    save: 'Ajouter la ligne',
    columns: { id: 'ID Ligne', name: 'Nom de la ligne', department: 'Département', manager: 'Responsable', action: 'Action' },
    fields: {
      id: 'ID Ligne',
      name: 'Nom de la ligne',
      department: 'Département',
      manager: 'Responsable',
      status: 'Statut',
      capacity: 'Capacité',
      machinesCount: 'Nombre de machines',
      operatorsCount: "Nombre d'opérateurs",
      location: 'Localisation',
      description: 'Description',
    },
  },
  EN: {
    sidebarToggle: 'Show menu',
    title: 'Production lines',
    subtitle: 'A simple list to identify a production line quickly.',
    tableTitle: 'Production lines table',
    tableSubtitle: 'ID, name, department, manager and access to the full record.',
    results: 'lines',
    view: 'View',
    addLine: 'Add line',
    addEyebrow: 'Super Admin area',
    cancel: 'Cancel',
    save: 'Add line',
    columns: { id: 'Line ID', name: 'Line name', department: 'Department', manager: 'Manager', action: 'Action' },
    fields: {
      id: 'Line ID',
      name: 'Line name',
      department: 'Department',
      manager: 'Manager',
      status: 'Status',
      capacity: 'Capacity',
      machinesCount: 'Machines',
      operatorsCount: 'Operators',
      location: 'Location',
      description: 'Description',
    },
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    title: 'خطوط الإنتاج',
    subtitle: 'لائحة بسيطة للتعرف على خط الإنتاج بسرعة.',
    tableTitle: 'جدول خطوط الإنتاج',
    tableSubtitle: 'المعرف، الاسم، القسم، المسؤول والدخول إلى البطاقة الكاملة.',
    results: 'خطوط',
    view: 'عرض',
    addLine: 'إضافة خط',
    addEyebrow: 'فضاء المدير العام',
    cancel: 'إلغاء',
    save: 'إضافة الخط',
    columns: { id: 'معرف الخط', name: 'اسم الخط', department: 'القسم', manager: 'المسؤول', action: 'الإجراء' },
    fields: {
      id: 'معرف الخط',
      name: 'اسم الخط',
      department: 'القسم',
      manager: 'المسؤول',
      status: 'الحالة',
      capacity: 'الطاقة الإنتاجية',
      machinesCount: 'عدد الآلات',
      operatorsCount: 'عدد المشغلين',
      location: 'الموقع',
      description: 'الوصف',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const lineLabels = {
  'Ligne Production 1': { EN: 'Production Line 1', AR: 'خط الإنتاج 1' },
  'Ligne Production 2': { EN: 'Production Line 2', AR: 'خط الإنتاج 2' },
  'Ligne Conditionnement': { EN: 'Packaging Line', AR: 'خط التعبئة' },
  'Ligne Utilités': { EN: 'Utilities Line', AR: 'خط المرافق' },
}

const departmentLabels = {
  Production: { EN: 'Production', AR: 'الإنتاج' },
  Conditionnement: { EN: 'Packaging', AR: 'التعبئة' },
  Maintenance: { EN: 'Maintenance', AR: 'الصيانة' },
}

const managerLabels = {
  'Youssef Amrani': { AR: 'يوسف العمراني' },
  'Nadia Benkirane': { AR: 'نادية بن كيران' },
  'Sara El Idrissi': { AR: 'سارة الإدريسي' },
  'Hamza Ait Ali': { AR: 'حمزة آيت علي' },
}

const statusLabels = {
  Active: { EN: 'Active', AR: 'نشط' },
  'Sous surveillance': { EN: 'Under monitoring', AR: 'تحت المراقبة' },
  Maintenance: { EN: 'Maintenance', AR: 'صيانة' },
}

const filteredLines = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return linesList.value

  return linesList.value.filter((line) =>
    [line.id, lineLabel(line.name), departmentLabel(line.department), managerLabel(line.manager)].some((value) =>
      String(value).toLowerCase().includes(query),
    ),
  )
})

const addFields = computed(() => [
  { key: 'id', label: content.value.fields.id, required: true },
  { key: 'name', label: content.value.fields.name, required: true },
  { key: 'department', label: content.value.fields.department, required: true },
  { key: 'manager', label: content.value.fields.manager },
  {
    key: 'status',
    label: content.value.fields.status,
    type: 'select',
    options: [
      { value: 'Active', label: statusLabel('Active') },
      { value: 'Sous surveillance', label: statusLabel('Sous surveillance') },
      { value: 'Maintenance', label: statusLabel('Maintenance') },
    ],
  },
  { key: 'capacity', label: content.value.fields.capacity },
  { key: 'machinesCount', label: content.value.fields.machinesCount, type: 'number' },
  { key: 'operatorsCount', label: content.value.fields.operatorsCount, type: 'number' },
  { key: 'location', label: content.value.fields.location },
  { key: 'description', label: content.value.fields.description, type: 'textarea' },
])

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function openAddModal() {
  Object.assign(newLine, emptyLine, { id: getNextLineId() })
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

function saveNewLine() {
  const savedLine = addProductionLine({
    ...newLine,
    id: newLine.id.trim(),
    name: newLine.name.trim(),
    department: newLine.department.trim(),
  })
  linesList.value = getProductionLines()
  closeAddModal()
  router.push({ name: 'admin-production-line-details', params: { id: savedLine.id } })
}

function getNextLineId() {
  const highestId = linesList.value.reduce((maxId, line) => {
    const numericId = Number(String(line.id).replace(/\D/g, ''))

    return Number.isFinite(numericId) ? Math.max(maxId, numericId) : maxId
  }, 0)

  return `LP-${String(highestId + 1).padStart(2, '0')}`
}

function getLineWorkTone(line) {
  const workContext = `${line.department || ''} ${line.name || ''}`.toLowerCase()

  if (workContext.includes('maintenance') || workContext.includes('utilit')) return 'technician-tone'
  if (workContext.includes('production') || workContext.includes('conditionnement')) return 'operator-tone'

  return 'admin-tone'
}

function localizedLabel(value, dictionary) {
  return dictionary[value]?.[language.value] || value
}

function lineLabel(value) {
  return localizedLabel(value, lineLabels)
}

function departmentLabel(value) {
  return localizedLabel(value, departmentLabels)
}

function managerLabel(value) {
  return localizedLabel(value, managerLabels)
}

function statusLabel(value) {
  return localizedLabel(value, statusLabels)
}
</script>

<style scoped>
.lines-layout {
  min-height: 100vh;
  background: var(--sc-bg);
  color: var(--sc-dark);
}

.lines-page {
  min-height: 100vh;
  padding: 28px 28px 48px 88px;
}

[dir='rtl'] .lines-page {
  padding-right: 88px;
  padding-left: 28px;
}

.page-header,
.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h1,
.panel-header h2 {
  margin: 0;
  color: var(--sc-dark);
  font-weight: 950;
}

.page-header h1 {
  font-size: 30px;
}

.panel-header h2 {
  font-size: 20px;
}

.page-header p,
.panel-header p {
  margin: 6px 0 0;
  color: var(--sc-muted);
  font-size: 15px;
  font-weight: 700;
}

.primary-button,
.save-button {
  border: 0;
  background: var(--sc-primary);
  color: var(--sc-surface);
}

.primary-button {
  min-height: 44px;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
  white-space: nowrap;
}

.table-panel {
  margin-top: 22px;
  overflow: hidden;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
}

.panel-header {
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--sc-border);
}

.panel-header > span {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 950;
  white-space: nowrap;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

th,
td {
  padding: 17px 20px;
  border-bottom: 1px solid var(--sc-border);
  text-align: left;
  font-size: 14px;
}

[dir='rtl'] th,
[dir='rtl'] td {
  text-align: right;
}

th {
  background: var(--sc-bg);
  color: var(--sc-muted);
  font-weight: 950;
}

td {
  color: var(--sc-dark);
  font-weight: 760;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.line-row td:first-child {
  border-left: 5px solid transparent;
}

[dir='rtl'] .line-row td:first-child {
  border-right: 5px solid transparent;
  border-left: 0;
}

.line-row.operator-tone td:first-child {
  border-left-color: var(--sc-danger);
}

.line-row.technician-tone td:first-child {
  border-left-color: var(--sc-warning);
}

.line-row.admin-tone td:first-child {
  border-left-color: var(--sc-attention);
}

[dir='rtl'] .line-row.operator-tone td:first-child {
  border-right-color: var(--sc-danger);
}

[dir='rtl'] .line-row.technician-tone td:first-child {
  border-right-color: var(--sc-warning);
}

[dir='rtl'] .line-row.admin-tone td:first-child {
  border-right-color: var(--sc-attention);
}

.work-badge {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0 11px;
  font-size: 12px;
  font-weight: 950;
}

.work-badge.operator-tone {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.work-badge.technician-tone {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.work-badge.admin-tone {
  background: var(--sc-soft-attention);
  color: var(--sc-attention);
}

.view-link {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(106, 154, 42, 0.28);
  border-radius: 10px;
  background: var(--sc-surface);
  color: var(--sc-primary);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 950;
  text-decoration: none;
}

.view-link:hover {
  background: var(--sc-soft-primary);
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 50;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  border: 1px solid var(--sc-border);
  border-radius: 16px;
  background: var(--sc-surface);
  color: var(--sc-dark);
  box-shadow: var(--sc-shadow);
}

[dir='rtl'] .sidebar-toggle {
  right: 24px;
  left: auto;
}

.sidebar-toggle.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.sidebar-toggle span {
  width: 22px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.sidebar-backdrop,
.modal-backdrop {
  position: fixed;
  inset: 0;
}

.sidebar-backdrop {
  z-index: 35;
  background: rgba(74, 10, 10, 0.28);
}

.modal-backdrop {
  z-index: 120;
  display: grid;
  place-items: center;
  background: rgba(74, 10, 10, 0.34);
  padding: 24px;
}

.line-modal {
  width: min(900px, 100%);
  max-height: min(820px, calc(100vh - 48px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  box-shadow: 0 24px 70px rgba(74, 10, 10, 0.22);
}

.line-modal header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--sc-border);
}

.line-modal header p {
  margin: 0 0 6px;
  color: var(--sc-primary);
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
}

.line-modal h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 22px;
  font-weight: 950;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: 1px solid var(--sc-border);
  border-radius: 10px;
  background: var(--sc-bg);
  color: var(--sc-dark);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.add-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  overflow-y: auto;
  padding: 22px 24px 24px;
}

.add-form label {
  display: grid;
  gap: 7px;
}

.add-form label.wide,
.modal-actions {
  grid-column: 1 / -1;
}

.add-form label span {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
}

.add-form input,
.add-form select,
.add-form textarea {
  width: 100%;
  border: 1px solid var(--sc-border);
  border-radius: 12px;
  background: var(--sc-bg);
  color: var(--sc-dark);
  padding: 0 13px;
  font-size: 14px;
  font-weight: 800;
  outline: none;
}

.add-form input,
.add-form select {
  height: 42px;
}

.add-form textarea {
  min-height: 106px;
  padding-block: 12px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;
}

.cancel-button,
.save-button {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--sc-border);
  background: var(--sc-surface);
  color: var(--sc-dark);
}

@media (max-width: 900px) {
  .lines-page,
  [dir='rtl'] .lines-page {
    padding: 88px 16px 32px;
  }

  .page-header,
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
  }

  .modal-backdrop {
    padding: 12px;
  }

  .add-form {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
