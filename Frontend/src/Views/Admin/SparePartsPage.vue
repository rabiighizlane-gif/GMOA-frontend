<template>
  <main class="spare-parts-page" :dir="language === 'AR' ? 'rtl' : 'ltr'">
    <button
      type="button"
      class="sidebar-toggle"
      :class="{ 'is-hidden': isSidebarOpen }"
      :aria-label="content.menu"
      :aria-expanded="isSidebarOpen"
      @click="toggleSidebar"
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div v-if="isSidebarOpen" class="sidebar-backdrop" aria-hidden="true" @click="closeSidebar"></div>
    <Sidebar :open="isSidebarOpen" @close="closeSidebar" />

    <header class="page-header">
      <div>
        <p class="breadcrumb">{{ content.breadcrumb }}</p>
        <h1>{{ content.title }}</h1>
        <p>{{ content.subtitle }}</p>
      </div>

      <div class="header-actions">
        <button type="button" class="secondary-button" @click="exportParts">
          {{ content.export }}
        </button>
        <button type="button" class="primary-button" @click="openCreateModal">
          {{ content.addPart }}
        </button>
      </div>
    </header>

    <SparePartsKPICards />

    <SparePartsFiltersBar
      :filters="filters"
      :categories="categories"
      :machines="machines"
      :suppliers="suppliers"
      :locations="locations"
      @update-filter="updateFilter"
      @reset="resetFilters"
    />

    <SparePartsTable
      :parts="filteredParts"
      @view="openDrawer"
      @edit="openEditModal"
      @adjust="openAdjustModal"
      @delete="deletePart"
    />

    <SparePartsChartsSection />

    <SparePartDrawer
      :open="drawerOpen"
      :part="selectedPart"
      @close="drawerOpen = false"
      @edit="openEditModal"
      @adjust="openAdjustModal"
    />

    <SparePartFormModal
      :open="formModalOpen"
      :part="partToEdit"
      :categories="categories"
      @close="closeFormModal"
      @save="savePart"
    />

    <Teleport to="body">
      <div v-if="adjustModalOpen" class="modal-overlay" @click.self="closeAdjustModal">
        <form class="adjust-card" @submit.prevent="applyStockAdjustment">
          <header>
            <div>
              <span>{{ content.adjustStock }}</span>
              <h2>{{ partToAdjust?.name }}</h2>
            </div>
            <button type="button" @click="closeAdjustModal">x</button>
          </header>

          <div class="adjust-body">
            <div class="form-group">
              <label>{{ content.movementType }}</label>
              <select v-model="stockMovement.type">
                <option value="Entrée">{{ content.in }}</option>
                <option value="Sortie">{{ content.out }}</option>
                <option value="Correction">{{ content.correction }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ content.quantity }}</label>
              <input v-model.number="stockMovement.quantity" min="1" type="number" required />
            </div>

            <div class="form-group">
              <label>{{ content.reason }}</label>
              <input v-model.trim="stockMovement.reason" required />
            </div>

            <div class="form-group">
              <label>{{ content.relatedIntervention }}</label>
              <input v-model.trim="stockMovement.intervention" placeholder="INT-887" />
            </div>

            <div class="form-group">
              <label>{{ content.date }}</label>
              <input v-model="stockMovement.date" type="date" required />
            </div>

            <div class="form-group full">
              <label>{{ content.comment }}</label>
              <textarea v-model.trim="stockMovement.comment" rows="3"></textarea>
            </div>

            <p v-if="stockError" class="error-message">{{ stockError }}</p>
          </div>

          <footer>
            <button type="button" class="secondary-button" @click="closeAdjustModal">{{ content.cancel }}</button>
            <button type="submit" class="primary-button">{{ content.validate }}</button>
          </footer>
        </form>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import Sidebar from '@/Components/sidebar.vue'
import SparePartDrawer from '@/Components/SpareParts/SparePartDrawer.vue'
import SparePartFormModal from '@/Components/SpareParts/SparePartFormModal.vue'
import SparePartsChartsSection from '@/Components/SpareParts/SparePartsChartsSection.vue'
import SparePartsFiltersBar from '@/Components/SpareParts/SparePartsFiltersBar.vue'
import SparePartsKPICards from '@/Components/SpareParts/SparePartsKPICards.vue'
import SparePartsTable from '@/Components/SpareParts/SparePartsTable.vue'

