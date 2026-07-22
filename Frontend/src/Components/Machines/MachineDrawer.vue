<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="drawer-overlay" @click.self="$emit('close')">
        <aside class="drawer" :dir="pageDirection">
          <header class="drawer-header">
            <div>
              <span dir="ltr">{{ machine?.id }}</span>
              <h2>{{ displayMachineName(machine?.name) }}</h2>
            </div>
            <button type="button" class="close-button" :aria-label="content.close" @click="$emit('close')">x</button>
          </header>

          <nav class="drawer-tabs">
            <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
              {{ tab.label }}
            </button>
          </nav>

          <div v-if="machine" class="drawer-body">
            <img class="machine-cover" :src="machine.imageUrl || fallbackImage" :alt="displayMachineName(machine.name)" />

            <section v-if="activeTab === 'info'">
              <h3>{{ content.info }}</h3>
              <div class="details-grid">
                <div><span>{{ content.machineId }}</span><strong dir="ltr">{{ machine.id }}</strong></div>
                <div><span>{{ content.name }}</span><strong>{{ displayMachineName(machine.name) }}</strong></div>
                <div><span>{{ content.category }}</span><strong>{{ translate('categories', machine.category) }}</strong></div>
                <div><span>{{ content.line }}</span><strong>{{ translate('lines', machine.line) }}</strong></div>
                <div><span>{{ content.manufacturer }}</span><strong dir="ltr">{{ machine.manufacturer }}</strong></div>
                <div><span>{{ content.model }}</span><strong dir="ltr">{{ machine.model }}</strong></div>
                <div><span>{{ content.serial }}</span><strong dir="ltr">{{ machine.serialNumber }}</strong></div>
                <div><span>{{ content.commissioning }}</span><strong dir="ltr">{{ machine.commissioningDate }}</strong></div>
                <div><span>{{ content.location }}</span><strong>{{ translate('locations', machine.location) }}</strong></div>
                <div><span>{{ content.criticality }}</span><MachineCriticalityBadge :criticality="machine.criticality" /></div>
                <div><span>{{ content.currentStatus }}</span><MachineStatusBadge :status="machine.status" /></div>
              </div>
            </section>

            <section v-if="activeTab === 'performance'">
              <h3>{{ content.performance }}</h3>
              <div class="details-grid">
                <div><span>{{ content.availability }}</span><strong dir="ltr">{{ machine.availability }} %</strong></div>
                <div><span>MTBF</span><strong dir="ltr">{{ machine.mtbf }}</strong></div>
                <div><span>MTTR</span><strong dir="ltr">{{ machine.mttr }}</strong></div>
                <div><span>{{ content.breakdownsMonth }}</span><strong>{{ machine.breakdownCount }}</strong></div>
                <div><span>{{ content.interventions }}</span><strong>{{ machine.interventionCount }}</strong></div>
                <div><span>{{ content.downtime }}</span><strong dir="ltr">{{ machine.downtime }}</strong></div>
              </div>
            </section>

            <section v-if="activeTab === 'interventions'">
              <h3>{{ content.interventions }}</h3>
              <div v-for="item in machine.interventions" :key="item.id" class="list-row">
                <strong><span dir="ltr">{{ item.id }}</span> - {{ translate('interventionTypes', item.type) }}</strong>
                <span>{{ translate('names', item.technician) }} - <bdi dir="ltr">{{ item.date }}</bdi> - {{ translate('statuses', item.status) }}</span>
              </div>
            </section>

            <section v-if="activeTab === 'preventive'">
              <h3>{{ content.preventive }}</h3>
              <div class="details-grid">
                <div><span>{{ content.activePlan }}</span><strong>{{ translate('plans', machine.preventive.plan) }}</strong></div>
                <div><span>{{ content.frequency }}</span><strong>{{ translate('frequencies', machine.preventive.frequency) }}</strong></div>
                <div><span>{{ content.lastDone }}</span><strong dir="ltr">{{ machine.preventive.last }}</strong></div>
                <div><span>{{ content.nextDue }}</span><strong dir="ltr">{{ machine.preventive.next }}</strong></div>
                <div><span>{{ content.owner }}</span><strong>{{ translate('names', machine.preventive.owner) }}</strong></div>
                <div><span>{{ content.status }}</span><strong>{{ translate('statuses', machine.preventive.status) }}</strong></div>
              </div>
            </section>

            <section v-if="activeTab === 'breakdowns'">
              <h3>{{ content.breakdowns }}</h3>
              <div v-for="item in machine.breakdowns" :key="item.date" class="list-row">
                <strong><span dir="ltr">{{ item.date }}</span> - {{ translate('breakdownTypes', item.type) }}</strong>
                <span>{{ translate('descriptions', item.description) }} - <bdi dir="ltr">{{ item.downtime }}</bdi> - {{ translate('statuses', item.status) }}</span>
              </div>
            </section>

            <section v-if="activeTab === 'parts'">
              <h3>{{ content.parts }}</h3>
              <div v-for="part in machine.parts" :key="part.reference" class="list-row">
                <strong><span dir="ltr">{{ part.reference }}</span> - {{ translate('partsNames', part.name) }}</strong>
                <span>{{ content.stock }} <bdi dir="ltr">{{ part.stock }}</bdi> - {{ translate('availability', part.availability) }}</span>
              </div>
            </section>

            <section v-if="activeTab === 'documents'">
              <h3>{{ content.documents }}</h3>
              <button v-for="document in documents" :key="document" type="button" class="document-row">{{ document }}</button>
            </section>
          </div>

          <footer class="drawer-footer">
            <button type="button" class="secondary-button" @click="$emit('edit', machine)">{{ content.edit }}</button>
            <button type="button" class="primary-button" @click="$emit('intervention', machine)">{{ content.createIntervention }}</button>
            <button type="button" class="secondary-button" @click="$emit('plan', machine)">{{ content.planMaintenance }}</button>
            <button type="button" class="secondary-button">{{ content.print }}</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import MachineCriticalityBadge from '@/Components/Machines/MachineCriticalityBadge.vue'
