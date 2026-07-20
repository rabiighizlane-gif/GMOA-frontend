<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <h2>{{ content.title }}</h2>
        <p>{{ content.shown(parts.length) }}</p>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              <button v-if="column.sortable" type="button" @click="toggleSort(column.key)">
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
                  <strong>{{ partLabel(part.name) }}</strong>
                  <small>{{ unitLabel(part.unit) }}</small>
                </div>
              </div>
            </td>
            <td><span class="category-badge">{{ categoryLabel(part.category) }}</span></td>
            <td>{{ machineLabel(part.machine) }}</td>
            <td>
              <StockProgressBar :current-stock="part.currentStock" :minimum-stock="part.minimumStock" :maximum-stock="part.maximumStock" />
            </td>
            <td>{{ part.minimumStock }}</td>
            <td><bdi dir="ltr">{{ locationLabel(part.location) }}</bdi></td>
            <td>{{ supplierLabel(part.supplier) }}</td>
            <td>
              <span class="price-cell">
                <bdi dir="ltr">{{ part.unitPrice }}</bdi>
                <span>{{ currencyLabel }}</span>
              </span>
            </td>
            <td>
              <span class="status-badge" :class="statusClass(part.status)">
                {{ statusLabel(part.status) }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button type="button" :title="content.actions.view" @click="$emit('view', part)">⌕</button>
                <button type="button" :title="content.actions.edit" @click="$emit('edit', part)">✎</button>
                <button type="button" :title="content.actions.adjust" @click="$emit('adjust', part)">±</button>
                <button type="button" :title="content.actions.delete" class="delete-button" @click="$emit('delete', part)">⌫</button>
              </div>
            </td>
          </tr>

          <tr v-if="paginatedParts.length === 0">
            <td colspan="11" class="empty-state">
              <strong>{{ content.emptyTitle }}</strong>
              <p>{{ content.emptyText }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="parts.length > 0" class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="previousPage">{{ content.previous }}</button>
      <div class="page-numbers">
        <button v-for="page in totalPages" :key="page" type="button" :class="{ active: currentPage === page }" @click="currentPage = page">
          {{ page }}
        </button>
      </div>
      <span>{{ content.range(startItem, endItem, parts.length) }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="nextPage">{{ content.next }}</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import StockProgressBar from '@/Components/SpareParts/StockProgressBar.vue'

const props = defineProps({
  parts: { type: Array, default: () => [] },
})

defineEmits(['view', 'edit', 'adjust', 'delete'])

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const currentPage = ref(1)
const itemsPerPage = 4
const sortKey = ref('reference')
const sortDirection = ref('asc')

const translations = {
  FR: {
    title: 'Inventaire des pieces',
    shown: (count) => `${count} piece(s) affichee(s)`,
    columns: ['Reference', 'Piece', 'Categorie', 'Machine compatible', 'Stock actuel', 'Seuil minimum', 'Emplacement', 'Fournisseur', 'Prix unitaire', 'Statut', 'Actions'],
    previous: '<- Precedent',
    next: 'Suivant ->',
    range: (start, end, total) => `${start}-${end} sur ${total}`,
    emptyTitle: 'Aucune piece trouvee',
    emptyText: 'Aucune reference ne correspond aux filtres selectionnes.',
    actions: { view: 'Voir', edit: 'Modifier', adjust: 'Ajuster le stock', delete: 'Supprimer' },
    statuses: { Disponible: 'Disponible', 'Stock faible': 'Stock faible', Rupture: 'Rupture' },
    units: { Pièce: 'Piece', Litre: 'Litre' },
  },
  EN: {
    title: 'Parts inventory',
    shown: (count) => `${count} part(s) shown`,
    columns: ['Reference', 'Part', 'Category', 'Compatible machine', 'Current stock', 'Minimum threshold', 'Location', 'Supplier', 'Unit price', 'Status', 'Actions'],
    previous: '<- Previous',
    next: 'Next ->',
    range: (start, end, total) => `${start}-${end} of ${total}`,
    emptyTitle: 'No part found',
    emptyText: 'No reference matches the selected filters.',
    actions: { view: 'View', edit: 'Edit', adjust: 'Adjust stock', delete: 'Delete' },
    statuses: { Disponible: 'Available', 'Stock faible': 'Low stock', Rupture: 'Out of stock' },
    units: { Pièce: 'Piece', Litre: 'Liter' },
  },
  AR: {
    title: 'جرد قطع الغيار',
    shown: (count) => `${count} قطعة معروضة`,
    columns: ['المرجع', 'القطعة', 'الفئة', 'الآلة المتوافقة', 'المخزون الحالي', 'الحد الأدنى', 'الموقع', 'المورد', 'ثمن الوحدة', 'الحالة', 'الإجراءات'],
    previous: 'السابق <-',
    next: 'التالي ->',
    range: (start, end, total) => `${start}-${end} من ${total}`,
    emptyTitle: 'لا توجد قطعة',
    emptyText: 'لا يوجد مرجع يوافق الفلاتر المختارة.',
    actions: { view: 'عرض', edit: 'تعديل', adjust: 'تعديل المخزون', delete: 'حذف' },
    statuses: { Disponible: 'متوفر', 'Stock faible': 'مخزون منخفض', Rupture: 'نفاد المخزون' },
    units: { Pièce: 'قطعة', Litre: 'لتر' },
  },
}

const displayMaps = {
  FR: {
    parts: { 'Filtre à huile': 'Filtre a huile', 'Courroie de transmission': 'Courroie de transmission', 'Fusible industriel': 'Fusible industriel', 'Huile mécanique': 'Huile mecanique' },
    categories: { Mécanique: 'Mecanique', Électrique: 'Electrique' },
    machines: { 'Convoyeur M-309': 'Convoyeur M-309', 'Compresseur M-412': 'Compresseur M-412', 'Pasteurisateur P-204': 'Pasteurisateur P-204', 'Remplisseuse R-118': 'Remplisseuse R-118', 'Machines multiples': 'Machines multiples' },
    suppliers: { 'SKF Maroc': 'SKF Maroc', 'TotalEnergies Maroc': 'TotalEnergies Maroc', 'Gates Maroc': 'Gates Maroc', 'Shell Maroc': 'Shell Maroc', 'Schneider Electric': 'Schneider Electric' },
  },
  EN: {
    parts: { 'Roulement SKF 6205': 'SKF 6205 bearing', 'Filtre à huile': 'Oil filter', 'Courroie de transmission': 'Transmission belt', 'Fusible industriel': 'Industrial fuse', 'Huile mécanique': 'Mechanical oil' },
    categories: { Mécanique: 'Mechanical', Électrique: 'Electrical', Pneumatique: 'Pneumatic', Hydraulique: 'Hydraulic', Lubrification: 'Lubrication', Filtration: 'Filtration', Transmission: 'Transmission' },
    machines: { 'Convoyeur M-309': 'Conveyor M-309', 'Compresseur M-412': 'Compressor M-412', 'Pasteurisateur P-204': 'Pasteurizer P-204', 'Remplisseuse R-118': 'Filling machine R-118', 'Machines multiples': 'Multiple machines' },
    suppliers: { 'SKF Maroc': 'SKF Morocco', 'TotalEnergies Maroc': 'TotalEnergies Morocco', 'Gates Maroc': 'Gates Morocco', 'Shell Maroc': 'Shell Morocco', 'Schneider Electric': 'Schneider Electric' },
  },
  AR: {
    parts: { 'Roulement SKF 6205': 'محمل SKF 6205', 'Filtre à huile': 'مرشح الزيت', 'Courroie de transmission': 'حزام نقل الحركة', 'Fusible industriel': 'مصهر صناعي', 'Huile mécanique': 'زيت ميكانيكي' },
    categories: { Mécanique: 'ميكانيكية', Électrique: 'كهربائية', Pneumatique: 'هوائية', Hydraulique: 'هيدروليكية', Lubrification: 'تشحيم', Filtration: 'ترشيح', Transmission: 'نقل الحركة' },
    machines: { 'Convoyeur M-309': 'ناقل M-309', 'Compresseur M-412': 'ضاغط M-412', 'Pasteurisateur P-204': 'مبستر P-204', 'Remplisseuse R-118': 'آلة تعبئة R-118', 'Machines multiples': 'آلات متعددة' },
    suppliers: { 'SKF Maroc': 'SKF المغرب', 'TotalEnergies Maroc': 'TotalEnergies المغرب', 'Gates Maroc': 'Gates المغرب', 'Shell Maroc': 'Shell المغرب', 'Schneider Electric': 'Schneider Electric' },
  },
}

const content = computed(() => translations[language.value] || translations.FR)
const displayMap = computed(() => displayMaps[language.value] || displayMaps.FR)
const currencyLabel = computed(() => 'DH')
const columns = computed(() => {
  const keys = ['reference', 'name', 'category', 'machine', 'currentStock', 'minimumStock', 'location', 'supplier', 'unitPrice', 'status', 'actions']
  return keys.map((key, index) => ({ key, label: content.value.columns[index], sortable: key !== 'actions' }))
})

const sortedParts = computed(() =>
  [...props.parts].sort((first, second) => {
    const firstValue = first[sortKey.value]
    const secondValue = second[sortKey.value]
    const direction = sortDirection.value === 'asc' ? 1 : -1
    if (typeof firstValue === 'number' && typeof secondValue === 'number') return (firstValue - secondValue) * direction
    return String(firstValue).localeCompare(String(secondValue), 'fr') * direction
  })
)
const totalPages = computed(() => Math.max(1, Math.ceil(sortedParts.value.length / itemsPerPage)))
const paginatedParts = computed(() => sortedParts.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const startItem = computed(() => (props.parts.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1))
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage, props.parts.length))

watch(
  () => props.parts.map((part) => part.reference).join('|'),
  () => {
    currentPage.value = 1
  }
)

const toggleSort = (key) => {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}
const sortIcon = (key) => (sortKey.value !== key ? '↕' : sortDirection.value === 'asc' ? '↑' : '↓')
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

const partLabel = (value) => displayMap.value.parts[value] || value
const categoryLabel = (value) => displayMap.value.categories[value] || value
const machineLabel = (value) => displayMap.value.machines[value] || value
const locationLabel = (value) => value
const supplierLabel = (value) => value
const unitLabel = (value) => content.value.units[value] || value
const priceLabel = (value) => `${value} DH`
const statusLabel = (value) => content.value.statuses[value] || value
const statusClass = (status) => ({ 'status-available': status === 'Disponible', 'status-warning': status === 'Stock faible', 'status-danger': status === 'Rupture' })
const categoryIcon = (category) => ({ Mécanique: '⚙', Électrique: '⌁', Pneumatique: '⇄', Hydraulique: '◆', Lubrification: '◒', Filtration: '▥', Transmission: '⛓' })[category] || '▦'
</script>

<style scoped>
.table-card { overflow: hidden; background: white; border: 1px solid #edf0e8; border-radius: 20px; box-shadow: 0 10px 30px rgba(74, 10, 10, 0.05); }
.table-header { padding: 20px 22px; border-bottom: 1px solid #edf0e8; }
.table-header h2 { margin: 0; color: #111827; font-size: 17px; }
.table-header p { margin: 5px 0 0; color: #94a3b8; font-size: 11px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; min-width: 1320px; border-collapse: collapse; }
thead { background: #fafbf7; }
th, td { padding: 14px 18px; border-top: 1px solid #edf0e8; color: #4a0a0a; font-size: 12px; vertical-align: middle; }
th { color: #64748b; font-size: 10px; font-weight: 900; text-align: left; text-transform: uppercase; }
th button { display: inline-flex; align-items: center; gap: 4px; background: transparent; border: 0; color: inherit; font: inherit; font-weight: inherit; cursor: pointer; }
.reference-cell { color: #4a0a0a; font-weight: 900; }
.part-cell { display: flex; align-items: center; gap: 10px; }
.category-icon { display: grid; width: 38px; height: 38px; place-items: center; background: #f0f5e5; border-radius: 10px; color: #6a9a2a; font-size: 16px; }
.part-cell strong, .part-cell small { display: block; }
.part-cell strong { color: #111827; font-size: 12px; }
.part-cell small { margin-top: 4px; color: #94a3b8; font-size: 10px; }
.category-badge, .status-badge { display: inline-flex; padding: 7px 10px; border-radius: 999px; font-size: 10px; font-weight: 900; white-space: nowrap; }
.category-badge { background: #edf5de; color: #6a9a2a; }
.price-cell { display: inline-flex; align-items: center; gap: 4px; direction: ltr; unicode-bidi: isolate; }
.status-available { background: #e3f4df; color: #43852c; }
.status-warning { background: #fff0df; color: #ff6a00; }
.status-danger { background: #ffe7e7; color: #e31e24; }
.actions { display: flex; gap: 7px; }
.actions button { display: grid; width: 34px; height: 34px; place-items: center; background: white; border: 1px solid #e4e9dc; border-radius: 9px; color: #4a0a0a; cursor: pointer; }
.actions .delete-button:hover { background: #fff0f0; }
.empty-state { padding: 45px !important; text-align: center; }
.empty-state strong { color: #111827; }
.empty-state p { margin: 5px 0 0; color: #94a3b8; }
.pagination { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 15px; padding: 16px 20px; border-top: 1px solid #edf0e8; }
.pagination > button, .page-numbers button { height: 38px; padding: 0 13px; background: white; border: 1px solid #e1e7d9; border-radius: 9px; color: #4a0a0a; font-weight: 900; cursor: pointer; }
.pagination > button:disabled { cursor: not-allowed; opacity: 0.4; }
.pagination > span { color: #64748b; font-size: 11px; font-weight: 800; }
.page-numbers { display: flex; justify-content: center; gap: 5px; }
.page-numbers button { width: 38px; padding: 0; }
.page-numbers button.active { background: #6a9a2a; border-color: #6a9a2a; color: white; }
@media (max-width: 700px) { .pagination { grid-template-columns: 1fr 1fr; } .page-numbers { display: none; } }
</style>