const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const pageContent = {
  FR: {
    menu: 'Afficher le menu',
    breadcrumb: 'Accueil / Pieces de rechange',
    title: 'Pieces de rechange',
    subtitle: 'Gestion et suivi du stock des pieces necessaires aux operations de maintenance',
    export: 'Exporter',
    addPart: 'Ajouter une piece',
    adjustStock: 'Ajustement du stock',
    movementType: 'Type de mouvement',
    in: 'Entree',
    out: 'Sortie',
    correction: 'Correction',
    quantity: 'Quantite',
    reason: 'Motif',
    relatedIntervention: 'Intervention liee',
    date: 'Date',
    comment: 'Commentaire',
    cancel: 'Annuler',
    validate: 'Valider',
    stockExitError: 'La quantite de sortie ne peut pas depasser le stock disponible.',
    deleteConfirm: (reference) => `Supprimer la piece ${reference} ?`,
    exportReady: 'Export pret pour les pieces filtrees.',
  },
  EN: {
    menu: 'Show menu',
    breadcrumb: 'Home / Spare parts',
    title: 'Spare parts',
    subtitle: 'Stock tracking for parts required by maintenance operations',
    export: 'Export',
    addPart: 'Add part',
    adjustStock: 'Stock adjustment',
    movementType: 'Movement type',
    in: 'Entry',
    out: 'Exit',
    correction: 'Correction',
    quantity: 'Quantity',
    reason: 'Reason',
    relatedIntervention: 'Related intervention',
    date: 'Date',
    comment: 'Comment',
    cancel: 'Cancel',
    validate: 'Validate',
    stockExitError: 'Exit quantity cannot exceed available stock.',
    deleteConfirm: (reference) => `Delete part ${reference}?`,
    exportReady: 'Export ready for filtered parts.',
  },
  AR: {
    menu: 'إظهار القائمة',
    breadcrumb: 'الرئيسية / قطع الغيار',
    title: 'قطع الغيار',
    subtitle: 'تدبير وتتبع مخزون القطع اللازمة لعمليات الصيانة',
    export: 'تصدير',
    addPart: 'إضافة قطعة',
    adjustStock: 'تعديل المخزون',
    movementType: 'نوع الحركة',
    in: 'دخول',
    out: 'خروج',
    correction: 'تصحيح',
    quantity: 'الكمية',
    reason: 'السبب',
    relatedIntervention: 'التدخل المرتبط',
    date: 'التاريخ',
    comment: 'تعليق',
    cancel: 'إلغاء',
    validate: 'تأكيد',
    stockExitError: 'كمية الخروج لا يمكن أن تتجاوز المخزون المتوفر.',
    deleteConfirm: (reference) => `حذف القطعة ${reference}؟`,
    exportReady: 'التصدير جاهز للقطع المفلترة.',
  },
}
const content = computed(() => pageContent[language.value] || pageContent.FR)

const categories = ['Mécanique', 'Électrique', 'Pneumatique', 'Hydraulique', 'Lubrification', 'Filtration', 'Transmission']

const isSidebarOpen = ref(false)
const drawerOpen = ref(false)
const formModalOpen = ref(false)
const adjustModalOpen = ref(false)
const selectedPart = ref(null)
const partToEdit = ref(null)
const partToAdjust = ref(null)
const stockError = ref('')

const filters = reactive({
  search: '',
  category: '',
  machine: '',
  supplier: '',
  status: '',
  location: ''
})

const stockMovement = reactive({
  type: 'Entrée',
  quantity: 1,
  reason: '',
  intervention: '',
  date: '2026-07-18',
  comment: ''
})

