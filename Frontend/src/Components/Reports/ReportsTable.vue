<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>{{ displayTitle }}</h2>
        <p>{{ content.shown(rows.length) }}</p>
      </div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column">{{ columnLabel(column) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td v-for="column in columns" :key="column">
              <bdi :dir="cellDirection(column, row[column])">{{ cellLabel(column, row[column]) }}</bdi>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length" class="empty-state">{{ content.empty }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  title: { type: String, required: true },
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
})

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const content = computed(() => ({
  FR: {
    shown: (count) => `${count} ligne(s) affichee(s)`,
    empty: 'Aucune donnee disponible.',
  },
  EN: {
    shown: (count) => `${count} row(s) shown`,
    empty: 'No data available.',
  },
  AR: {
    shown: (count) => `${count} سطر معروض`,
    empty: 'لا توجد بيانات متاحة.',
  },
})[language.value] || {})

const titleLabels = {
  'Tableau récapitulatif des interventions': {
    FR: 'Tableau recapitulatif des interventions',
    EN: 'Interventions summary table',
    AR: 'جدول ملخص التدخلات',
  },
  'Tableau récapitulatif des pannes': {
    FR: 'Tableau recapitulatif des pannes',
    EN: 'Breakdowns summary table',
    AR: 'جدول ملخص الأعطال',
  },
  'Tableau récapitulatif des machines': {
    FR: 'Tableau recapitulatif des machines',
    EN: 'Machines summary table',
    AR: 'جدول ملخص الآلات',
  },
  'Tableau maintenance préventive': {
    FR: 'Tableau maintenance preventive',
    EN: 'Preventive maintenance table',
    AR: 'جدول الصيانة الوقائية',
  },
  'Tableau pièces de rechange': {
    FR: 'Tableau pieces de rechange',
    EN: 'Spare parts table',
    AR: 'جدول قطع الغيار',
  },
  'Tableau performance techniciens': {
    FR: 'Tableau performance techniciens',
    EN: 'Technician performance table',
    AR: 'جدول أداء التقنيين',
  },
  'Tableau coûts de maintenance': {
    FR: 'Tableau couts de maintenance',
    EN: 'Maintenance costs table',
    AR: 'جدول تكاليف الصيانة',
  },
}

const columnLabels = {
  ID: { FR: 'ID', EN: 'ID', AR: 'ID' },
  Machine: { FR: 'Machine', EN: 'Machine', AR: 'الآلة' },
  Technicien: { FR: 'Technicien', EN: 'Technician', AR: 'التقني' },
  Type: { FR: 'Type', EN: 'Type', AR: 'النوع' },
  Durée: { FR: 'Duree', EN: 'Duration', AR: 'المدة' },
  Coût: { FR: 'Cout', EN: 'Cost', AR: 'الكلفة' },
  Statut: { FR: 'Statut', EN: 'Status', AR: 'الحالة' },
  Date: { FR: 'Date', EN: 'Date', AR: 'التاريخ' },
  'ID panne': { FR: 'ID panne', EN: 'Breakdown ID', AR: 'ID العطل' },
  Cause: { FR: 'Cause', EN: 'Cause', AR: 'السبب' },
  "Durée d'arrêt": { FR: "Duree d'arret", EN: 'Downtime', AR: 'مدة التوقف' },
  Criticité: { FR: 'Criticite', EN: 'Criticality', AR: 'الخطورة' },
  'Intervention liée': { FR: 'Intervention liee', EN: 'Related intervention', AR: 'التدخل المرتبط' },
  Ligne: { FR: 'Ligne', EN: 'Line', AR: 'الخط' },
  Disponibilité: { FR: 'Disponibilite', EN: 'Availability', AR: 'التوفر' },
  Pannes: { FR: 'Pannes', EN: 'Breakdowns', AR: 'الأعطال' },
  Plan: { FR: 'Plan', EN: 'Plan', AR: 'الخطة' },
  Fréquence: { FR: 'Frequence', EN: 'Frequency', AR: 'التواتر' },
  'Dernier contrôle': { FR: 'Dernier controle', EN: 'Last check', AR: 'آخر فحص' },
  'Prochaine échéance': { FR: 'Prochaine echeance', EN: 'Next due date', AR: 'الموعد القادم' },
  Responsable: { FR: 'Responsable', EN: 'Owner', AR: 'المسؤول' },
  Référence: { FR: 'Reference', EN: 'Reference', AR: 'المرجع' },
  Pièce: { FR: 'Piece', EN: 'Part', AR: 'القطعة' },
  Catégorie: { FR: 'Categorie', EN: 'Category', AR: 'الفئة' },
  'Stock actuel': { FR: 'Stock actuel', EN: 'Current stock', AR: 'المخزون الحالي' },
  'Seuil minimum': { FR: 'Seuil minimum', EN: 'Minimum threshold', AR: 'الحد الأدنى' },
  Fournisseur: { FR: 'Fournisseur', EN: 'Supplier', AR: 'المورد' },
  Interventions: { FR: 'Interventions', EN: 'Interventions', AR: 'التدخلات' },
  Clôturées: { FR: 'Cloturees', EN: 'Closed', AR: 'المغلقة' },
  'Temps moyen': { FR: 'Temps moyen', EN: 'Average time', AR: 'الوقت المتوسط' },
  Charge: { FR: 'Charge', EN: 'Workload', AR: 'العبء' },
  Corrective: { FR: 'Corrective', EN: 'Corrective', AR: 'تصحيحية' },
  Préventive: { FR: 'Preventive', EN: 'Preventive', AR: 'وقائية' },
  Pièces: { FR: 'Pieces', EN: 'Parts', AR: 'القطع' },
  'Main-d’oeuvre': { FR: "Main-d'oeuvre", EN: 'Labor', AR: 'اليد العاملة' },
  Total: { FR: 'Total', EN: 'Total', AR: 'المجموع' },
}

