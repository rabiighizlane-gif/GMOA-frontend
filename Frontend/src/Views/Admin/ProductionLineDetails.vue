<template>
  <main class="line-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.sidebarToggle"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <section class="line-page">
      <template v-if="line">
        <div class="line-toolbar">
          <RouterLink class="back-link" to="/admin/production-lines">← {{ content.back }}</RouterLink>
          <button type="button" class="edit-button" @click="openEditModal">{{ content.edit }}</button>
        </div>

        <section class="info-grid">
          <article v-for="item in infoCards" :key="item.label" :class="['metric-card', item.tone]">
            <div>
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <small v-if="item.icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-for="path in getIconPaths(item.icon)" :key="path" :d="path" />
              </svg>
            </small>
          </article>
        </section>

        <section class="details-grid">
          <article class="dashboard-panel machines-panel">
            <div class="panel-title-row">
              <h2>{{ content.machines }}</h2>
            </div>

            <div class="machine-diagram" :aria-label="content.machineDiagram">
              <div class="machine-diagram-copy">
                <div>
                  <span>{{ content.machineAvailability }}</span>
                  <strong>{{ healthyMachines }}/{{ totalMachines }}</strong>
                </div>
                <p>{{ availabilityPercent }}%</p>
              </div>
              <div class="machine-status-track" aria-hidden="true">
                <span class="healthy" :style="{ width: `${healthyPercent}%` }">{{ healthyMachines }}</span>
                <span class="danger" :style="{ width: `${dangerPercent}%` }">{{ dangerMachines }}</span>
              </div>

              <div class="sparkline-header">
                <span>{{ content.availabilityRate }}</span>
                <strong>08h-20h</strong>
              </div>
              <svg class="sparkline" viewBox="0 0 280 104" role="img" :aria-label="content.machineDiagram">
                <path class="sparkline-grid" d="M42 66H260" />
                <path class="sparkline-grid" d="M42 42H260" />
                <path class="sparkline-grid" d="M42 18H260" />
                <path class="sparkline-axis" d="M42 18V66H260" />
                <polyline :points="machineTrendPoints" />
                <circle
                  v-for="point in machineTrendDots"
                  :key="point.hour"
                  :class="{ incident: point.incident }"
                  :cx="point.x"
                  :cy="point.y"
                  r="3.4"
                />
                <g class="sparkline-labels">
                  <text x="34" y="21" text-anchor="end">100%</text>
                  <text x="34" y="45" text-anchor="end">75%</text>
                  <text x="34" y="69" text-anchor="end">50%</text>
                  <text x="42" y="91" text-anchor="middle">08h</text>
                  <text x="115" y="91" text-anchor="middle">12h</text>
                  <text x="188" y="91" text-anchor="middle">16h</text>
                  <text x="260" y="91" text-anchor="middle">20h</text>
                </g>
                <g class="sparkline-note">
                  <path d="M188 64V76" />
                  <text x="188" y="84" text-anchor="middle">{{ content.incidentPoint }}</text>
                </g>
                <text class="sparkline-value" x="260" y="13" text-anchor="end">100%</text>
              </svg>
              <div class="machine-legend">
                <span><i class="healthy"></i>{{ content.inService }} {{ healthyMachines }}</span>
                <span><i class="danger"></i>{{ content.outOfService }} {{ dangerMachines }}</span>
              </div>
            </div>

            <ul class="machine-list">
              <li v-for="machine in productionLineRelations.machines" :key="machine.id" :class="getMachineTone(machine.status)">
                <div>
                  <strong>{{ machine.id }} - {{ machineLabel(machine.name) }}</strong>
                  <span>{{ statusLabel(machine.status) }}</span>
                </div>
                <small v-if="getMachineTone(machine.status) === 'danger'" aria-hidden="true" class="machine-alert">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3 22 20H2L12 3Z" />
                  </svg>
                </small>
              </li>
            </ul>
          </article>

          <article class="dashboard-panel planning-panel">
            <h2>{{ content.planning }}</h2>
            <div class="timeline-meta">
              <span>{{ content.timelineScale }}</span>
              <strong>{{ content.now }} 10:00</strong>
            </div>
            <div class="timeline">
              <span
                class="current-time"
                :data-label="`${content.currentTime} 10:00`"
                :style="{ left: timelineChartOffset(currentHour) }"
                aria-hidden="true"
              ></span>
              <div class="time-grid" aria-hidden="true">
                <span v-for="tick in timelineTicks" :key="tick">{{ tick }}</span>
              </div>

              <div v-for="shift in planningRows" :key="shift.shift" class="shift-row">
                <div class="shift-copy">
                  <strong>{{ shiftLabel(shift.shift) }} · {{ teamLabel(shift.team) }}</strong>
                  <span>{{ targetLabel(shift.target) }} - {{ statusLabel(shift.status) }}</span>
                </div>
                <div class="bar-track">
                  <span class="shift-bar" :class="shift.tone" :style="{ left: shift.left, width: shift.width }">
                    <span>{{ shift.range }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="timeline-legend" aria-hidden="true">
              <span v-for="shift in planningRows" :key="shift.range">
                <i :class="shift.tone"></i>{{ shiftLabel(shift.shift) }} {{ shift.range }}
              </span>
            </div>
          </article>

          <article class="dashboard-panel activity-panel">
            <h2>{{ content.activity }}</h2>
            <ul class="activity-cards">
              <li v-for="(activity, index) in productionLineRelations.activity" :key="activity.time">
                <span class="activity-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                    <path v-for="path in getIconPaths(activityIcons[index % activityIcons.length])" :key="path" :d="path" />
                  </svg>
                </span>
                <div>
                  <strong>{{ activityLabel(activity.type) }}</strong>
                  <span>{{ activityLabel(activity.detail) }}</span>
                  <small>{{ activity.time }}</small>
                </div>
              </li>
            </ul>
          </article>
        </section>
      </template>

      <section v-else class="not-found">
        <h1>{{ content.notFoundTitle }}</h1>
        <p>{{ content.notFoundText }}</p>
      </section>

      <div v-if="isEditModalOpen" class="modal-backdrop" role="presentation" @click.self="closeEditModal">
        <section class="line-modal" role="dialog" aria-modal="true" :aria-label="content.edit">
          <header>
            <div>
              <p>{{ content.editEyebrow }}</p>
              <h2>{{ content.edit }}</h2>
            </div>
            <button type="button" class="modal-close" :aria-label="content.cancel" @click="closeEditModal">×</button>
          </header>

          <form class="edit-form" @submit.prevent="saveLine">
            <label v-for="field in editFields" :key="field.key" :class="{ wide: field.type === 'textarea' }">
              <span>{{ field.label }}</span>
              <textarea v-if="field.type === 'textarea'" v-model="draftLine[field.key]" rows="4"></textarea>
              <select v-else-if="field.type === 'select'" v-model="draftLine[field.key]">
                <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <input v-else v-model="draftLine[field.key]" :type="field.type || 'text'" />
            </label>

            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="closeEditModal">{{ content.cancel }}</button>
              <button type="submit" class="save-button">{{ content.save }}</button>
            </div>
          </form>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Sidebar from '@/Components/sidebar.vue'
import { findProductionLineById, getLineStatusTone, productionLineRelations } from '@/data/productionLines'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const isEditModalOpen = ref(false)
const language = computed(() => languageStore.language)
const line = computed(() => findProductionLineById(route.params.id))
const editableLine = reactive({})
const draftLine = reactive({})

const pageContent = {
  FR: {
  sidebarToggle: 'Afficher le menu',
  back: 'Retour aux lignes',
  department: 'Département',
  manager: 'Responsable',
  edit: 'Modifier la ligne',
  editEyebrow: 'Espace Super Admin',
  cancel: 'Annuler',
  save: 'Enregistrer les modifications',
  notFoundTitle: 'Ligne introuvable',
  notFoundText: "Cette ligne n'existe pas dans la liste actuelle.",
  machines: 'Machines liées',
  planning: 'Planning de production',
  activity: 'Activité récente',
  machineDiagram: 'Disponibilité des machines et tendance de performance',
  machineAvailability: 'Disponibilité',
  availabilityRate: 'Taux de disponibilité',
  incidentPoint: 'Panne M-215',
  inService: 'En service',
  outOfService: 'En panne',
  timelineScale: 'Planning sur 24h',
  now: 'Maintenant',
  currentTime: 'Heure actuelle',
  fields: {
    id: 'ID / Code ligne',
    name: 'Nom de la ligne',
    capacity: 'Capacité',
    machinesCount: 'Nombre de machines',
    operatorsCount: "Nombre d'opérateurs",
    location: 'Localisation',
    status: 'Statut',
    description: 'Description',
  },
  },
  EN: {
    sidebarToggle: 'Show menu',
    back: 'Back to lines',
    department: 'Department',
    manager: 'Manager',
    edit: 'Edit line',
    editEyebrow: 'Super Admin area',
    cancel: 'Cancel',
    save: 'Save changes',
    notFoundTitle: 'Line not found',
    notFoundText: 'This line does not exist in the current list.',
    machines: 'Linked machines',
    planning: 'Production planning',
    activity: 'Recent activity',
    machineDiagram: 'Machine availability and performance trend',
    machineAvailability: 'Availability',
    availabilityRate: 'Availability rate',
    incidentPoint: 'M-215 breakdown',
    inService: 'In service',
    outOfService: 'Down',
    timelineScale: '24h planning',
    now: 'Now',
    currentTime: 'Current Time',
    fields: {
      id: 'Line ID / Code',
      name: 'Line name',
      capacity: 'Capacity',
      machinesCount: 'Machine count',
      operatorsCount: 'Operator count',
      location: 'Location',
      status: 'Status',
      description: 'Description',
    },
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    back: 'العودة إلى الخطوط',
    department: 'القسم',
    manager: 'المسؤول',
    edit: 'تعديل الخط',
    editEyebrow: 'فضاء المدير العام',
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    notFoundTitle: 'الخط غير موجود',
    notFoundText: 'هذا الخط غير موجود في اللائحة الحالية.',
    machines: 'الآلات المرتبطة',
    planning: 'تخطيط الإنتاج',
    activity: 'النشاط الأخير',
    machineDiagram: 'توفر الآلات وتطور الأداء',
    machineAvailability: 'التوفر',
    availabilityRate: 'معدل التوفر',
    incidentPoint: 'عطل M-215',
    inService: 'في الخدمة',
    outOfService: 'معطلة',
    timelineScale: 'تخطيط 24 ساعة',
    now: 'الآن',
    currentTime: 'الوقت الحالي',
    fields: {
      id: 'معرف / رمز الخط',
      name: 'اسم الخط',
      capacity: 'الطاقة الإنتاجية',
      machinesCount: 'عدد الآلات',
      operatorsCount: 'عدد المشغلين',
      location: 'الموقع',
      status: 'الحالة',
      description: 'الوصف',
    },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)

const timelineTicks = ['00h', '04h', '08h', '12h', '16h', '20h', '24h']
const shiftSchedule = [
  { start: 6, end: 10, range: '06h-10h' },
  { start: 11, end: 18, range: '11h-18h' },
  { start: 20, end: 24, range: '20h-24h' },
]
const activityIcons = ['check', 'wrench', 'repeat']
const currentHour = 10
const machineTrend = [
  { hour: '08h', value: 82 },
  { hour: '10h', value: 84 },
  { hour: '12h', value: 90 },
  { hour: '14h', value: 88 },
  { hour: '16h', value: 64, incident: true },
  { hour: '18h', value: 86 },
  { hour: '20h', value: 100 },
]

const iconPaths = {
  settings: [
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .66.39 1.26 1 1.55H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.45Z',
  ],
  machines: ['M4 6h16v12H4Z', 'M8 18v3', 'M16 18v3', 'M8 10h8', 'M8 14h5'],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  location: ['M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z', 'M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  check: ['M20 6 9 17l-5-5'],
  wrench: ['M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.8 2.8-2-2 2.8-2.8Z'],
  repeat: ['M17 2l4 4-4 4', 'M3 11V9a3 3 0 0 1 3-3h15', 'M7 22l-4-4 4-4', 'M21 13v2a3 3 0 0 1-3 3H3'],
}

function getIconPaths(icon) {
  return iconPaths[icon] || iconPaths.settings
}

const infoCards = computed(() => {
  if (!line.value) return []

  return [
    { label: content.value.fields.id, value: editableLine.id },
    { label: content.value.fields.name, value: lineLabel(editableLine.name) },
    { label: content.value.fields.capacity, value: capacityLabel(editableLine.capacity), icon: 'settings' },
    { label: content.value.fields.machinesCount, value: editableLine.machinesCount, icon: 'machines' },
    { label: content.value.fields.operatorsCount, value: editableLine.operatorsCount, icon: 'users' },
    { label: content.value.fields.location, value: locationLabel(editableLine.location), icon: 'location' },
    { label: content.value.fields.status, value: statusLabel(editableLine.status), tone: editableLine.statusTone },
    { label: content.value.fields.description, value: descriptionLabel(editableLine.description), tone: 'description' },
  ]
})

const totalMachines = computed(() => productionLineRelations.machines.length)
const dangerMachines = computed(() => productionLineRelations.machines.filter((machine) => getMachineTone(machine.status) === 'danger').length)
const healthyMachines = computed(() => totalMachines.value - dangerMachines.value)
const healthyPercent = computed(() => (totalMachines.value ? (healthyMachines.value / totalMachines.value) * 100 : 0))
const dangerPercent = computed(() => (totalMachines.value ? (dangerMachines.value / totalMachines.value) * 100 : 0))
const availabilityPercent = computed(() => Math.round(healthyPercent.value))
const machineTrendDots = computed(() =>
  machineTrend.map((point, index) => ({
    ...point,
    x: 42 + index * ((260 - 42) / (machineTrend.length - 1)),
    y: 66 - ((point.value - 50) / 50) * (66 - 18),
  })),
)
const machineTrendPoints = computed(() => machineTrendDots.value.map((point) => `${point.x},${point.y}`).join(' '))

const planningRows = computed(() =>
  productionLineRelations.planning.map((shift, index) => ({
    ...shift,
    range: shiftSchedule[index]?.range || '',
    left: timelineOffset(shiftSchedule[index]?.start || 0),
    width: timelineWidth((shiftSchedule[index]?.end || 0) - (shiftSchedule[index]?.start || 0)),
    tone: ['primary', 'warning', 'attention'][index] || 'primary',
  })),
)

const editFields = computed(() => [
  { key: 'name', label: content.value.fields.name },
  { key: 'department', label: content.value.department },
  { key: 'manager', label: content.value.manager },
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

const lineLabels = {
  'Ligne Production 1': { EN: 'Production Line 1', AR: 'خط الإنتاج 1' },
  'Ligne Production 2': { EN: 'Production Line 2', AR: 'خط الإنتاج 2' },
  'Ligne Conditionnement': { EN: 'Packaging Line', AR: 'خط التعبئة' },
  'Ligne Utilités': { EN: 'Utilities Line', AR: 'خط المرافق' },
}

const machineLabels = {
  "Tour d'usinage": { EN: 'CNC lathe', AR: 'مخرطة صناعية' },
  'Presse hydraulique': { EN: 'Hydraulic press', AR: 'مكبس هيدروليكي' },
  'Convoyeur à bande': { EN: 'Belt conveyor', AR: 'ناقل بسير' },
}

const valueLabels = {
  Active: { EN: 'Active', AR: 'نشطة' },
  'En service': { EN: 'In service', AR: 'في الخدمة' },
  'En panne': { EN: 'Down', AR: 'معطلة' },
  'Sous surveillance': { EN: 'Under monitoring', AR: 'تحت المراقبة' },
  Maintenance: { EN: 'Maintenance', AR: 'صيانة' },
  'Atelier A': { EN: 'Workshop A', AR: 'الورشة أ' },
  'Atelier B': { EN: 'Workshop B', AR: 'الورشة ب' },
  'Zone conditionnement': { EN: 'Packaging area', AR: 'منطقة التعبئة' },
  '1 200 unités/jour': { EN: '1,200 units/day', AR: '1,200 وحدة/اليوم' },
  '900 unités/jour': { EN: '900 units/day', AR: '900 وحدة/اليوم' },
  '1 800 unités/jour': { EN: '1,800 units/day', AR: '1,800 وحدة/اليوم' },
  '420 unités': { EN: '420 units', AR: '420 وحدة' },
  '390 unités': { EN: '390 units', AR: '390 وحدة' },
  '260 unités': { EN: '260 units', AR: '260 وحدة' },
  Planifié: { EN: 'Planned', AR: 'مخطط' },
  'À confirmer': { EN: 'To confirm', AR: 'في انتظار التأكيد' },
  'Ligne dédiée aux opérations d’usinage et de préparation mécanique.': {
    EN: 'Line dedicated to machining and mechanical preparation operations.',
    AR: 'خط مخصص لعمليات التشغيل والتحضير الميكانيكي.',
  },
  "Ligne dédiée aux opérations d'usinage et de préparation mécanique.": {
    EN: 'Line dedicated to machining and mechanical preparation operations.',
    AR: 'خط مخصص لعمليات التشغيل والتحضير الميكانيكي.',
  },
}

const shiftLabels = {
  Matin: { EN: 'Morning', AR: 'الصباح' },
  'Après-midi': { EN: 'Afternoon', AR: 'بعد الظهر' },
  Nuit: { EN: 'Night', AR: 'الليل' },
}

const teamLabels = {
  'Équipe A': { EN: 'Team A', AR: 'الفريق أ' },
  'Équipe B': { EN: 'Team B', AR: 'الفريق ب' },
  'Équipe C': { EN: 'Team C', AR: 'الفريق ج' },
}

const activityLabels = {
  'Contrôle qualité': { EN: 'Quality control', AR: 'مراقبة الجودة' },
  'Maintenance préventive': { EN: 'Preventive maintenance', AR: 'الصيانة الوقائية' },
  'Changement équipe': { EN: 'Shift handover', AR: 'تغيير الفريق' },
  'Contrôle ligne terminé sans écart majeur.': {
    EN: 'Line check completed with no major deviation.',
    AR: 'تم فحص الخط بدون أي انحراف كبير.',
  },
  'Vérification capteurs et convoyeurs planifiée.': {
    EN: 'Sensor and conveyor check scheduled.',
    AR: 'تمت جدولة فحص الحساسات والناقلات.',
  },
  "Passage d'informations entre équipe A et B.": {
    EN: 'Information handover between team A and B.',
    AR: 'تمرير المعلومات بين الفريق أ والفريق ب.',
  },
}

function localizedLabel(value, dictionary) {
  return dictionary[value]?.[language.value] || value
}

function lineLabel(value) {
  return localizedLabel(value, lineLabels)
}

function machineLabel(value) {
  return localizedLabel(value, machineLabels)
}

function statusLabel(value) {
  return localizedLabel(value, valueLabels)
}

function locationLabel(value) {
  return localizedLabel(value, valueLabels)
}

function capacityLabel(value) {
  return localizedLabel(value, valueLabels)
}

function descriptionLabel(value) {
  return localizedLabel(value, valueLabels)
}

function targetLabel(value) {
  return localizedLabel(value, valueLabels)
}

function shiftLabel(value) {
  return localizedLabel(value, shiftLabels)
}

function teamLabel(value) {
  return localizedLabel(value, teamLabels)
}

function activityLabel(value) {
  return localizedLabel(value, activityLabels)
}

watch(
  line,
  (lineValue) => {
    if (lineValue) {
      syncLine(editableLine, lineValue)
      syncLine(draftLine, lineValue)
    }
  },
  { immediate: true },
)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function openEditModal() {
  syncLine(draftLine, editableLine)
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function saveLine() {
  syncLine(editableLine, {
    ...draftLine,
    statusTone: getLineStatusTone(draftLine.status),
    machinesCount: Number(draftLine.machinesCount),
    operatorsCount: Number(draftLine.operatorsCount),
  })
  closeEditModal()
}

function syncLine(target, source) {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })
  Object.assign(target, source)
}

function getMachineTone(status) {
  return String(status || '').toLowerCase().includes('panne') ? 'danger' : 'healthy'
}

function timelineOffset(hour) {
  return `${Math.min(Math.max(hour, 0), 24) * (100 / 24)}%`
}

function timelineWidth(hours) {
  return `${Math.min(Math.max(hours, 0), 24) * (100 / 24)}%`
}

function timelineChartOffset(hour) {
  return `calc(var(--timeline-label) + ((100% - var(--timeline-label)) * ${Math.min(Math.max(hour, 0), 24) / 24}))`
}
</script>

<style scoped>
.line-layout {
  min-height: 100vh;
  background: var(--sc-bg);
  color: var(--sc-dark);
}

.line-page {
  min-height: 100vh;
  padding: 32px 28px 44px 88px;
}

[dir='rtl'] .line-page {
  padding-right: 88px;
  padding-left: 28px;
}

.line-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.back-link {
  color: var(--sc-primary);
  font-size: 13px;
  font-weight: 950;
  text-decoration: none;
}

.edit-button,
.save-button {
  border: 0;
  background: var(--sc-primary);
  color: var(--sc-surface);
}

.edit-button {
  min-height: 38px;
  border-radius: 12px;
  padding: 0 15px;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  white-space: nowrap;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(130px, 1fr));
  gap: 12px;
}

.metric-card,
.dashboard-panel,
.not-found {
  border: 1px solid var(--sc-border);
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
  backdrop-filter: blur(10px);
}

.metric-card {
  min-height: 86px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-radius: 14px;
  padding: 15px;
}

.metric-card.description {
  grid-column: span 2;
  min-height: 110px;
}

.metric-card span,
.shift-copy span,
.machine-list span,
.activity-cards span,
.activity-cards small {
  display: block;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 800;
}

.metric-card strong,
.machine-list strong,
.shift-copy strong,
.activity-cards strong {
  display: block;
  margin-top: 7px;
  color: var(--sc-dark);
  font-size: 15px;
  font-weight: 950;
  line-height: 1.24;
}

.metric-card small {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--sc-primary);
  flex: 0 0 auto;
}

.metric-card small svg {
  width: 24px;
  height: 24px;
}

.metric-card.healthy {
  border-color: var(--sc-primary);
}

.metric-card.warning {
  border-color: var(--sc-warning);
}

.metric-card.danger {
  border-color: var(--sc-danger);
}

.details-grid {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(420px, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.dashboard-panel {
  overflow: hidden;
  border-radius: 16px;
  padding: 18px;
}

.machines-panel,
.planning-panel {
  padding-bottom: 24px;
}

.dashboard-panel h2 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 18px;
  font-weight: 950;
}

.panel-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.machine-diagram {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  border: 1px solid rgba(106, 154, 42, 0.22);
  border-radius: 12px;
  background: rgba(106, 154, 42, 0.05);
  padding: 10px 12px 12px;
}

.machine-diagram-copy {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.machine-diagram-copy span,
.machine-legend {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
}

.machine-diagram-copy strong {
  display: block;
  margin-top: 2px;
  color: var(--sc-primary);
  font-size: 19px;
  font-weight: 950;
}

.machine-diagram-copy p {
  margin: 0;
  border-radius: 999px;
  background: rgba(106, 154, 42, 0.12);
  color: var(--sc-primary);
  padding: 4px 9px;
  font-size: 12px;
  font-weight: 950;
}

.machine-status-track {
  display: flex;
  height: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(74, 10, 10, 0.08);
}

.machine-status-track span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 10px;
  font-weight: 950;
  line-height: 1;
}

.machine-status-track .healthy,
.machine-legend i.healthy {
  background: var(--sc-primary);
}

.machine-status-track .danger,
.machine-legend i.danger {
  background: var(--sc-danger);
}

.sparkline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--sc-muted);
  font-size: 11px;
  font-weight: 900;
}

.sparkline-header strong {
  color: var(--sc-dark);
  font-size: 11px;
  font-weight: 950;
}

.sparkline {
  width: 100%;
  height: 86px;
  overflow: visible;
}

.sparkline-grid {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.sparkline-axis {
  fill: none;
  stroke: #d1d5db;
  stroke-width: 1.2;
}

.sparkline polyline {
  fill: none;
  stroke: #6A9A2A;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sparkline circle {
  fill: var(--sc-surface);
  stroke: #6A9A2A;
  stroke-width: 2;
}

.sparkline circle.incident {
  fill: var(--sc-danger);
  stroke: #ffffff;
  stroke-width: 2;
}

.sparkline-labels {
  fill: #9ca3af;
  font-size: 8px;
  font-weight: 800;
}

.sparkline-note {
  fill: var(--sc-danger);
  stroke: var(--sc-danger);
  font-size: 7px;
  font-weight: 900;
}

.sparkline-note path {
  stroke-width: 1;
  stroke-dasharray: 2 2;
}

.sparkline-value {
  fill: #6A9A2A;
  font-size: 9px;
  font-weight: 950;
}

.machine-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.machine-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.machine-legend i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.timeline-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 900;
}

.timeline-meta strong {
  color: var(--sc-danger);
  font-weight: 950;
}

.machine-list {
  display: grid;
  gap: 0;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.machine-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--sc-border);
}

