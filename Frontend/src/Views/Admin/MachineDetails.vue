<template>
  <main class="machine-layout" :dir="language === 'AR' ? 'rtl' : 'ltr'">
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

    <section class="machine-page">
      <RouterLink class="back-link" to="/admin/machines">← {{ content.back }}</RouterLink>

      <template v-if="machine">
        <header class="machine-hero">
          <img class="machine-hero-photo" :src="editableMachine.imageUrl || fallbackImage" :alt="machineNameLabel(editableMachine.name)" />
          <div>
            <p>{{ content.pageEyebrow }}</p>
            <h1>{{ editableMachine.id }} - {{ machineNameLabel(editableMachine.name) }}</h1>
            <div class="hero-meta">
              <span>{{ content.line }}: <strong>{{ productionLineLabel(editableMachine.line) }}</strong></span>
              <span :class="['status-pill', editableMachine.statusTone]">{{ optionLabel(editableMachine.status) }}</span>
              <span :class="['status-pill', editableMachine.criticalityTone]">
                {{ content.criticality }}: {{ optionLabel(editableMachine.criticality) }}
              </span>
            </div>
          </div>

          <button type="button" class="edit-button" @click="openEditModal">{{ content.edit }}</button>
        </header>

        <nav class="tabs" :aria-label="content.tabsLabel">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span aria-hidden="true">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>

        <section class="tab-panel">
          <div v-if="activeTab === 'general'" class="info-grid">
            <InfoItem v-for="item in generalInfo" :key="item.label" :label="item.label" :value="item.value" />
          </div>

          <DataTable
            v-else-if="activeTab === 'interventions'"
            :columns="content.interventionsColumns"
            :rows="machineRelations.interventions"
          />

          <DataTable
            v-else-if="activeTab === 'breakdowns'"
            :columns="content.breakdownsColumns"
            :rows="machineRelations.breakdowns"
          />

          <section v-else-if="activeTab === 'preventive'" class="preventive-panel">
            <div class="preventive-card week-planning">
              <h3>{{ content.preventiveCard.weekPlanning }}</h3>
              <div class="calendar-icon" aria-hidden="true">▦</div>
              <strong>{{ machineRelations.preventiveMaintenance.length * 4 }}</strong>
              <p>{{ content.preventiveCard.machinesToCheck }}</p>
            </div>

            <div class="preventive-card due-list">
              <h3>{{ content.preventiveCard.nextDue }}</h3>
              <ul>
                <li v-for="item in machineRelations.preventiveMaintenance" :key="item.plan">
                  <strong>{{ machine.id }} - {{ machineNameLabel(machine.name) }}</strong>
                  <span>{{ item.nextDue }}</span>
                  <small>{{ translateDetailValue(item.plan) }} · {{ translateDetailValue(item.technician) }}</small>
                </li>
              </ul>
            </div>

            <button type="button" class="planning-link" :aria-expanded="isFullPlanningOpen" @click="isFullPlanningOpen = !isFullPlanningOpen">
              {{ isFullPlanningOpen ? content.preventiveCard.hidePlanning : content.preventiveCard.fullPlanning }}
              <span aria-hidden="true">{{ language === 'AR' ? '←' : '→' }}</span>
            </button>

            <div v-if="isFullPlanningOpen" class="full-planning">
              <DataTable :columns="content.preventiveColumns" :rows="machineRelations.preventiveMaintenance" />
            </div>
          </section>

          <DataTable
            v-else-if="activeTab === 'parts'"
            :columns="content.partsColumns"
            :rows="machineRelations.spareParts"
          />

          <DocumentsTable v-else-if="activeTab === 'documents'" :columns="content.documentsColumns" :rows="machineRelations.documents" />

          <div v-else-if="activeTab === 'kpi'" class="kpi-grid">
            <article v-for="kpi in kpis" :key="kpi.label">
              <span>{{ kpi.label }}</span>
              <strong>{{ kpi.value }}</strong>
            </article>
          </div>

          <ol v-else class="activity-list">
            <li v-for="activity in machineRelations.activity" :key="activity.time">
              <span aria-hidden="true"></span>
              <div>
                <strong>{{ translateDetailValue(activity.type) }}</strong>
                <p>{{ translateDetailValue(activity.detail) }}</p>
                <small>{{ activity.time }}</small>
              </div>
            </li>
          </ol>
        </section>
      </template>

      <section v-else class="not-found">
        <h1>{{ content.notFoundTitle }}</h1>
        <p>{{ content.notFoundText }}</p>
      </section>

      <div v-if="isEditModalOpen" class="modal-backdrop" role="presentation" @click.self="closeEditModal">
        <section class="machine-modal" role="dialog" aria-modal="true" :aria-label="content.edit">
          <header>
            <div>
              <p>{{ content.editEyebrow }}</p>
              <h2>{{ content.edit }}</h2>
            </div>
            <button type="button" class="modal-close" :aria-label="content.cancel" @click="closeEditModal">×</button>
          </header>

          <form class="edit-form" @submit.prevent="saveMachine">
            <label v-for="field in editFields" :key="field.key" :class="{ wide: field.type === 'textarea' }">
              <span>{{ field.label }}</span>
              <textarea
                v-if="field.type === 'textarea'"
                v-model="draftMachine[field.key]"
                rows="4"
              ></textarea>
              <select v-else-if="field.type === 'select'" v-model="draftMachine[field.key]">
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <input v-else v-model="draftMachine[field.key]" :type="field.type || 'text'" />
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
import { computed, defineComponent, h, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import Sidebar from '@/Components/sidebar.vue'
import { findMachineById, machineRelations } from '@/data/machines'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const languageStore = useLanguageStore()
const isSidebarOpen = ref(false)
const activeTab = ref('general')
const isEditModalOpen = ref(false)
const isFullPlanningOpen = ref(false)
const language = computed(() => languageStore.language)
const editableMachine = reactive({})
const draftMachine = reactive({})
const fallbackImage = '/documents/machines/common/photo-zone-machine.svg'

const machine = computed(() => findMachineById(route.params.id))

const pageContent = {
  FR: {
    sidebarToggle: 'Afficher le menu',
    back: 'Retour aux machines',
    pageEyebrow: 'Fiche détaillée de la machine',
    line: 'Ligne',
    criticality: 'Criticité',
    edit: 'Modifier la machine',
    editEyebrow: 'Espace Super Admin',
    cancel: 'Annuler',
    save: 'Enregistrer les modifications',
    tabsLabel: 'Sections de la fiche machine',
    notFoundTitle: 'Machine introuvable',
    notFoundText: "Cette machine n'existe pas dans la liste actuelle.",
    tabs: {
      general: 'Informations générales',
      interventions: 'Interventions',
      breakdowns: 'Historique des pannes',
      preventive: 'Maintenance préventive',
      parts: 'Pièces de rechange',
      documents: 'Documents',
      kpi: 'Indicateurs KPI',
      activity: 'Activité récente',
    },
    general: {
      id: 'ID / Code machine',
      name: 'Nom de la machine',
      type: 'Type ou catégorie',
      line: 'Ligne de production',
      department: 'Département',
      manufacturer: 'Fabricant',
      model: 'Modèle',
      serialNumber: 'Numéro de série',
      commissioningDate: 'Date de mise en service',
      location: 'Localisation',
      status: 'Statut',
      criticality: 'Criticité',
      description: 'Description',
    },
    interventionsColumns: [
      ['type', 'Type'],
      ['technician', 'Technicien responsable'],
      ['requestedBy', 'Demandée par'],
      ['startDate', 'Date de début'],
      ['endDate', 'Date de fin'],
      ['duration', 'Durée'],
      ['status', 'Statut'],
      ['report', "Rapport d'intervention"],
    ],
    breakdownsColumns: [
      ['type', 'Type de panne'],
      ['description', 'Description'],
      ['declaredAt', 'Date de déclaration'],
      ['cause', 'Cause détectée'],
      ['downtime', "Temps d'arrêt"],
      ['solution', 'Solution appliquée'],
      ['status', 'Statut de résolution'],
    ],
    preventiveColumns: [
      ['plan', 'Plan de maintenance'],
      ['frequency', 'Fréquence'],
      ['nextDue', 'Prochaine échéance'],
      ['lastCheck', 'Dernier contrôle'],
      ['checklist', 'Checklist'],
      ['technician', 'Technicien affecté'],
      ['planningStatus', 'État du planning'],
    ],
    preventiveCard: {
      weekPlanning: 'Planning de la semaine',
      machinesToCheck: 'machines à contrôler cette semaine',
      nextDue: 'Prochaines échéances',
      fullPlanning: 'Voir le planning complet',
      hidePlanning: 'Masquer le planning',
    },
    partsColumns: [
      ['name', 'Pièce utilisée'],
      ['quantity', 'Quantité consommée'],
      ['reference', 'Référence'],
      ['usedAt', "Date d'utilisation"],
      ['stock', 'Stock disponible'],
      ['cost', 'Coût'],
    ],
    documentsColumns: [
      ['type', 'Type'],
      ['name', 'Document'],
      ['date', "Date d'ajout"],
      ['action', 'Action'],
    ],
    kpis: {
      availability: 'Disponibilité de la machine',
      mtbf: 'MTBF',
      mttr: 'MTTR',
      breakdownCount: 'Nombre de pannes',
      downtime: "Temps total d'arrêt",
      interventionCount: "Nombre d'interventions",
      maintenanceCost: 'Coût total de maintenance',
    },
    editFields: {
      name: 'Nom de la machine',
      line: 'Ligne de production',
      type: 'Type ou catégorie',
      department: 'Département',
      manufacturer: 'Fabricant',
      model: 'Modèle',
      serialNumber: 'Numéro de série',
      commissioningDate: 'Date de mise en service',
      location: 'Localisation',
      status: 'Statut',
      criticality: 'Criticité',
      description: 'Description',
      availability: 'Disponibilité',
      mtbf: 'MTBF',
      mttr: 'MTTR',
      breakdownCount: 'Nombre de pannes',
      downtime: "Temps total d'arrêt",
      interventionCount: "Nombre d'interventions",
      maintenanceCost: 'Coût total de maintenance',
    },
  },
}

const detailTranslations = {
  EN: {
    sidebarToggle: 'Show menu',
    back: 'Back to machines',
    pageEyebrow: 'Detailed machine record',
    line: 'Line',
    criticality: 'Criticality',
    edit: 'Edit machine',
    editEyebrow: 'Super Admin area',
    cancel: 'Cancel',
    save: 'Save changes',
    tabsLabel: 'Machine record sections',
    notFoundTitle: 'Machine not found',
    notFoundText: 'This machine does not exist in the current list.',
    tabs: {
      general: 'General information',
      interventions: 'Interventions',
      breakdowns: 'Breakdown history',
      preventive: 'Preventive maintenance',
      parts: 'Spare parts',
      documents: 'Documents',
      kpi: 'KPI indicators',
      activity: 'Recent activity',
    },
    general: {
      id: 'Machine ID / Code',
      name: 'Machine name',
      type: 'Type or category',
      line: 'Production line',
      department: 'Department',
      manufacturer: 'Manufacturer',
      model: 'Model',
      serialNumber: 'Serial number',
      commissioningDate: 'Commissioning date',
      location: 'Location',
      status: 'Status',
      criticality: 'Criticality',
      description: 'Description',
    },
    kpis: {
      availability: 'Machine availability',
      mtbf: 'MTBF',
      mttr: 'MTTR',
      breakdownCount: 'Breakdowns',
      downtime: 'Total downtime',
      interventionCount: 'Interventions',
      maintenanceCost: 'Maintenance cost',
    },
    editFields: {
      name: 'Machine name',
      line: 'Production line',
      type: 'Type or category',
      department: 'Department',
      manufacturer: 'Manufacturer',
      model: 'Model',
      serialNumber: 'Serial number',
      commissioningDate: 'Commissioning date',
      location: 'Location',
      status: 'Status',
      criticality: 'Criticality',
      description: 'Description',
      availability: 'Availability',
      mtbf: 'MTBF',
      mttr: 'MTTR',
      breakdownCount: 'Breakdowns',
      downtime: 'Total downtime',
      interventionCount: 'Interventions',
      maintenanceCost: 'Maintenance cost',
    },
    preventiveCard: {
      weekPlanning: 'Weekly planning',
      machinesToCheck: 'machines to check this week',
      nextDue: 'Upcoming due dates',
      fullPlanning: 'View full planning',
      hidePlanning: 'Hide planning',
    },
    interventionsColumns: [
      ['type', 'Type'],
      ['technician', 'Responsible technician'],
      ['requestedBy', 'Requested by'],
      ['startDate', 'Start date'],
      ['endDate', 'End date'],
      ['duration', 'Duration'],
      ['status', 'Status'],
      ['report', 'Intervention report'],
    ],
    breakdownsColumns: [
      ['type', 'Breakdown type'],
      ['description', 'Description'],
      ['declaredAt', 'Declaration date'],
      ['cause', 'Detected cause'],
      ['downtime', 'Downtime'],
      ['solution', 'Applied solution'],
      ['status', 'Resolution status'],
    ],
    partsColumns: [
      ['name', 'Used part'],
      ['quantity', 'Quantity consumed'],
      ['reference', 'Reference'],
      ['usedAt', 'Usage date'],
      ['stock', 'Available stock'],
      ['cost', 'Cost'],
    ],
    documentsColumns: [
      ['type', 'Type'],
      ['name', 'Document'],
      ['date', 'Added date'],
      ['action', 'Action'],
    ],
  },
  AR: {
    sidebarToggle: 'إظهار القائمة',
    back: 'العودة إلى الآلات',
    pageEyebrow: 'البطاقة التفصيلية للآلة',
    line: 'الخط',
    criticality: 'الأهمية',
    edit: 'تعديل الآلة',
    editEyebrow: 'فضاء المدير العام',
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    tabsLabel: 'أقسام بطاقة الآلة',
    notFoundTitle: 'الآلة غير موجودة',
    notFoundText: 'هذه الآلة غير موجودة في اللائحة الحالية.',
    tabs: {
      general: 'معلومات عامة',
      interventions: 'التدخلات',
      breakdowns: 'سجل الأعطال',
      preventive: 'الصيانة الوقائية',
      parts: 'قطع الغيار',
      documents: 'الوثائق',
      kpi: 'مؤشرات KPI',
      activity: 'النشاط الأخير',
    },
    general: {
      id: 'معرف / رمز الآلة',
      name: 'اسم الآلة',
      type: 'النوع أو الفئة',
      line: 'خط الإنتاج',
      department: 'القسم',
      manufacturer: 'الشركة المصنعة',
      model: 'النموذج',
      serialNumber: 'الرقم التسلسلي',
      commissioningDate: 'تاريخ التشغيل',
      location: 'الموقع',
      status: 'الحالة',
      criticality: 'الأهمية',
      description: 'الوصف',
    },
    kpis: {
      availability: 'توفر الآلة',
      mtbf: 'MTBF',
      mttr: 'MTTR',
      breakdownCount: 'عدد الأعطال',
      downtime: 'إجمالي وقت التوقف',
      interventionCount: 'عدد التدخلات',
      maintenanceCost: 'تكلفة الصيانة',
    },
    editFields: {
      name: 'اسم الآلة',
      line: 'خط الإنتاج',
      type: 'النوع أو الفئة',
      department: 'القسم',
      manufacturer: 'الشركة المصنعة',
      model: 'النموذج',
      serialNumber: 'الرقم التسلسلي',
      commissioningDate: 'تاريخ التشغيل',
      location: 'الموقع',
      status: 'الحالة',
      criticality: 'الأهمية',
      description: 'الوصف',
      availability: 'التوفر',
      mtbf: 'MTBF',
      mttr: 'MTTR',
      breakdownCount: 'عدد الأعطال',
      downtime: 'إجمالي وقت التوقف',
      interventionCount: 'عدد التدخلات',
      maintenanceCost: 'تكلفة الصيانة',
    },
    preventiveCard: {
      weekPlanning: 'تخطيط الأسبوع',
      machinesToCheck: 'آلات للفحص هذا الأسبوع',
      nextDue: 'الاستحقاقات القادمة',
      fullPlanning: 'عرض التخطيط الكامل',
      hidePlanning: 'إخفاء التخطيط',
    },
    interventionsColumns: [
      ['type', 'النوع'],
      ['technician', 'التقني المسؤول'],
      ['requestedBy', 'تم الطلب من طرف'],
      ['startDate', 'تاريخ البداية'],
      ['endDate', 'تاريخ النهاية'],
      ['duration', 'المدة'],
      ['status', 'الحالة'],
      ['report', 'تقرير التدخل'],
    ],
    breakdownsColumns: [
      ['type', 'نوع العطل'],
      ['description', 'الوصف'],
      ['declaredAt', 'تاريخ التصريح'],
      ['cause', 'السبب المكتشف'],
      ['downtime', 'وقت التوقف'],
      ['solution', 'الحل المطبق'],
      ['status', 'حالة الحل'],
    ],
    partsColumns: [
      ['name', 'قطعة مستعملة'],
      ['quantity', 'الكمية المستهلكة'],
      ['reference', 'المرجع'],
      ['usedAt', 'تاريخ الاستعمال'],
      ['stock', 'المخزون المتوفر'],
      ['cost', 'التكلفة'],
    ],
    documentsColumns: [
      ['type', 'النوع'],
      ['name', 'الوثيقة'],
      ['date', 'تاريخ الإضافة'],
      ['action', 'الإجراء'],
    ],
  },
}

const content = computed(() => mergeContent(pageContent.FR, detailTranslations[language.value] || {}))

const tabs = computed(() => [
  { key: 'general', icon: '🏭', label: content.value.tabs.general },
  { key: 'interventions', icon: '🔧', label: content.value.tabs.interventions },
  { key: 'breakdowns', icon: '⚠️', label: content.value.tabs.breakdowns },
  { key: 'preventive', icon: '📅', label: content.value.tabs.preventive },
  { key: 'parts', icon: '📦', label: content.value.tabs.parts },
  { key: 'documents', icon: '📄', label: content.value.tabs.documents },
  { key: 'kpi', icon: '📊', label: content.value.tabs.kpi },
  { key: 'activity', icon: '🕘', label: content.value.tabs.activity },
])

const generalInfo = computed(() => {
  if (!machine.value) return []

  return [
    { label: content.value.general.id, value: editableMachine.id },
    { label: content.value.general.name, value: machineNameLabel(editableMachine.name) },
    { label: content.value.general.type, value: optionLabel(editableMachine.type) },
    { label: content.value.general.line, value: productionLineLabel(editableMachine.line) },
    { label: content.value.general.department, value: optionLabel(editableMachine.department) },
    { label: content.value.general.manufacturer, value: editableMachine.manufacturer },
    { label: content.value.general.model, value: editableMachine.model },
    { label: content.value.general.serialNumber, value: editableMachine.serialNumber },
    { label: content.value.general.commissioningDate, value: editableMachine.commissioningDate },
    { label: content.value.general.location, value: optionLabel(editableMachine.location) },
    { label: content.value.general.status, value: optionLabel(editableMachine.status) },
    { label: content.value.general.criticality, value: optionLabel(editableMachine.criticality) },
    { label: content.value.general.description, value: optionLabel(editableMachine.description) },
  ]
})

const kpis = computed(() => {
  if (!machine.value) return []

  return [
    { label: content.value.kpis.availability, value: editableMachine.availability },
    { label: content.value.kpis.mtbf, value: editableMachine.mtbf },
    { label: content.value.kpis.mttr, value: editableMachine.mttr },
    { label: content.value.kpis.breakdownCount, value: editableMachine.breakdownCount },
    { label: content.value.kpis.downtime, value: editableMachine.downtime },
    { label: content.value.kpis.interventionCount, value: editableMachine.interventionCount },
    { label: content.value.kpis.maintenanceCost, value: editableMachine.maintenanceCost },
  ]
})

const editFields = computed(() => [
  { key: 'name', label: content.value.editFields.name },
  { key: 'line', label: content.value.editFields.line },
  { key: 'type', label: content.value.editFields.type },
  { key: 'department', label: content.value.editFields.department },
  { key: 'manufacturer', label: content.value.editFields.manufacturer },
  { key: 'model', label: content.value.editFields.model },
  { key: 'serialNumber', label: content.value.editFields.serialNumber },
  { key: 'commissioningDate', label: content.value.editFields.commissioningDate },
  { key: 'location', label: content.value.editFields.location },
  {
    key: 'status',
    label: content.value.editFields.status,
    type: 'select',
    options: [
      { value: 'En service', label: optionLabel('En service') },
      { value: 'En panne', label: optionLabel('En panne') },
      { value: 'Sous surveillance', label: optionLabel('Sous surveillance') },
      { value: 'Arrêtée', label: optionLabel('Arrêtée') },
    ],
  },
  {
    key: 'criticality',
    label: content.value.editFields.criticality,
    type: 'select',
    options: [
      { value: 'Faible', label: optionLabel('Faible') },
      { value: 'Moyenne', label: optionLabel('Moyenne') },
      { value: 'Haute', label: optionLabel('Haute') },
    ],
  },
  { key: 'description', label: content.value.editFields.description, type: 'textarea' },
  { key: 'imageUrl', label: content.value.editFields.photo || 'Photo' },
  { key: 'availability', label: content.value.editFields.availability },
  { key: 'mtbf', label: content.value.editFields.mtbf },
  { key: 'mttr', label: content.value.editFields.mttr },
  { key: 'breakdownCount', label: content.value.editFields.breakdownCount, type: 'number' },
  { key: 'downtime', label: content.value.editFields.downtime },
  { key: 'interventionCount', label: content.value.editFields.interventionCount, type: 'number' },
  { key: 'maintenanceCost', label: content.value.editFields.maintenanceCost },
])

watch(
  machine,
  (machineValue) => {
    if (machineValue) {
      syncMachine(editableMachine, machineValue)
      syncMachine(draftMachine, machineValue)
    }
  },
  { immediate: true },
)

const InfoItem = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
  setup(props) {
    return () =>
      h('article', { class: 'info-item' }, [
        h('span', props.label),
        h('strong', props.value),
      ])
  },
})

