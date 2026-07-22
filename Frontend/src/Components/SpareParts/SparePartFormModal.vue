<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" :dir="pageDirection" @submit.prevent="submitForm">
        <header>
          <div>
            <span>{{ t.kicker }}</span>
            <h2>{{ part ? t.editTitle : t.addTitle }}</h2>
          </div>

          <button type="button" :aria-label="t.close" @click="$emit('close')">x</button>
        </header>

        <div class="form-body">
          <div class="form-group">
            <label>{{ t.reference }} *</label>
            <input v-model.trim="form.reference" required dir="ltr" />
          </div>

          <div class="form-group">
            <label>{{ t.name }} *</label>
            <input v-model.trim="form.name" required :dir="textDirection" />
          </div>

          <div class="form-group">
            <label>{{ t.category }} *</label>
            <select v-model="form.category" required>
              <option value="">{{ t.select }}</option>
              <option v-for="category in categories" :key="category" :value="category">{{ translate('categories', category) }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t.supplier }} *</label>
            <input v-model.trim="form.supplier" required :dir="textDirection" />
          </div>

          <div class="form-group">
            <label>{{ t.machine }} *</label>
            <input v-model.trim="form.machine" required :dir="textDirection" />
          </div>

          <div class="form-group">
            <label>{{ t.line }}</label>
            <input v-model.trim="form.line" :dir="textDirection" />
          </div>

          <div class="form-group">
            <label>{{ t.initialQuantity }} *</label>
            <input v-model.number="form.currentStock" min="0" type="number" required dir="ltr" />
          </div>

          <div class="form-group">
            <label>{{ t.minimumStock }} *</label>
            <input v-model.number="form.minimumStock" min="0" type="number" required dir="ltr" />
          </div>

          <div class="form-group">
            <label>{{ t.maximumStock }} *</label>
            <input v-model.number="form.maximumStock" min="1" type="number" required dir="ltr" />
          </div>

          <div class="form-group">
            <label>{{ t.location }} *</label>
            <input v-model.trim="form.location" required dir="ltr" />
          </div>

          <div class="form-group">
            <label>{{ t.unitPrice }} *</label>
            <input v-model.number="form.unitPrice" min="0" type="number" required dir="ltr" />
          </div>

          <div class="form-group">
            <label>{{ t.unit }}</label>
            <input v-model.trim="form.unit" :placeholder="t.unitPlaceholder" :dir="textDirection" />
          </div>

          <div class="form-group">
            <label>{{ t.image }}</label>
            <input type="file" accept="image/*" />
          </div>

          <div class="form-group">
            <label>{{ t.datasheet }}</label>
            <input type="file" accept=".pdf" />
          </div>

          <div class="form-group full">
            <label>{{ t.description }}</label>
            <textarea v-model.trim="form.description" rows="4" :dir="textDirection"></textarea>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <footer>
          <button type="button" class="cancel-button" @click="$emit('close')">{{ t.cancel }}</button>
          <button type="submit" class="save-button">{{ t.save }}</button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  open: Boolean,
  part: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save'])
const languageStore = useLanguageStore()
const errorMessage = ref('')
const pageDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))
const textDirection = computed(() => (languageStore.language === 'AR' ? 'rtl' : 'ltr'))

const labels = {
  FR: {
    kicker: 'Pieces de rechange',
    addTitle: 'Ajouter une piece',
    editTitle: 'Modifier la piece',
    close: 'Fermer',
    reference: 'Reference',
    name: 'Nom de la piece',
    category: 'Categorie',
    supplier: 'Fournisseur',
    machine: 'Machine compatible',
    line: 'Ligne de production',
    initialQuantity: 'Quantite initiale',
    minimumStock: 'Seuil minimum',
    maximumStock: 'Stock maximum',
    location: 'Emplacement',
    unitPrice: 'Prix unitaire',
    unit: 'Unite',
    image: 'Image',
    datasheet: 'Fiche technique',
    description: 'Description',
    select: 'Selectionner',
    unitPlaceholder: 'Piece, litre...',
    cancel: 'Annuler',
    save: 'Enregistrer',
    maximumError: 'Le stock maximum doit etre superieur au seuil minimum.',
    currentError: 'Le stock actuel ne peut pas depasser le stock maximum.',
  },
  EN: {
    kicker: 'Spare parts',
    addTitle: 'Add a part',
    editTitle: 'Edit part',
    close: 'Close',
    reference: 'Reference',
    name: 'Part name',
    category: 'Category',
    supplier: 'Supplier',
    machine: 'Compatible machine',
    line: 'Production line',
    initialQuantity: 'Initial quantity',
    minimumStock: 'Minimum threshold',
    maximumStock: 'Maximum stock',
    location: 'Location',
    unitPrice: 'Unit price',
    unit: 'Unit',
    image: 'Image',
    datasheet: 'Technical sheet',
    description: 'Description',
    select: 'Select',
    unitPlaceholder: 'Piece, liter...',
    cancel: 'Cancel',
    save: 'Save',
    maximumError: 'Maximum stock must be greater than the minimum threshold.',
    currentError: 'Current stock cannot exceed maximum stock.',
  },
  AR: {
    kicker: 'قطع الغيار',
    addTitle: 'إضافة قطعة',
    editTitle: 'تعديل القطعة',
    close: 'إغلاق',
    reference: 'المرجع',
    name: 'اسم القطعة',
    category: 'الفئة',
    supplier: 'المورد',
    machine: 'الآلة المتوافقة',
    line: 'خط الإنتاج',
    initialQuantity: 'الكمية الأولية',
    minimumStock: 'الحد الأدنى',
    maximumStock: 'الحد الأقصى للمخزون',
    location: 'الموقع',
    unitPrice: 'ثمن الوحدة',
    unit: 'الوحدة',
    image: 'الصورة',
    datasheet: 'الملف التقني',
    description: 'الوصف',
    select: 'اختيار',
    unitPlaceholder: 'قطعة، لتر...',
    cancel: 'إلغاء',
    save: 'حفظ',
    maximumError: 'يجب أن يكون الحد الأقصى للمخزون أكبر من الحد الأدنى.',
    currentError: 'لا يمكن أن يتجاوز المخزون الحالي الحد الأقصى.',
  },
}