.machine-list li:last-child {
  border-bottom: 0;
}

.machine-list .healthy span {
  width: max-content;
  border-radius: 5px;
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
  padding: 2px 7px;
}

.machine-list .danger span {
  width: max-content;
  border-radius: 5px;
  background: var(--sc-danger);
  color: var(--sc-surface);
  padding: 2px 7px;
}

.machine-list small {
  color: var(--sc-danger);
}

.machine-alert {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.machine-alert svg {
  display: block;
  width: 100%;
  height: 100%;
}

.timeline {
  --timeline-label: 165px;
  --shift-label: 155px;
  position: relative;
  margin-top: 12px;
  padding: 18px 0 28px;
}

.time-grid {
  position: absolute;
  inset: 0 0 0 var(--timeline-label);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  pointer-events: none;
}

.time-grid::before {
  content: '';
  position: absolute;
  inset: 12px 0 28px;
  border-left: 1px solid var(--sc-border);
  border-bottom: 1px solid var(--sc-border);
  background:
    repeating-linear-gradient(
      90deg,
      var(--sc-border) 0 1px,
      transparent 1px calc(100% / 6)
    ),
    repeating-linear-gradient(
      0deg,
      rgba(74, 10, 10, 0.06) 0 1px,
      transparent 1px 48px
    );
}

.time-grid span {
  color: var(--sc-muted);
  font-size: 11px;
  font-weight: 850;
}

.shift-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: var(--shift-label) minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 60px;
}