const DataTable = defineComponent({
  props: {
    columns: { type: Array, required: true },
    rows: { type: Array, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'details-table-wrap' }, [
        h('table', { class: 'details-table' }, [
          h('thead', [
            h(
              'tr',
              props.columns.map((column) => h('th', column[1])),
            ),
          ]),
          h(
            'tbody',
            props.rows.map((row) =>
              h(
                'tr',
                props.columns.map((column) => h('td', translateDetailValue(row[column[0]]))),
              ),
            ),
          ),
        ]),
      ])
  },
})

const DocumentsTable = defineComponent({
  props: {
    columns: { type: Array, required: true },
    rows: { type: Array, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'details-table-wrap' }, [
        h('table', { class: 'details-table documents-table' }, [
          h('thead', [
            h(
              'tr',
              props.columns.map((column) => h('th', column[1])),
            ),
          ]),
          h(
            'tbody',
            props.rows.map((row) =>
              h('tr', [
                h('td', translateDetailValue(row.type)),
                h('td', [
                  h(
                    'a',
                    {
                      class: 'document-name-link',
                      href: row.url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    },
                    translateDetailValue(row.name),
                  ),
                ]),
                h('td', row.date),
                h('td', [
                  h(
                    'a',
                    {
                      class: 'document-open-link',
                      href: row.url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    },
                    documentOpenLabel(),
                  ),
                ]),
              ]),
            ),
          ),
        ]),
      ])
  },
})