const valueLabels = {
  Corrective: { FR: 'Corrective', EN: 'Corrective', AR: 'تصحيحية' },
  Préventive: { FR: 'Preventive', EN: 'Preventive', AR: 'وقائية' },
  Terminée: { FR: 'Terminee', EN: 'Completed', AR: 'منتهية' },
  'En cours': { FR: 'En cours', EN: 'In progress', AR: 'قيد الإنجاز' },
  'En service': { FR: 'En service', EN: 'In service', AR: 'في الخدمة' },
  'Sous surveillance': { FR: 'Sous surveillance', EN: 'Under monitoring', AR: 'تحت المراقبة' },
  Planifiée: { FR: 'Planifiee', EN: 'Planned', AR: 'مبرمجة' },
  'En retard': { FR: 'En retard', EN: 'Late', AR: 'متأخرة' },
  Disponible: { FR: 'Disponible', EN: 'Available', AR: 'متوفر' },
  'Stock faible': { FR: 'Stock faible', EN: 'Low stock', AR: 'مخزون منخفض' },
  Mensuelle: { FR: 'Mensuelle', EN: 'Monthly', AR: 'شهرية' },
  Hebdomadaire: { FR: 'Hebdomadaire', EN: 'Weekly', AR: 'أسبوعية' },
  Élevée: { FR: 'Elevee', EN: 'High', AR: 'مرتفعة' },
  Normale: { FR: 'Normale', EN: 'Normal', AR: 'عادية' },
  Critique: { FR: 'Critique', EN: 'Critical', AR: 'حرجة' },
  Haute: { FR: 'Haute', EN: 'High', AR: 'عالية' },
  'Remplisseuse R-118': { FR: 'Remplisseuse R-118', EN: 'Filling machine R-118', AR: 'آلة تعبئة R-118' },
  'Pasteurisateur P-204': { FR: 'Pasteurisateur P-204', EN: 'Pasteurizer P-204', AR: 'مبستر P-204' },
  'Convoyeur M-309': { FR: 'Convoyeur M-309', EN: 'Conveyor M-309', AR: 'ناقل M-309' },
  'Tour d\'usinage M-102': { FR: "Tour d'usinage M-102", EN: 'Machining lathe M-102', AR: 'مخرطة M-102' },
  'Presse hydraulique M-215': { FR: 'Presse hydraulique M-215', EN: 'Hydraulic press M-215', AR: 'مكبس هيدروليكي M-215' },
  'Ligne Production 1': { FR: 'Ligne Production 1', EN: 'Production line 1', AR: 'خط الإنتاج 1' },
  'Ligne Production 2': { FR: 'Ligne Production 2', EN: 'Production line 2', AR: 'خط الإنتاج 2' },
  'Ligne Conditionnement': { FR: 'Ligne Conditionnement', EN: 'Conditioning line', AR: 'خط التكييف' },
  'Graissage du moteur': { FR: 'Graissage du moteur', EN: 'Motor greasing', AR: 'تشحيم المحرك' },
  'Contrôle température': { FR: 'Controle temperature', EN: 'Temperature check', AR: 'مراقبة درجة الحرارة' },
  'Fusible industriel': { FR: 'Fusible industriel', EN: 'Industrial fuse', AR: 'مصهر صناعي' },
  'Filtre à huile': { FR: 'Filtre a huile', EN: 'Oil filter', AR: 'مرشح الزيت' },
  'Électrique': { FR: 'Electrique', EN: 'Electrical', AR: 'كهربائية' },
  Filtration: { FR: 'Filtration', EN: 'Filtration', AR: 'ترشيح' },
  'TotalEnergies Maroc': { FR: 'TotalEnergies Maroc', EN: 'TotalEnergies Morocco', AR: 'طوطال إنرجيز المغرب' },
  'Schneider Electric': { FR: 'Schneider Electric', EN: 'Schneider Electric', AR: 'شنايدر إلكتريك' },
  Nabil: { FR: 'Nabil', EN: 'Nabil', AR: 'نبيل' },
  Karim: { FR: 'Karim', EN: 'Karim', AR: 'كريم' },
  Youssef: { FR: 'Youssef', EN: 'Youssef', AR: 'يوسف' },
  Sara: { FR: 'Sara', EN: 'Sara', AR: 'سارة' },
  Ahmed: { FR: 'Ahmed', EN: 'Ahmed', AR: 'أحمد' },
}