const parts = ref([
  createPart({
    reference: 'PR-001',
    name: 'Roulement SKF 6205',
    category: 'Mécanique',
    machine: 'Convoyeur M-309',
    currentStock: 25,
    minimumStock: 10,
    maximumStock: 30,
    location: 'A-01',
    supplier: 'SKF Maroc',
    unitPrice: 180,
    unit: 'Pièce',
    line: 'Ligne Conditionnement',
    description: 'Roulement industriel pour tambour moteur et entraînements mécaniques.'
  }),
  createPart({
    reference: 'PR-002',
    name: 'Filtre à huile',
    category: 'Filtration',
    machine: 'Compresseur M-412',
    currentStock: 3,
    minimumStock: 5,
    maximumStock: 20,
    location: 'B-04',
    supplier: 'TotalEnergies Maroc',
    unitPrice: 95,
    unit: 'Pièce',
    line: 'Ligne Utilités',
    description: 'Filtre à huile compatible avec les cycles de maintenance du compresseur.'
  }),
  createPart({
    reference: 'PR-003',
    name: 'Courroie de transmission',
    category: 'Transmission',
    machine: 'Pasteurisateur P-204',
    currentStock: 0,
    minimumStock: 4,
    maximumStock: 15,
    location: 'C-02',
    supplier: 'Gates Maroc',
    unitPrice: 260,
    unit: 'Pièce',
    line: 'Ligne Production 1',
    description: 'Courroie renforcée pour transmission principale.'
  }),
  createPart({
    reference: 'PR-004',
    name: 'Fusible industriel',
    category: 'Électrique',
    machine: 'Remplisseuse R-118',
    currentStock: 42,
    minimumStock: 15,
    maximumStock: 60,
    location: 'D-03',
    supplier: 'Schneider Electric',
    unitPrice: 35,
    unit: 'Pièce',
    line: 'Ligne Conditionnement',
    description: 'Fusible industriel pour armoires électriques.'
  }),
  createPart({
    reference: 'PR-005',
    name: 'Huile mécanique',
    category: 'Lubrification',
    machine: 'Machines multiples',
    currentStock: 8,
    minimumStock: 10,
    maximumStock: 25,
    location: 'E-02',
    supplier: 'Shell Maroc',
    unitPrice: 320,
    unit: 'Litre',
    line: 'Toutes les lignes',
    description: 'Huile mécanique pour graissage et entretien préventif.'
  })
])

const machines = computed(() => [...new Set(parts.value.map((part) => part.machine))])
const suppliers = computed(() => [...new Set(parts.value.map((part) => part.supplier))])
const locations = computed(() => [...new Set(parts.value.map((part) => part.location))])

const filteredParts = computed(() => {
  const query = filters.search.toLowerCase().trim()

  return parts.value.filter((part) => {
    const matchesSearch =
      !query ||
      part.reference.toLowerCase().includes(query) ||
      part.name.toLowerCase().includes(query)

    return (
      matchesSearch &&
      (!filters.category || part.category === filters.category) &&
      (!filters.machine || part.machine === filters.machine) &&
      (!filters.supplier || part.supplier === filters.supplier) &&
      (!filters.status || part.status === filters.status) &&
      (!filters.location || part.location === filters.location)
    )
  })
})

function createPart(part) {
  const status = calculateStatus(part.currentStock, part.minimumStock)

  return {
    addedAt: '18/07/2026',
    lastMovement: '15/07/2026',
    compatibleMachines: [part.machine],
    productionLines: [part.line || 'Ligne Production 1'],
    compatibleModels: ['Standard industriel', 'Série 2026'],
    history: [
      { date: '15/07/2026', quantity: '+20', label: 'Nouvelle livraison' },
      { date: '12/07/2026', quantity: '-4', label: 'Utilisées pour l’intervention INT-887' },
      { date: '08/07/2026', quantity: '+15', label: 'Réapprovisionnement' }
    ],
    ...part,
    status
  }
}

function calculateStatus(stock, minimumStock) {
  if (stock === 0) {
    return 'Rupture'
  }

  if (stock <= minimumStock) {
    return 'Stock faible'
  }

  return 'Disponible'
}

function updatePartStatus(part) {
  part.status = calculateStatus(part.currentStock, part.minimumStock)
}

function updateFilter({ key, value }) {
  filters[key] = value
}

function resetFilters() {
  filters.search = ''
  filters.category = ''
  filters.machine = ''
  filters.supplier = ''
  filters.status = ''
  filters.location = ''
}

function openDrawer(part) {
  selectedPart.value = part
  drawerOpen.value = true
}

function openCreateModal() {
  partToEdit.value = null
  formModalOpen.value = true
}

function openEditModal(part) {
  drawerOpen.value = false
  partToEdit.value = part
  formModalOpen.value = true
}

function closeFormModal() {
  formModalOpen.value = false
  partToEdit.value = null
}

function savePart(part) {
  const normalizedPart = createPart({
    ...part,
    unit: part.unit || 'Pièce',
    line: part.line || 'Ligne Production 1'
  })

  const index = parts.value.findIndex((item) => item.reference === normalizedPart.reference)

  if (index !== -1) {
    parts.value[index] = {
      ...parts.value[index],
      ...normalizedPart
    }
  } else {
    parts.value.unshift(normalizedPart)
  }

  closeFormModal()
}