const machineNameLabels = {
  "Tour d'usinage": { EN: 'CNC lathe', AR: 'مخرطة صناعية' },
  'Presse hydraulique': { EN: 'Hydraulic press', AR: 'مكبس هيدروليكي' },
  'Convoyeur à bande': { EN: 'Belt conveyor', AR: 'ناقل بسير' },
  "Compresseur d'air": { EN: 'Air compressor', AR: 'ضاغط هواء' },
}

const productionLineLabels = {
  'Ligne Production 1': { EN: 'Production Line 1', AR: 'خط الإنتاج 1' },
  'Ligne Production 2': { EN: 'Production Line 2', AR: 'خط الإنتاج 2' },
  'Ligne Conditionnement': { EN: 'Packaging Line', AR: 'خط التعبئة' },
  'Ligne Utilités': { EN: 'Utilities Line', AR: 'خط المرافق' },
}

const valueLabels = {
  Production: { EN: 'Production', AR: 'الإنتاج' },
  Conditionnement: { EN: 'Packaging', AR: 'التعبئة' },
  Maintenance: { EN: 'Maintenance', AR: 'الصيانة' },
  Usinage: { EN: 'Machining', AR: 'التشغيل الميكانيكي' },
  Pressage: { EN: 'Pressing', AR: 'الكبس' },
  Convoyage: { EN: 'Conveying', AR: 'النقل' },
  Utilités: { EN: 'Utilities', AR: 'المرافق' },
  'Atelier A': { EN: 'Workshop A', AR: 'الورشة أ' },
  'Atelier B': { EN: 'Workshop B', AR: 'الورشة ب' },
  'Zone conditionnement': { EN: 'Packaging area', AR: 'منطقة التعبئة' },
  'Local technique': { EN: 'Technical room', AR: 'الغرفة التقنية' },
  'En service': { EN: 'In service', AR: 'في الخدمة' },
  'En panne': { EN: 'Down', AR: 'معطلة' },
  'Sous surveillance': { EN: 'Under monitoring', AR: 'تحت المراقبة' },
  Arrêtée: { EN: 'Stopped', AR: 'متوقفة' },
  Faible: { EN: 'Low', AR: 'منخفضة' },
  Moyenne: { EN: 'Medium', AR: 'متوسطة' },
  Haute: { EN: 'High', AR: 'مرتفعة' },
  "Machine de tournage utilisée pour les pièces mécaniques de précision.": {
    EN: 'Turning machine used for precision mechanical parts.',
    AR: 'آلة خراطة مخصصة للقطع الميكانيكية الدقيقة.',
  },
  'Presse hydraulique centrale pour les opérations de formage et assemblage.': {
    EN: 'Central hydraulic press for forming and assembly operations.',
    AR: 'مكبس هيدروليكي رئيسي لعمليات التشكيل والتركيب.',
  },
  'Convoyeur principal pour le transfert des produits finis vers la zone emballage.': {
    EN: 'Main conveyor for transferring finished products to the packaging area.',
    AR: 'ناقل رئيسي لنقل المنتجات النهائية إلى منطقة التعبئة.',
  },
  "Compresseur alimentant le réseau d'air comprimé de l'usine.": {
    EN: "Compressor supplying the plant's compressed air network.",
    AR: 'ضاغط يزود شبكة الهواء المضغوط في المصنع.',
  },
  Nabil: { AR: 'نبيل' },
  Ahmed: { AR: 'أحمد' },
  Youssef: { AR: 'يوسف' },
  Sara: { AR: 'سارة' },
  'Karim El Fassi': { AR: 'كريم الفاسي' },
  'Meryem Alaoui': { AR: 'مريم العلوي' },
  'Intervention corrective': { EN: 'Corrective intervention', AR: 'تدخل تصحيحي' },
  'Intervention préventive': { EN: 'Preventive intervention', AR: 'تدخل وقائي' },
  Terminée: { EN: 'Completed', AR: 'منتهية' },
  'Remplacement joint hydraulique et test pression.': {
    EN: 'Hydraulic seal replacement and pressure test.',
    AR: 'استبدال مانع التسرب الهيدروليكي واختبار الضغط.',
  },
  'Contrôle niveau huile, serrage et nettoyage capteurs.': {
    EN: 'Oil level check, tightening, and sensor cleaning.',
    AR: 'فحص مستوى الزيت، الشد، وتنظيف الحساسات.',
  },
  'Fuite hydraulique': { EN: 'Hydraulic leak', AR: 'تسرب هيدروليكي' },
  Surchauffe: { EN: 'Overheating', AR: 'ارتفاع الحرارة' },
  'Perte de pression pendant le cycle de pressage.': {
    EN: 'Pressure loss during the pressing cycle.',
    AR: 'فقدان الضغط أثناء دورة الكبس.',
  },
  'Température huile supérieure au seuil.': {
    EN: 'Oil temperature above threshold.',
    AR: 'درجة حرارة الزيت فوق الحد المسموح.',
  },
  'Joint usé sur le vérin principal': {
    EN: 'Worn seal on the main cylinder',
    AR: 'مانع تسرب متآكل في الأسطوانة الرئيسية',
  },
  'Filtre colmaté': { EN: 'Clogged filter', AR: 'فلتر مسدود' },
  'Joint remplacé, circuit purgé et pression stabilisée.': {
    EN: 'Seal replaced, circuit purged, and pressure stabilized.',
    AR: 'تم استبدال مانع التسرب، تفريغ الدارة، وتثبيت الضغط.',
  },
  'Filtre remplacé et radiateur nettoyé.': {
    EN: 'Filter replaced and radiator cleaned.',
    AR: 'تم استبدال الفلتر وتنظيف المبرد.',
  },
  Résolue: { EN: 'Resolved', AR: 'محلولة' },
  'Contrôle hydraulique mensuel': { EN: 'Monthly hydraulic check', AR: 'فحص هيدروليكي شهري' },
  Mensuelle: { EN: 'Monthly', AR: 'شهري' },
  'Inspection sécurité': { EN: 'Safety inspection', AR: 'فحص السلامة' },
  Trimestrielle: { EN: 'Quarterly', AR: 'ربع سنوي' },
  'Huile, pression, capteurs, sécurité': {
    EN: 'Oil, pressure, sensors, safety',
    AR: 'الزيت، الضغط، الحساسات، السلامة',
  },
  'Arrêts urgence, carters, signalisations': {
    EN: 'Emergency stops, guards, signage',
    AR: 'إيقاف الطوارئ، الأغطية، الإشارات',
  },
  Planifié: { EN: 'Planned', AR: 'مخطط' },
  'À venir': { EN: 'Upcoming', AR: 'قادم' },
  'Joint hydraulique': { EN: 'Hydraulic seal', AR: 'مانع تسرب هيدروليكي' },
  'Filtre huile': { EN: 'Oil filter', AR: 'فلتر زيت' },
  "Manuel d'utilisation": { EN: 'User manual', AR: 'دليل الاستعمال' },
  'Fiche technique': { EN: 'Technical sheet', AR: 'بطاقة تقنية' },
  Photo: { EN: 'Photo', AR: 'صورة' },
  'Consignes de sécurité': { EN: 'Safety instructions', AR: 'تعليمات السلامة' },
  'Manuel maintenance machine.pdf': { EN: 'Machine maintenance manual.pdf', AR: 'دليل صيانة الآلة.pdf' },
  'Fiche technique machine.pdf': { EN: 'Machine technical sheet.pdf', AR: 'البطاقة التقنية للآلة.pdf' },
  'Photo zone machine.svg': { EN: 'Machine area photo.svg', AR: 'صورة منطقة الآلة.svg' },
  'Consignes sécurité machine.pdf': { EN: 'Machine safety instructions.pdf', AR: 'تعليمات سلامة الآلة.pdf' },
  'Panne signalée': { EN: 'Breakdown reported', AR: 'تم التبليغ عن عطل' },
  'Fuite hydraulique déclarée par opérateur.': {
    EN: 'Hydraulic leak reported by operator.',
    AR: 'تم التصريح بتسرب هيدروليكي من طرف المشغل.',
  },
  'Intervention créée': { EN: 'Intervention created', AR: 'تم إنشاء تدخل' },
  'Nabil affecté à la corrective.': { EN: 'Nabil assigned to corrective work.', AR: 'تم تعيين نبيل للتدخل التصحيحي.' },
  'Pièce remplacée': { EN: 'Part replaced', AR: 'تم استبدال قطعة' },
  'Joint hydraulique JH-400-22 utilisé.': {
    EN: 'Hydraulic seal JH-400-22 used.',
    AR: 'تم استعمال مانع التسرب الهيدروليكي JH-400-22.',
  },
  'Statut modifié': { EN: 'Status updated', AR: 'تم تغيير الحالة' },
  'Machine remise en service après validation.': {
    EN: 'Machine returned to service after validation.',
    AR: 'تمت إعادة الآلة إلى الخدمة بعد التحقق.',
  },
}

