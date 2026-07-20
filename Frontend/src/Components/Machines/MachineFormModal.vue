<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" :dir="language === 'AR' ? 'rtl' : 'ltr'" @submit.prevent="submitForm">
        <header>
          <div><span>{{ content.eyebrow }}</span><h2>{{ machine ? content.editTitle : content.addTitle }}</h2></div>
          <button type="button" :aria-label="content.close" @click="$emit('close')">x</button>
        </header>
        <div class="form-body">
          <div v-for="field in fields" :key="field.key" class="form-group" :class="{ full: field.type === 'textarea' }">
            <label>{{ field.label }} <span v-if="field.required">*</span></label>
            <select v-if="field.options" v-model="form[field.key]" :required="field.required">
              <option value="">{{ content.select }}</option>
              <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <textarea v-else-if="field.type === 'textarea'" v-model.trim="form[field.key]" rows="4"></textarea>
            <label v-else-if="field.type === 'file'" class="file-picker">
              <input :accept="field.accept" type="file" @change="setFileName(field.key, $event)" />
              <span>{{ fileNames[field.key] || content.chooseFile }}</span>
            </label>
            <img v-if="field.key === 'photo' && form.imageUrl" class="photo-preview" :src="form.imageUrl" :alt="form.name || content.fields.photo" />
            <input
              v-else
              :value="fieldDisplayValue(field.key)"
              :type="field.type || 'text'"
              :required="field.required"
              :dir="fieldDirection(field.key)"
              @input="updateField(field.key, $event.target.value)"
            />
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
        <footer>
          <button type="button" class="cancel-button" @click="$emit('close')">{{ content.cancel }}</button>
          <button type="submit" class="save-button">{{ content.save }}</button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({ open: Boolean, machine: { type: Object, default: null } })