.bar-track {
  position: relative;
  height: 38px;
}

.current-time {
  position: absolute;
  z-index: 3;
  top: 12px;
  bottom: 28px;
  width: 1px;
  background: rgba(227, 30, 36, 0.58);
}

.current-time::before {
  content: attr(data-label);
  position: absolute;
  top: -20px;
  left: -36px;
  color: var(--sc-muted);
  font-size: 10px;
  font-weight: 850;
  white-space: nowrap;
}

.shift-bar {
  position: absolute;
  top: 50%;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border-radius: 7px;
  box-shadow: 0 8px 20px rgba(74, 10, 10, 0.28);
}

.shift-bar span {
  color: #ffffff;
  font-size: 11px;
  font-weight: 950;
  line-height: 1;
  white-space: nowrap;
}

.shift-bar.primary {
  background: var(--sc-primary);
}

.shift-bar.warning {
  background: var(--sc-warning);
}

.shift-bar.attention {
  background: var(--sc-attention);
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding-top: 6px;
  color: var(--sc-muted);
  font-size: 11px;
  font-weight: 900;
}

.timeline-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.timeline-legend i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.timeline-legend i.primary {
  background: var(--sc-primary);
}

.timeline-legend i.warning {
  background: var(--sc-warning);
}

.timeline-legend i.attention {
  background: var(--sc-attention);
}