function mergeContent(base, override) {
  return Object.entries(override).reduce(
    (merged, [key, value]) => ({
      ...merged,
      [key]:
        Array.isArray(value)
          ? value
          : value && typeof value === 'object'
            ? mergeContent(base[key] || {}, value)
            : value,
    }),
    { ...base },
  )
}

function machineNameLabel(name) {
  return machineNameLabels[name]?.[language.value] || name
}

function productionLineLabel(line) {
  return productionLineLabels[line]?.[language.value] || line
}

function optionLabel(value) {
  return valueLabels[value]?.[language.value] || value
}

function translateDetailValue(value) {
  const durationMatch = String(value).match(/^(\d+)\s+h\s+(\d+)$/)

  if (durationMatch) {
    if (language.value === 'AR') return `${durationMatch[1]} س ${durationMatch[2]} د`
    if (language.value === 'EN') return `${durationMatch[1]}h ${durationMatch[2]}m`
  }

  return optionLabel(value)
}

function documentOpenLabel() {
  return language.value === 'AR' ? 'فتح' : language.value === 'EN' ? 'Open' : 'Ouvrir'
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function openEditModal() {
  syncMachine(draftMachine, editableMachine)
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function saveMachine() {
  syncMachine(editableMachine, {
    ...draftMachine,
    statusTone: getStatusTone(draftMachine.status),
    criticalityTone: getCriticalityTone(draftMachine.criticality),
    breakdownCount: Number(draftMachine.breakdownCount),
    interventionCount: Number(draftMachine.interventionCount),
  })
  closeEditModal()
}

function syncMachine(target, source) {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })
  Object.assign(target, source)
}