import MachineStatusBadge from '@/Components/Machines/MachineStatusBadge.vue'
import { useLanguageStore } from '@/stores/language'

defineProps({ open: Boolean, machine: { type: Object, default: null } })
defineEmits(['close', 'edit', 'intervention', 'plan'])

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const pageDirection = computed(() => (language.value === 'AR' ? 'rtl' : 'ltr'))
const activeTab = ref('info')
const fallbackImage = '/documents/machines/common/photo-zone-machine.svg'

const labels = {
  FR: {
    close: 'Fermer',
    info: 'Informations',
    performance: 'Performance',
    interventions: 'Interventions',
    preventive: 'Preventif',
    breakdowns: 'Pannes',
    parts: 'Pieces',
    documents: 'Documents',
    machineId: 'ID machine',
    name: 'Nom',
    category: 'Categorie',
    line: 'Ligne',
    manufacturer: 'Fabricant',
    model: 'Modele',
    serial: 'N serie',
    commissioning: 'Mise en service',
    location: 'Localisation',
    criticality: 'Criticite',
    currentStatus: 'Etat actuel',
    availability: 'Disponibilite',
    breakdownsMonth: 'Pannes ce mois',
    downtime: 'Arret cumule',
    activePlan: 'Plan actif',
    frequency: 'Frequence',
    lastDone: 'Derniere realisation',
    nextDue: 'Prochaine echeance',
    owner: 'Responsable',
    status: 'Statut',
    stock: 'Stock',
    edit: 'Modifier',
    createIntervention: 'Creer une intervention',
    planMaintenance: 'Planifier maintenance',
    print: 'Imprimer la fiche',
  },
  EN: {
    close: 'Close',
    info: 'Information',
    performance: 'Performance',
    interventions: 'Interventions',
    preventive: 'Preventive',
    breakdowns: 'Breakdowns',
    parts: 'Parts',
    documents: 'Documents',
    machineId: 'Machine ID',
    name: 'Name',
    category: 'Category',
    line: 'Line',
    manufacturer: 'Manufacturer',
    model: 'Model',
    serial: 'Serial No.',
    commissioning: 'Commissioning',
    location: 'Location',
    criticality: 'Criticality',
    currentStatus: 'Current status',
    availability: 'Availability',
    breakdownsMonth: 'Breakdowns this month',
    downtime: 'Total downtime',
    activePlan: 'Active plan',
    frequency: 'Frequency',
    lastDone: 'Last completion',
    nextDue: 'Next due date',
    owner: 'Owner',
    status: 'Status',
    stock: 'Stock',
    edit: 'Edit',
    createIntervention: 'Create intervention',
    planMaintenance: 'Plan maintenance',
    print: 'Print sheet',
  },
  AR: {
    close: 'إغلاق',
    info: 'المعلومات',
    performance: 'الأداء',
    interventions: 'التدخلات',
    preventive: 'الوقائية',
    breakdowns: 'الأعطال',
    parts: 'القطع',
    documents: 'الوثائق',
    machineId: 'معرف الآلة',
    name: 'الاسم',
    category: 'الفئة',
    line: 'الخط',
    manufacturer: 'المصنع',
    model: 'النموذج',
    serial: 'رقم السلسلة',
    commissioning: 'تاريخ التشغيل',
    location: 'الموقع',
    criticality: 'درجة الحرج',
    currentStatus: 'الحالة الحالية',
    availability: 'التوفر',
    breakdownsMonth: 'الأعطال هذا الشهر',
    downtime: 'التوقف المتراكم',
    activePlan: 'الخطة النشطة',
    frequency: 'التواتر',
    lastDone: 'آخر إنجاز',
    nextDue: 'الموعد القادم',
    owner: 'المسؤول',
    status: 'الحالة',
    stock: 'المخزون',
    edit: 'تعديل',
    createIntervention: 'إنشاء تدخل',
    planMaintenance: 'برمجة صيانة',
    print: 'طباعة البطاقة',
  },
}