function deletePart(part) {
  if (!window.confirm(content.value.deleteConfirm(part.reference))) {
    return
  }

  parts.value = parts.value.filter((item) => item.reference !== part.reference)

  if (selectedPart.value?.reference === part.reference) {
    selectedPart.value = null
    drawerOpen.value = false
  }
}

function openAdjustModal(part) {
  drawerOpen.value = false
  partToAdjust.value = part
  stockError.value = ''
  stockMovement.type = 'Entrée'
  stockMovement.quantity = 1
  stockMovement.reason = ''
  stockMovement.intervention = ''
  stockMovement.date = '2026-07-18'
  stockMovement.comment = ''
  adjustModalOpen.value = true
}

function closeAdjustModal() {
  adjustModalOpen.value = false
  partToAdjust.value = null
}

function applyStockAdjustment() {
  const part = partToAdjust.value

  if (!part) {
    return
  }

  if (stockMovement.type === 'Sortie' && stockMovement.quantity > part.currentStock) {
    stockError.value = content.value.stockExitError
    return
  }

  if (stockMovement.type === 'Entrée') {
    part.currentStock = Math.min(part.maximumStock, part.currentStock + stockMovement.quantity)
  } else if (stockMovement.type === 'Sortie') {
    part.currentStock = Math.max(0, part.currentStock - stockMovement.quantity)
  } else {
    part.currentStock = Math.min(part.maximumStock, stockMovement.quantity)
  }

  part.lastMovement = formatFrenchDate(stockMovement.date)
  part.history.unshift({
    date: part.lastMovement,
    quantity: stockMovement.type === 'Sortie' ? `-${stockMovement.quantity}` : `+${stockMovement.quantity}`,
    label: stockMovement.reason
  })
  updatePartStatus(part)
  closeAdjustModal()
}

function formatFrenchDate(date) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function exportParts() {
  window.alert(content.value.exportReady)
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<style scoped>
.spare-parts-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 32px 28px 44px 88px;
  overflow-x: hidden;
  background: #f7f9f3;
  box-sizing: border-box;
}

.spare-parts-page[dir='rtl'] {
  padding: 32px 88px 44px 28px;
}

.sidebar-toggle {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 1000;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  background: white;
  border: 1px solid #edf0e8;
  border-radius: 16px;
  color: #4a0a0a;
  box-shadow: 0 10px 30px rgba(74, 10, 10, 0.08);
  cursor: pointer;
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
  background: currentColor;
  border-radius: 999px;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(74, 10, 10, 0.28);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.breadcrumb {
  margin: 0 0 7px !important;
  color: #6a9a2a !important;
  font-size: 11px;
  font-weight: 900;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 32px;
  font-weight: 900;
}

.page-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.primary-button,
.secondary-button {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.primary-button {
  background: #6a9a2a;
  border: 1px solid #6a9a2a;
  color: white;
}

.secondary-button {
  background: white;
  border: 1px solid #dfe5d6;
  color: #4a0a0a;
}

.modal-overlay {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  padding: 25px;
  place-items: center;
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(3px);
}

.adjust-card {
  width: min(620px, 100%);
  overflow: hidden;
  background: white;
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
}

.adjust-card header,
.adjust-card footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px;
  border-bottom: 1px solid #edf0e8;
}

.adjust-card footer {
  justify-content: flex-end;
  border-top: 1px solid #edf0e8;
  border-bottom: 0;
}

.adjust-card header span {
  color: #6a9a2a;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.adjust-card h2 {
  margin: 5px 0 0;
  color: #111827;
}

.adjust-card header button {
  width: 36px;
  height: 36px;
  background: #f7f9f3;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}

.adjust-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 17px;
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group.full,
.error-message {
  grid-column: 1 / -1;
}

.form-group label {
  color: #4a0a0a;
  font-size: 12px;
  font-weight: 900;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: #fafbf7;
  border: 1px solid #dfe5d6;
  border-radius: 11px;
  outline: none;
  font: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #6a9a2a;
  box-shadow: 0 0 0 3px rgba(106, 154, 42, 0.12);
}

.error-message {
  margin: 0;
  color: #e31e24;
  font-weight: 800;
}

@media (max-width: 960px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .spare-parts-page {
    padding: 88px 16px 32px;
  }

  .spare-parts-page[dir='rtl'] {
    padding: 88px 16px 32px;
  }

  .header-actions,
  .adjust-body {
    grid-template-columns: 1fr;
    flex-direction: column;
    width: 100%;
  }

  .header-actions button {
    width: 100%;
  }
}
</style>