function getStatusTone(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus.includes('panne') || normalizedStatus.includes('arrêtée') || normalizedStatus.includes('arretee')) return 'danger'
  if (normalizedStatus.includes('surveillance')) return 'warning'
  return 'healthy'
}

function getCriticalityTone(criticality) {
  const normalizedCriticality = String(criticality || '').toLowerCase()

  if (normalizedCriticality.includes('haute')) return 'high'
  if (normalizedCriticality.includes('moyenne')) return 'medium'
  return 'healthy'
}
</script>

<style scoped>
.machine-layout {
  min-height: 100vh;
  background: var(--sc-bg);
  color: var(--sc-dark);
}

.machine-page {
  min-height: 100vh;
  padding: 28px 28px 48px 88px;
}

[dir='rtl'] .machine-page {
  padding-right: 88px;
  padding-left: 28px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 18px;
  color: var(--sc-primary);
  font-size: 14px;
  font-weight: 950;
  text-decoration: none;
}

.machine-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
}

.machine-hero-photo {
  width: 180px;
  height: 128px;
  flex: 0 0 180px;
  object-fit: cover;
  border: 1px solid var(--sc-border);
  border-radius: 14px;
  background: var(--sc-bg);
}

.machine-hero p {
  margin: 0 0 8px;
  color: var(--sc-muted);
  font-size: 13px;
  font-weight: 950;
  text-transform: uppercase;
}