const dictionaries = {
  EN: {
    names: {},
    categories: { Mecanique: 'Mechanical', Hydraulique: 'Hydraulic', Electrique: 'Electrical', Pneumatique: 'Pneumatic', Conditionnement: 'Packaging', Utilites: 'Utilities' },
    lines: { 'Ligne Production 1': 'Production line 1', 'Ligne Production 2': 'Production line 2', 'Ligne Conditionnement': 'Packaging line', 'Ligne Utilites': 'Utilities line' },
    locations: { 'Atelier A': 'Workshop A', 'Atelier B': 'Workshop B', 'Local technique': 'Technical room' },
    statuses: { 'En service': 'In service', 'En maintenance': 'Under maintenance', 'En panne': 'Down', 'Hors service': 'Out of service', Arretee: 'Stopped', Terminee: 'Completed', 'En cours': 'In progress', Planifie: 'Planned', Planifiee: 'Planned', Resolue: 'Resolved', 'A venir': 'Upcoming', 'En retard': 'Late' },
    interventionTypes: { Corrective: 'Corrective', Preventive: 'Preventive' },
    breakdownTypes: { Electrique: 'Electrical', Mecanique: 'Mechanical', Pneumatique: 'Pneumatic', 'Arret automatique': 'Automatic stop' },
    descriptions: { 'Controle requis': 'Inspection required' },
    frequencies: { Mensuelle: 'Monthly', Hebdomadaire: 'Weekly', Trimestrielle: 'Quarterly' },
    plans: { 'Controle mensuel': 'Monthly inspection' },
    partsNames: {},
    availability: { Disponible: 'Available', 'Stock faible': 'Low stock', Rupture: 'Out of stock' },
  },
  AR: {
    names: { Sara: 'سارة', Karim: 'كريم', Nabil: 'نبيل', Youssef: 'يوسف', Ahmed: 'أحمد' },
    categories: { Mecanique: 'ميكانيكية', Hydraulique: 'هيدروليكية', Electrique: 'كهربائية', Pneumatique: 'هوائية', Conditionnement: 'التعبئة', Utilites: 'المرافق' },
    lines: { 'Ligne Production 1': 'خط الإنتاج 1', 'Ligne Production 2': 'خط الإنتاج 2', 'Ligne Conditionnement': 'خط التكييف', 'Ligne Utilites': 'خط المرافق' },
    locations: { 'Atelier A': 'الورشة A', 'Atelier B': 'الورشة B', 'Local technique': 'الغرفة التقنية' },
    statuses: { 'En service': 'في الخدمة', 'En maintenance': 'في الصيانة', 'En panne': 'في عطل', 'Hors service': 'خارج الخدمة', Arretee: 'متوقفة', Terminee: 'منتهية', 'En cours': 'قيد الإنجاز', Planifie: 'مبرمجة', Planifiee: 'مبرمجة', Resolue: 'محلولة', 'A venir': 'قادمة', 'En retard': 'متأخرة' },
    interventionTypes: { Corrective: 'تصحيحية', Preventive: 'وقائية' },
    breakdownTypes: { Electrique: 'كهربائي', Mecanique: 'ميكانيكي', Pneumatique: 'هوائي', 'Arret automatique': 'توقف تلقائي' },
    descriptions: { 'Controle requis': 'مراقبة مطلوبة' },
    frequencies: { Mensuelle: 'شهرية', Hebdomadaire: 'أسبوعية', Trimestrielle: 'ربع سنوية' },
    plans: { 'Controle mensuel': 'مراقبة شهرية' },
    partsNames: { 'Filtre a huile': 'مرشح الزيت', 'Roulement SKF 6205': 'محمل SKF 6205', Courroie: 'حزام' },
    availability: { Disponible: 'متوفر', 'Stock faible': 'مخزون منخفض', Rupture: 'نفاد المخزون' },
  },
}