const dictionaries = {
  FR: { categories: {} },
  EN: { categories: { Mecanique: 'Mechanical', Filtration: 'Filtration', Electrique: 'Electrical', Transmission: 'Transmission', Lubrification: 'Lubrication' } },
  AR: { categories: { Mecanique: 'ميكانيكية', Filtration: 'ترشيح', Electrique: 'كهربائية', Transmission: 'نقل الحركة', Lubrification: 'تشحيم' } },
}

const t = computed(() => labels[languageStore.language] || labels.FR)
const dictionary = computed(() => dictionaries[languageStore.language] || dictionaries.FR)

const emptyForm = () => ({
  reference: '',
  name: '',
  category: '',
  description: '',
  supplier: '',
  machine: '',
  line: '',
  currentStock: 0,
  minimumStock: 0,
  maximumStock: 1,
  location: '',
  unitPrice: 0,
  unit: languageStore.language === 'AR' ? 'قطعة' : 'Piece',
})

const form = reactive(emptyForm())

watch(
  () => props.part,
  (part) => {
    Object.assign(form, part || emptyForm())
    errorMessage.value = ''
  },
  { immediate: true },
)

function translate(group, value) {
  return dictionary.value[group]?.[value] || value
}

const submitForm = () => {
  if (form.maximumStock < form.minimumStock) {
    errorMessage.value = t.value.maximumError
    return
  }

  if (form.currentStock > form.maximumStock) {
    errorMessage.value = t.value.currentError
    return
  }

  emit('save', {
    ...props.part,
    ...form,
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  padding: 25px;
  place-items: center;
  background: rgba(5, 10, 17, 0.68);
  backdrop-filter: blur(6px);
}
.modal-card {
  width: min(840px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: rgba(17, 27, 38, 0.96);
  border: 1px solid rgba(126, 146, 170, 0.3);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
}
header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(126, 146, 170, 0.22);
}
header span {
  color: #bce39d;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}
header h2 {
  margin: 5px 0 0;
  color: #f8fbff;
  font-size: 21px;
  letter-spacing: 0;
}
header button {
  width: 36px;
  height: 36px;
  background: #0d1520;
  border: 1px solid rgba(210, 221, 234, 0.18);
  border-radius: 8px;
  color: #f4f7fb;
  cursor: pointer;
}
.form-body {
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
label {
  color: #d7e0ec;
  font-size: 12px;
  font-weight: 900;
}
input,
select,
textarea {
  width: 100%;
  padding: 12px;
  background: #0d1520;
  border: 1px solid rgba(126, 146, 170, 0.28);
  border-radius: 8px;
  color: #f4f7fb;
  outline: none;
  font: inherit;
  box-sizing: border-box;
}
input::placeholder,
textarea::placeholder {
  color: #6f7e91;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #83b95c;
  box-shadow: 0 0 0 3px rgba(131, 185, 92, 0.16);
}
.error-message {
  margin: 0;
  color: #ff7f8e;
  font-weight: 800;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid rgba(126, 146, 170, 0.22);
}
.modal-card[dir='rtl'] footer {
  justify-content: flex-start;
}
footer button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
}
.cancel-button {
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(210, 221, 234, 0.28);
  color: #d7e0ec;
}
.save-button {
  background: #5f8f2f;
  border: 1px solid rgba(131, 185, 92, 0.44);
  color: #f8fbff;
}
@media (max-width: 650px) {
  .form-body { grid-template-columns: 1fr; }
  .form-group.full,
  .error-message { grid-column: auto; }
}
</style>