.machine-hero h1 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 30px;
  font-weight: 950;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.hero-meta > span,
.status-pill {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--sc-bg);
  color: var(--sc-muted);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 900;
}

.status-pill.healthy {
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.status-pill.warning {
  background: var(--sc-soft-warning);
  color: var(--sc-warning);
}

.status-pill.medium {
  background: var(--sc-soft-attention);
  color: var(--sc-attention);
}

.status-pill.danger,
.status-pill.high {
  background: var(--sc-soft-danger);
  color: var(--sc-danger);
}

.edit-button {
  min-height: 42px;
  border: 0;
  border-radius: 12px;
  background: var(--sc-primary);
  color: var(--sc-surface);
  padding: 0 16px;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
  white-space: nowrap;
}

.tabs {
  display: flex;
  gap: 10px;
  margin: 22px 0 0;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tabs button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--sc-border);
  border-radius: 12px;
  background: var(--sc-surface);
  color: var(--sc-muted);
  padding: 0 14px;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  white-space: nowrap;
}

.tabs button.active {
  border-color: var(--sc-secondary);
  background: var(--sc-soft-secondary);
  color: var(--sc-primary);
}

.tab-panel {
  margin-top: 14px;
  padding: 22px;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  box-shadow: var(--sc-shadow);
}