const translatedNames = {
  EN: {
    "Tour d'usinage": 'Machining lathe',
    'Presse hydraulique': 'Hydraulic press',
    'Convoyeur a bande': 'Belt conveyor',
    "Compresseur d'air": 'Air compressor',
    'Etiqueteuse automatique': 'Automatic labeler',
  },
  AR: {
    "Tour d'usinage": 'مخرطة تصنيع',
    'Presse hydraulique': 'مكبس هيدروليكي',
    'Convoyeur a bande': 'ناقل بالحزام',
    "Compresseur d'air": 'ضاغط هواء',
    'Etiqueteuse automatique': 'آلة وسم أوتوماتيكية',
  },
}

const documentsMap = {
  FR: ['Fiche technique', 'Manuel constructeur', 'Photo', 'Certificat', 'Rapport de maintenance'],
  EN: ['Technical sheet', 'Manufacturer manual', 'Photo', 'Certificate', 'Maintenance report'],
  AR: ['الملف التقني', 'دليل المصنع', 'صورة', 'شهادة', 'تقرير الصيانة'],
}

const content = computed(() => labels[language.value] || labels.FR)
const dictionary = computed(() => dictionaries[language.value] || {})
const tabs = computed(() => [
  { id: 'info', label: content.value.info },
  { id: 'performance', label: content.value.performance },
  { id: 'interventions', label: content.value.interventions },
  { id: 'preventive', label: content.value.preventive },
  { id: 'breakdowns', label: content.value.breakdowns },
  { id: 'parts', label: content.value.parts },
  { id: 'documents', label: content.value.documents },
])
const documents = computed(() => documentsMap[language.value] || documentsMap.FR)

function translate(group, value) {
  return dictionary.value[group]?.[value] || value || ''
}

function displayMachineName(name) {
  return translatedNames[language.value]?.[name] || name || ''
}
</script>