const emit = defineEmits(['close', 'save'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)
const errorMessage = ref('')

const pageContent = {
  FR: {
    eyebrow: 'Machine',
    addTitle: 'Ajouter une machine',
    editTitle: 'Modifier la machine',
    close: 'Fermer',
    select: 'Selectionner',
    cancel: 'Annuler',
    save: 'Enregistrer',
    chooseFile: 'Choisir un fichier',
    required: 'Veuillez remplir les champs obligatoires.',
    fields: {
      id: 'ID machine',
      name: 'Nom',
      category: 'Categorie',
      line: 'Ligne de production',
      manufacturer: 'Fabricant',
      model: 'Modele',
      serialNumber: 'Numero de serie',
      commissioningDate: 'Date de mise en service',
      location: 'Localisation',
      criticality: 'Criticite',
      status: 'Etat',
      availability: 'Disponibilite (%)',
      lastMaintenance: 'Derniere maintenance',
      nextMaintenance: 'Prochaine maintenance',
      description: 'Description',
      photo: 'Photo',
      technicalDocument: 'Document technique',
    },
    categories: { Mecanique: 'Mecanique', Hydraulique: 'Hydraulique', Electrique: 'Electrique', Pneumatique: 'Pneumatique', Conditionnement: 'Conditionnement', Utilites: 'Utilites' },
    statuses: { 'En service': 'En service', 'En maintenance': 'En maintenance', 'En panne': 'En panne', 'Hors service': 'Hors service' },
    criticalities: { Critique: 'Critique', Haute: 'Haute', Moyenne: 'Moyenne', Faible: 'Faible' },
  },
  EN: {
    eyebrow: 'Machine',
    addTitle: 'Add machine',
    editTitle: 'Edit machine',
    close: 'Close',
    select: 'Select',
    cancel: 'Cancel',
    save: 'Save',
    chooseFile: 'Choose a file',
    required: 'Please fill in the required fields.',
    fields: {
      id: 'Machine ID',
      name: 'Name',
      category: 'Category',
      line: 'Production line',
      manufacturer: 'Manufacturer',
      model: 'Model',
      serialNumber: 'Serial number',
      commissioningDate: 'Commissioning date',
      location: 'Location',
      criticality: 'Criticality',
      status: 'Status',
      availability: 'Availability (%)',
      lastMaintenance: 'Last maintenance',
      nextMaintenance: 'Next maintenance',
      description: 'Description',
      photo: 'Photo',
      technicalDocument: 'Technical document',
    },
    categories: { Mecanique: 'Mechanical', Hydraulique: 'Hydraulic', Electrique: 'Electrical', Pneumatique: 'Pneumatic', Conditionnement: 'Packaging', Utilites: 'Utilities' },
    statuses: { 'En service': 'In service', 'En maintenance': 'In maintenance', 'En panne': 'Broken down', 'Hors service': 'Out of service' },
    criticalities: { Critique: 'Critical', Haute: 'High', Moyenne: 'Medium', Faible: 'Low' },
  },
  AR: {
    eyebrow: '\u0622\u0644\u0629',
    addTitle: '\u0625\u0636\u0627\u0641\u0629 \u0622\u0644\u0629',
    editTitle: '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0622\u0644\u0629',
    close: '\u0625\u063a\u0644\u0627\u0642',
    select: '\u0627\u062e\u062a\u0631',
    cancel: '\u0625\u0644\u063a\u0627\u0621',
    save: '\u062d\u0641\u0638',
    chooseFile: '\u0627\u062e\u062a\u064a\u0627\u0631 \u0645\u0644\u0641',
    required: '\u064a\u0631\u062c\u0649 \u0645\u0644\u0621 \u0627\u0644\u062d\u0642\u0648\u0644 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064a\u0629.',
    fields: {
      id: '\u0645\u0639\u0631\u0641 \u0627\u0644\u0622\u0644\u0629',
      name: '\u0627\u0644\u0627\u0633\u0645',
      category: '\u0627\u0644\u0641\u0626\u0629',
      line: '\u062e\u0637 \u0627\u0644\u0625\u0646\u062a\u0627\u062c',
      manufacturer: '\u0627\u0644\u0645\u0635\u0646\u0639',
      model: '\u0627\u0644\u0646\u0645\u0648\u0630\u062c',
      serialNumber: '\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062a\u0633\u0644\u0633\u0644\u064a',
      commissioningDate: '\u062a\u0627\u0631\u064a\u062e \u0628\u062f\u0621 \u0627\u0644\u062e\u062f\u0645\u0629',
      location: '\u0627\u0644\u0645\u0648\u0642\u0639',
      criticality: '\u0627\u0644\u062d\u0631\u062c\u064a\u0629',
      status: '\u0627\u0644\u062d\u0627\u0644\u0629',
      availability: '\u0627\u0644\u062a\u0648\u0641\u0631 (%)',
      lastMaintenance: '\u0622\u062e\u0631 \u0635\u064a\u0627\u0646\u0629',
      nextMaintenance: '\u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629',
      description: '\u0627\u0644\u0648\u0635\u0641',
      photo: '\u0635\u0648\u0631\u0629',
      technicalDocument: '\u0648\u062b\u064a\u0642\u0629 \u062a\u0642\u0646\u064a\u0629',
    },
    categories: { Mecanique: '\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a\u0629', Hydraulique: '\u0647\u064a\u062f\u0631\u0648\u0644\u064a\u0643\u064a\u0629', Electrique: '\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629', Pneumatique: '\u0647\u0648\u0627\u0626\u064a\u0629', Conditionnement: '\u0627\u0644\u062a\u0639\u0628\u0626\u0629', Utilites: '\u0627\u0644\u0645\u0631\u0627\u0641\u0642' },
    statuses: { 'En service': '\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629', 'En maintenance': '\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629', 'En panne': '\u0641\u064a \u0639\u0637\u0644', 'Hors service': '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629' },
    criticalities: { Critique: '\u062d\u0631\u062c\u0629', Haute: '\u0639\u0627\u0644\u064a\u0629', Moyenne: '\u0645\u062a\u0648\u0633\u0637\u0629', Faible: '\u0645\u0646\u062e\u0641\u0636\u0629' },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)
const valueLabels = {
  EN: {
    names: {
      "Tour d'usinage": 'Machining lathe',
      'Presse hydraulique': 'Hydraulic press',
      'Convoyeur a bande': 'Belt conveyor',
      "Compresseur d'air": 'Air compressor',
      'Etiqueteuse automatique': 'Automatic labeler',
    },
    lines: {
      'Ligne Production 1': 'Production line 1',
      'Ligne Production 2': 'Production line 2',
      'Ligne Conditionnement': 'Packaging line',
      'Ligne Utilites': 'Utilities line',
    },
    locations: {
      'Atelier A': 'Workshop A',
      'Atelier B': 'Workshop B',
      'Local technique': 'Technical room',
      'Zone conditionnement': 'Packaging area',
      'Zone emballage': 'Packing area',
    },
    descriptions: {
      'Machine industrielle suivie dans le parc SmartCalyx.': 'Industrial machine monitored in the SmartCalyx fleet.',
    },
  },
  AR: {
    names: {
      "Tour d'usinage": 'مخرطة تصنيع',
      'Presse hydraulique': 'مكبس هيدروليكي',
      'Convoyeur a bande': 'ناقل بالحزام',
      "Compresseur d'air": 'ضاغط هواء',
      'Etiqueteuse automatique': 'آلة وسم أوتوماتيكية',
    },
    lines: {
      'Ligne Production 1': 'خط الإنتاج 1',
      'Ligne Production 2': 'خط الإنتاج 2',
      'Ligne Conditionnement': 'خط التكييف',
      'Ligne Utilites': 'خط المرافق',
    },
    locations: {
      'Atelier A': 'الورشة A',
      'Atelier B': 'الورشة B',
      'Local technique': 'الغرفة التقنية',
      'Zone conditionnement': 'منطقة التكييف',
      'Zone emballage': 'منطقة التغليف',
    },
    descriptions: {
      'Machine industrielle suivie dans le parc SmartCalyx.': 'آلة صناعية يتم تتبعها ضمن أسطول SmartCalyx.',
    },
  },
}
const categoryValues = ['Mecanique', 'Hydraulique', 'Electrique', 'Pneumatique', 'Conditionnement', 'Utilites']
const statusValues = ['En service', 'En maintenance', 'En panne', 'Hors service']
const criticalityValues = ['Critique', 'Haute', 'Moyenne', 'Faible']
const optionList = (values, labels) => values.map((value) => ({ value, label: labels[value] || value }))
const fields = computed(() => [
  { key: 'id', label: content.value.fields.id, required: true },
  { key: 'name', label: content.value.fields.name, required: true },
  { key: 'category', label: content.value.fields.category, required: true, options: optionList(categoryValues, content.value.categories) },
  { key: 'line', label: content.value.fields.line, required: true },
  { key: 'manufacturer', label: content.value.fields.manufacturer },
  { key: 'model', label: content.value.fields.model },
  { key: 'serialNumber', label: content.value.fields.serialNumber },
  { key: 'commissioningDate', label: content.value.fields.commissioningDate },
  { key: 'location', label: content.value.fields.location },
  { key: 'criticality', label: content.value.fields.criticality, options: optionList(criticalityValues, content.value.criticalities) },
  { key: 'status', label: content.value.fields.status, options: optionList(statusValues, content.value.statuses) },
  { key: 'availability', label: content.value.fields.availability, type: 'number' },
  { key: 'lastMaintenance', label: content.value.fields.lastMaintenance },
  { key: 'nextMaintenance', label: content.value.fields.nextMaintenance },
  { key: 'description', label: content.value.fields.description, type: 'textarea' },
  { key: 'photo', label: content.value.fields.photo, type: 'file', accept: 'image/*' },
  { key: 'technicalDocument', label: content.value.fields.technicalDocument, type: 'file', accept: '.pdf' },
])
const emptyForm = () => ({ id: '', name: '', category: 'Mecanique', line: '', manufacturer: '', model: '', serialNumber: '', commissioningDate: '', location: '', criticality: 'Moyenne', status: 'En service', availability: 100, lastMaintenance: '', nextMaintenance: '', description: '', imageUrl: '/documents/machines/common/photo-zone-machine.svg' })
const form = reactive(emptyForm())
const fileNames = reactive({ photo: '', technicalDocument: '' })

watch(() => props.machine, (machine) => {
  Object.assign(form, machine || emptyForm())
  form.description = descriptionLabel(form.description)
  fileNames.photo = ''
  fileNames.technicalDocument = ''
  errorMessage.value = ''
}, { immediate: true })

function submitForm() {
  if (!form.id || !form.name || !form.category || !form.line) { errorMessage.value = content.value.required; return }
  emit('save', { ...props.machine, ...form, availability: Number(form.availability || 0) })
}

function descriptionLabel(value) {
  return valueLabels[language.value]?.descriptions?.[value] || value || ''
}

function setFileName(key, event) {
  const file = event.target.files?.[0]
  fileNames[key] = file?.name || ''

  if (key === 'photo' && file) {
    const reader = new FileReader()
    reader.onload = () => {
      form.imageUrl = String(reader.result || '')
    }
    reader.readAsDataURL(file)
  }
}

function fieldDisplayValue(key) {
  const value = form[key]
  if (key === 'name') return valueLabels[language.value]?.names?.[value] || value
  if (key === 'line') return valueLabels[language.value]?.lines?.[value] || value
  if (key === 'location') return valueLabels[language.value]?.locations?.[value] || value
  if (key === 'description') return descriptionLabel(value)
  return value
}

function updateField(key, value) {
  form[key] = value
}

function fieldDirection(key) {
  if (['id', 'manufacturer', 'model', 'serialNumber', 'commissioningDate', 'lastMaintenance', 'nextMaintenance', 'availability'].includes(key)) return 'ltr'
  return language.value === 'AR' ? 'rtl' : 'ltr'
}
</script>

<style scoped>
.modal-overlay { position: fixed; z-index: 10000; inset: 0; display: grid; padding: 25px; place-items: center; background: rgba(17,24,39,.35); backdrop-filter: blur(3px); }
.modal-card { width: min(900px, 100%); max-height: 92vh; overflow-y: auto; background: white; border-radius: 22px; box-shadow: 0 24px 70px rgba(0,0,0,.18); }
header, footer { display: flex; justify-content: space-between; gap: 12px; padding: 22px 24px; border-bottom: 1px solid #edf0e8; }
footer { justify-content: flex-end; border-top: 1px solid #edf0e8; border-bottom: 0; }
header span { color: #6a9a2a; font-size: 11px; font-weight: 900; text-transform: uppercase; }
header h2 { margin: 5px 0 0; color: #111827; }
header button { width: 36px; height: 36px; background: #f7f9f3; border: 0; border-radius: 10px; cursor: pointer; }
.form-body { display: grid; grid-template-columns: repeat(2, 1fr); gap: 17px; padding: 24px; }
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group.full, .error-message { grid-column: 1 / -1; }
label { color: #4a0a0a; font-size: 12px; font-weight: 900; }
input, select, textarea { width: 100%; padding: 12px; background: #fafbf7; border: 1px solid #dfe5d6; border-radius: 11px; outline: none; font: inherit; box-sizing: border-box; }
input:focus, select:focus, textarea:focus { border-color: #6a9a2a; box-shadow: 0 0 0 3px rgba(106,154,42,.12); }
.file-picker { display: flex; align-items: center; min-height: 46px; padding: 0 12px; background: #fafbf7; border: 1px solid #dfe5d6; border-radius: 11px; color: #4a0a0a; cursor: pointer; box-sizing: border-box; }
.file-picker input { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }
.file-picker span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.photo-preview { width: 100%; height: 150px; object-fit: cover; border: 1px solid #dfe5d6; border-radius: 12px; background: #fafbf7; }
.error-message { margin: 0; color: #e31e24; font-weight: 800; }
footer button { min-height: 44px; padding: 0 18px; border-radius: 11px; font-weight: 900; cursor: pointer; }
.cancel-button { background: white; border: 1px solid #dfe5d6; color: #64748b; }
.save-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
@media (max-width: 650px) { .form-body { grid-template-columns: 1fr; } .form-group.full, .error-message { grid-column: auto; } }
</style>