const displayTitle = computed(() => titleLabels[props.title]?.[language.value] || props.title)

const columnLabel = (column) => columnLabels[column]?.[language.value] || column
const cellLabel = (column, value) => {
  if (!value) return '-'
  if (language.value === 'AR' && (column === 'Coût' || String(value).includes('DH'))) {
    return String(value).replace(/(.+)\sDH/, (_, amount) => `${ltrNumber(amount)} درهم`)
  }
  if (language.value === 'AR' && (column === 'Durée' || column === 'Temps moyen' || String(value).includes(' h '))) {
    return String(value).replace(/(\d+)\s*h\s*(\d+)/, (_, hours, minutes) => {
      const hoursNumber = Number(hours)
      const hourText = hoursNumber === 1 ? 'ساعة' : `${ltrNumber(hours)} ساعات`
      return `${hourText} و${ltrNumber(minutes)} دقيقة`
    })
  }
  return valueLabels[value]?.[language.value] || value
}
const ltrNumber = (value) => `\u200E${value}\u200E`
const cellDirection = (column, value) => {
  if (language.value === 'AR' && (column === 'Durée' || column === 'Temps moyen' || column === 'Coût')) {
    return 'rtl'
  }

  return /(^[A-Z]+-\d+|\d|DH|%|MTBF|MTTR)/.test(String(value || '')) ? 'ltr' : null
}
</script>

<style scoped>
.table-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74,10,10,.05); }
.table-header { padding: 20px 22px; border-bottom: 1px solid #edf0e8; }
.table-header h2 { margin: 0; color: #111827; font-size: 17px; }
.table-header p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
thead { background: #fafbf7; }
th, td { padding: 14px 15px; border-top: 1px solid #edf0e8; color: #4a0a0a; font-size: 12px; text-align: left; }
[dir='rtl'] th,
[dir='rtl'] td { text-align: right; }
th { border-top: 0; color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; }
td bdi { unicode-bidi: isolate; }
tbody tr:hover { background: #fbfcf8; }
.empty-state { padding: 40px !important; text-align: center; color: #94a3b8; }
</style>