<style scoped>
.drawer-overlay { position: fixed; z-index: 9999; inset: 0; background: rgba(74,10,10,.28); backdrop-filter: blur(3px); }
.drawer { position: absolute; top: 0; right: 0; display: flex; width: min(560px, 100%); height: 100%; flex-direction: column; background: #ffffff; color: #4a0a0a; box-shadow: -18px 0 54px rgba(74,10,10,.14); border-left: 1px solid #edf0e8; }
.drawer[dir='rtl'] { right: auto; left: 0; box-shadow: 18px 0 54px rgba(74,10,10,.14); border-left: 0; border-right: 1px solid #edf0e8; }
.drawer-header { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-bottom: 1px solid #edf0e8; }
.drawer-header span { color: #6a9a2a; font-size: 12px; font-weight: 900; }
.drawer-header h2 { margin: 5px 0 0; color: #4a0a0a; font-size: 21px; letter-spacing: 0; }
.close-button { width: 36px; height: 36px; background: #ffffff; border: 1px solid #dfe5d6; border-radius: 8px; color: #4a0a0a; cursor: pointer; }
.drawer-tabs { display: flex; overflow-x: auto; padding: 0 20px; border-bottom: 1px solid #edf0e8; }
.drawer-tabs button { padding: 15px 12px; background: transparent; border: 0; border-bottom: 2px solid transparent; color: #4a0a0a; font-size: 12px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.drawer-tabs button.active { background: #e3edcf; border-color: #6a9a2a; color: #6a9a2a; }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.machine-cover { width: 100%; height: 220px; margin-bottom: 18px; object-fit: cover; border: 1px solid #edf0e8; border-radius: 8px; background: #f7f9f3; }
.drawer-body h3 { margin: 5px 0 16px; color: #4a0a0a; font-size: 14px; letter-spacing: 0; }
.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 26px; }
.details-grid div, .list-row, .document-row { background: #f7f9f3; border: 1px solid #edf0e8; border-radius: 8px; }
.details-grid div { padding: 13px; }
.details-grid span { display: block; color: #53667f; font-size: 10px; }
.details-grid strong { display: block; margin-top: 5px; color: #4a0a0a; font-size: 12px; }
.list-row { display: grid; gap: 5px; margin-bottom: 10px; padding: 14px; color: #4a0a0a; }
.list-row span { color: #53667f; font-size: 12px; }
.document-row { display: block; width: 100%; margin-bottom: 10px; padding: 14px; color: #4a0a0a; text-align: start; font-weight: 800; cursor: pointer; }
.document-row:hover { border-color: rgba(106,154,42,.34); color: #6a9a2a; }
.drawer-footer { display: flex; flex-wrap: wrap; gap: 10px; padding: 18px 24px; border-top: 1px solid #edf0e8; }
.drawer-footer button { flex: 1; min-width: 130px; min-height: 44px; padding: 0 12px; border-radius: 12px; font-weight: 900; cursor: pointer; }
.secondary-button { background: #ffffff; border: 1px solid #dfe5d6; color: #4a0a0a; }
.primary-button { background: #5f8f2f; border: 1px solid rgba(106,154,42,.44); color: white; }
:global(:root[data-theme='dark']) .drawer-overlay { background: rgba(5,10,18,.56); }
:global(:root[data-theme='dark']) .drawer { background: linear-gradient(180deg, rgba(31,43,57,.98), rgba(16,25,36,.98)), #101924; color: #f4f7fb; box-shadow: -18px 0 54px rgba(0,0,0,.42); border-left-color: rgba(126,146,170,.24); }
:global(:root[data-theme='dark']) .drawer[dir='rtl'] { box-shadow: 18px 0 54px rgba(0,0,0,.42); border-right-color: rgba(126,146,170,.24); }
:global(:root[data-theme='dark']) .drawer-header, :global(:root[data-theme='dark']) .drawer-tabs, :global(:root[data-theme='dark']) .drawer-footer { border-color: rgba(116,135,158,.15); }
:global(:root[data-theme='dark']) .drawer-header span { color: #83b95c; }
:global(:root[data-theme='dark']) .drawer-header h2, :global(:root[data-theme='dark']) .drawer-body h3, :global(:root[data-theme='dark']) .details-grid strong { color: #f8fbff; }
:global(:root[data-theme='dark']) .close-button, :global(:root[data-theme='dark']) .secondary-button { background: rgba(13,21,32,.82); border-color: rgba(210,221,234,.28); color: #f2f6fb; }
:global(:root[data-theme='dark']) .drawer-tabs button { color: #aeb9c8; }
:global(:root[data-theme='dark']) .drawer-tabs button.active { background: transparent; border-color: #83b95c; color: #bce39d; }
:global(:root[data-theme='dark']) .machine-cover { border-color: rgba(126,146,170,.22); background: rgba(13,21,32,.72); }
:global(:root[data-theme='dark']) .details-grid div, :global(:root[data-theme='dark']) .list-row, :global(:root[data-theme='dark']) .document-row { background: rgba(17,27,38,.82); border-color: rgba(126,146,170,.2); }
:global(:root[data-theme='dark']) .details-grid span { color: #8d9aab; }
:global(:root[data-theme='dark']) .list-row, :global(:root[data-theme='dark']) .document-row { color: #f4f7fb; }
:global(:root[data-theme='dark']) .list-row span { color: #aab7c7; }
:global(:root[data-theme='dark']) .document-row:hover { border-color: rgba(91,155,215,.54); color: #cfe9ff; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-active .drawer, .fade-leave-active .drawer { transition: transform .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .drawer, .fade-leave-to .drawer { transform: translateX(100%); }
.fade-enter-from .drawer[dir='rtl'], .fade-leave-to .drawer[dir='rtl'] { transform: translateX(-100%); }
@media (max-width: 640px) {
  .details-grid { grid-template-columns: 1fr; }
}
</style>