.activity-panel {
  grid-column: 1 / -1;
}

.activity-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.activity-cards li {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 14px;
  min-height: 92px;
  border: 1px solid rgba(106, 154, 42, 0.46);
  border-radius: 12px;
  background: var(--sc-bg);
  padding: 12px;
}

.activity-cards .activity-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--sc-primary);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(106, 154, 42, 0.22);
}

.activity-cards .activity-icon svg {
  width: 21px;
  height: 21px;
  color: #ffffff;
  stroke: currentColor;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.not-found {
  padding: 24px;
  border-radius: 18px;
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

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(74, 10, 10, 0.28);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  background: rgba(74, 10, 10, 0.5);
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
  box-shadow: 0 24px 70px rgba(74, 10, 10, 0.28);
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

.edit-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  overflow-y: auto;
  padding: 22px 24px 24px;
}

.edit-form label {
  display: grid;
  gap: 7px;
}

.edit-form label.wide,
.modal-actions {
  grid-column: 1 / -1;
}

.edit-form label span {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
}

.edit-form input,
.edit-form select,
.edit-form textarea {
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

.edit-form input,
.edit-form select {
  height: 42px;
}

.edit-form textarea {
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

@media (max-width: 1180px) {
  .info-grid {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .line-page,
  [dir='rtl'] .line-page {
    padding: 88px 16px 32px;
  }

  .line-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .edit-button {
    width: 100%;
  }

  .info-grid,
  .activity-cards {
    grid-template-columns: 1fr;
  }

  .shift-row {
    grid-template-columns: 1fr;
  }

  .timeline {
    --timeline-label: 0px;
    --shift-label: 1fr;
  }

  .time-grid {
    left: 0;
  }

  .modal-backdrop {
    padding: 12px;
  }

  .edit-form {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