.info-grid,
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

:deep(.info-item),
.kpi-grid article {
  min-height: 92px;
  border: 1px solid var(--sc-border);
  border-radius: 14px;
  background: var(--sc-bg);
  padding: 15px;
}

:deep(.info-item span),
.kpi-grid span {
  display: block;
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 950;
}

:deep(.info-item strong),
.kpi-grid strong {
  display: block;
  margin-top: 8px;
  color: var(--sc-dark);
  font-size: 15px;
  font-weight: 950;
  line-height: 1.35;
}

.kpi-grid strong {
  font-size: 24px;
}

:deep(.details-table-wrap) {
  overflow-x: auto;
}

:deep(.details-table) {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

:deep(.details-table th),
:deep(.details-table td) {
  padding: 14px;
  border-bottom: 1px solid var(--sc-border);
  text-align: left;
  font-size: 13px;
}

[dir='rtl'] :deep(.details-table th),
[dir='rtl'] :deep(.details-table td) {
  text-align: right;
}

:deep(.details-table th) {
  background: var(--sc-bg);
  color: var(--sc-muted);
  font-weight: 950;
}

:deep(.details-table td) {
  color: var(--sc-dark);
  font-weight: 760;
  vertical-align: top;
}

:deep(.document-name-link) {
  color: var(--sc-dark);
  font-weight: 900;
  text-decoration-color: rgba(106, 154, 42, 0.45);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

:deep(.document-name-link:hover) {
  color: var(--sc-primary);
}

:deep(.document-open-link) {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(106, 154, 42, 0.28);
  border-radius: 10px;
  background: var(--sc-soft-primary);
  color: var(--sc-primary);
  padding: 0 12px;
  font-size: 12px;
  font-weight: 950;
  text-decoration: none;
}

:deep(.document-open-link:hover) {
  background: var(--sc-primary);
  color: var(--sc-surface);
}

.preventive-panel {
  display: grid;
  grid-template-columns: minmax(220px, 0.82fr) minmax(280px, 1.18fr);
  overflow: hidden;
  border: 1px solid var(--sc-border);
  border-radius: 16px;
  background: var(--sc-surface);
}

.preventive-card {
  min-height: 240px;
  padding: 20px;
}

.preventive-card + .preventive-card {
  border-left: 1px solid var(--sc-border);
}

[dir='rtl'] .preventive-card + .preventive-card {
  border-right: 1px solid var(--sc-border);
  border-left: 0;
}

.preventive-card h3 {
  margin: 0;
  color: var(--sc-dark);
  font-size: 14px;
  font-weight: 950;
}

.week-planning {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.calendar-icon {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 34px 0 12px;
  border: 2px solid rgba(106, 154, 42, 0.28);
  border-radius: 14px;
  background: var(--sc-soft-primary);
  color: var(--sc-primary);
  font-size: 30px;
  font-weight: 950;
  line-height: 1;
}

.week-planning strong {
  color: var(--sc-dark);
  font-size: 42px;
  font-weight: 950;
  line-height: 1;
}

.week-planning p {
  width: min(150px, 100%);
  margin: 10px auto 0;
  color: var(--sc-muted);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
}

.due-list ul {
  display: grid;
  gap: 14px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.due-list li {
  display: grid;
  gap: 3px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--sc-border);
}

.due-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.due-list strong {
  color: var(--sc-dark);
  font-size: 13px;
  font-weight: 950;
}

.due-list span {
  color: var(--sc-primary);
  font-size: 12px;
  font-weight: 950;
}

.due-list small {
  color: var(--sc-muted);
  font-size: 12px;
  font-weight: 750;
}

.planning-link {
  grid-column: 1 / -1;
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-top: 1px solid var(--sc-border);
  background: var(--sc-surface);
  color: var(--sc-primary);
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
}

.planning-link:hover {
  background: var(--sc-soft-primary);
}

.full-planning {
  grid-column: 1 / -1;
  border-top: 1px solid var(--sc-border);
  background: var(--sc-surface);
  padding: 14px;
}

.full-planning :deep(.details-table) {
  min-width: 760px;
}

.activity-list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-list li {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 12px;
}

.activity-list li > span {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 999px;
  background: var(--sc-primary);
  box-shadow: 0 0 0 5px var(--sc-soft-secondary);
}

.activity-list strong {
  color: var(--sc-dark);
  font-size: 15px;
  font-weight: 950;
}

.activity-list p {
  margin: 4px 0;
  color: var(--sc-muted);
  font-size: 13px;
  font-weight: 750;
}

.activity-list small {
  color: rgba(74, 10, 10, 0.42);
  font-size: 12px;
  font-weight: 850;
}

.not-found {
  padding: 24px;
  border-radius: 18px;
  background: var(--sc-surface);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  background: rgba(74, 10, 10, 0.34);
  padding: 24px;
}

.machine-modal {
  width: min(980px, 100%);
  max-height: min(860px, calc(100vh - 48px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--sc-border);
  border-radius: 18px;
  background: var(--sc-surface);
  box-shadow: 0 24px 70px rgba(74, 10, 10, 0.22);
}

.machine-modal header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--sc-border);
}

.machine-modal header p {
  margin: 0 0 6px;
  color: var(--sc-primary);
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
}

.machine-modal h2 {
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

.edit-form input:focus,
.edit-form select:focus,
.edit-form textarea:focus {
  border-color: rgba(106, 154, 42, 0.42);
  box-shadow: 0 0 0 4px var(--sc-soft-secondary);
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

.save-button {
  border: 0;
  background: var(--sc-primary);
  color: var(--sc-surface);
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

:global(:root[data-theme='dark']) .machine-layout {
  background: #10170d;
}

:global(:root[data-theme='dark']) .machine-hero,
:global(:root[data-theme='dark']) .tab-panel,
:global(:root[data-theme='dark']) .tabs button,
:global(:root[data-theme='dark']) .not-found,
:global(:root[data-theme='dark']) .machine-modal {
  border-color: rgba(215, 236, 120, 0.18);
  background: #172112;
}

:global(:root[data-theme='dark']) .machine-hero h1,
:global(:root[data-theme='dark']) .machine-modal h2,
:global(:root[data-theme='dark']) :deep(.info-item strong),
:global(:root[data-theme='dark']) .kpi-grid strong,
:global(:root[data-theme='dark']) :deep(.details-table td),
:global(:root[data-theme='dark']) .activity-list strong {
  color: #f6ffe8;
}

:global(:root[data-theme='dark']) :deep(.info-item),
:global(:root[data-theme='dark']) .kpi-grid article {
  border-color: rgba(215, 236, 120, 0.16);
  background: #111a0d;
}

:global(:root[data-theme='dark']) .preventive-panel,
:global(:root[data-theme='dark']) .planning-link {
  border-color: rgba(215, 236, 120, 0.18);
  background: #172112;
}

@media (max-width: 900px) {
  .machine-page,
  [dir='rtl'] .machine-page {
    padding: 88px 16px 32px;
  }

  .machine-hero {
    flex-direction: column;
  }

  .machine-hero-photo {
    width: 100%;
    height: 190px;
    flex-basis: auto;
  }

  .machine-hero h1 {
    font-size: 24px;
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

  .preventive-panel {
    grid-template-columns: 1fr;
  }

  .preventive-card + .preventive-card {
    border-top: 1px solid var(--sc-border);
    border-left: 0;
  }

  [dir='rtl'] .preventive-card + .preventive-card {
    border-right: 0;
  }
}
</style>
