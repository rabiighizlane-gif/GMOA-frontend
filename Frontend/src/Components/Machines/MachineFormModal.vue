<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" :dir="language === 'AR' ? 'rtl' : 'ltr'" @submit.prevent="submitForm">
        <header>
          <div><span>{{ content.eyebrow }}</span><h2>{{ machine ? content.editTitle : content.addTitle }}</h2></div>
          <button type="button" :aria-label="content.close" @click="$emit('close')">x</button>
        </header>
        <div class="form-body">
          <div class="form-group">
            <label>{{ content.fields.code }} <span>*</span></label>
            <input v-model.trim="form.code" required dir="ltr" />
          </div>
          <div class="form-group">
            <label>{{ content.fields.name }} <span>*</span></label>
            <input v-model.trim="form.name" required :dir="language === 'AR' ? 'rtl' : 'ltr'" />
          </div>
          <div class="form-group">
            <label>{{ content.fields.zone }} <span>*</span></label>
            <select v-model="form.zone_id" required>
              <option value="">{{ content.select }}</option>
              <option v-for="zone in zoneOptions" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ content.fields.periodicity }}</label>
            <select v-model="form.periodicity">
              <option value="">{{ content.select }}</option>
              <option v-for="periodicity in periodicities" :key="periodicity.value" :value="periodicity.value">{{ periodicity.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ content.fields.status }}</label>
            <select v-model="form.status">
              <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
            </select>
          </div>
          <div v-for="field in optionalFormFields" :key="field.key" class="form-group">
            <label>{{ field.label }} <span v-if="field.required">*</span></label>
            <select v-if="field.options" v-model="form[field.key]" :required="field.required">
              <option value="">{{ content.select }}</option>
              <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <input v-else v-model.trim="form[field.key]" :type="field.type || 'text'" :required="field.required" :dir="field.dir || null" />
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

const props = defineProps({
  open: Boolean,
  machine: { type: Object, default: null },
  zoneOptions: { type: Array, default: () => [] },
  enabledOptionalFields: { type: Array, default: () => [] },
  fieldSettings: { type: Array, default: () => [] },
})
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
    required: 'Veuillez renseigner le code, le nom et une zone reelle.',
    fields: {
      code: 'Code',
      name: 'Nom',
      zone: 'Usine / Zone',
      periodicity: 'Periodicite',
      status: 'Etat',
      category: 'Catégorie',
      criticality: 'Criticité',
      availability: 'Disponibilité',
      last_maintenance: 'Dernière maintenance',
      next_maintenance: 'Prochaine maintenance',
      image_url: 'Image officielle',
    },
    periodicities: {
      HEBDOMADAIRE: 'Hebdomadaire',
      MENSUELLE: 'Mensuelle',
      BIMESTRIELLE: 'Tous les 2 mois',
      TRIMESTRIELLE: 'Tous les 3 mois',
    },
    statuses: {
      OPERATIONAL: 'En service',
      IN_MAINTENANCE: 'En maintenance',
      OUT_OF_SERVICE: 'En panne',
      OFFLINE: 'Hors service',
    },
    criticalities: { CRITICAL: 'Critique', HIGH: 'Haute', MEDIUM: 'Moyenne', LOW: 'Faible' },
  },
  EN: {
    eyebrow: 'Machine',
    addTitle: 'Add machine',
    editTitle: 'Edit machine',
    close: 'Close',
    select: 'Select',
    cancel: 'Cancel',
    save: 'Save',
    required: 'Please provide the code, name, and a real zone.',
    fields: {
      code: 'Code',
      name: 'Name',
      zone: 'Site / Zone',
      periodicity: 'Periodicity',
      status: 'Status',
      category: 'Category',
      criticality: 'Criticality',
      availability: 'Availability',
      last_maintenance: 'Last maintenance',
      next_maintenance: 'Next maintenance',
      image_url: 'Official image',
    },
    periodicities: {
      HEBDOMADAIRE: 'Weekly',
      MENSUELLE: 'Monthly',
      BIMESTRIELLE: 'Every 2 months',
      TRIMESTRIELLE: 'Every 3 months',
    },
    statuses: {
      OPERATIONAL: 'In service',
      IN_MAINTENANCE: 'In maintenance',
      OUT_OF_SERVICE: 'Broken down',
      OFFLINE: 'Out of service',
    },
    criticalities: { CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' },
  },
  AR: {
    eyebrow: '\u0622\u0644\u0629',
    addTitle: '\u0625\u0636\u0627\u0641\u0629 \u0622\u0644\u0629',
    editTitle: '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0622\u0644\u0629',
    close: '\u0625\u063a\u0644\u0627\u0642',
    select: '\u0627\u062e\u062a\u0631',
    cancel: '\u0625\u0644\u063a\u0627\u0621',
    save: '\u062d\u0641\u0638',
    required: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0648\u0627\u0644\u0627\u0633\u0645 \u0648\u0645\u0646\u0637\u0642\u0629 \u062d\u0642\u064a\u0642\u064a\u0629.',
    fields: {
      code: '\u0627\u0644\u0631\u0645\u0632',
      name: '\u0627\u0644\u0627\u0633\u0645',
      zone: '\u0627\u0644\u0645\u0635\u0646\u0639 / \u0627\u0644\u0645\u0646\u0637\u0642\u0629',
      periodicity: '\u0627\u0644\u062f\u0648\u0631\u064a\u0629',
      status: '\u0627\u0644\u062d\u0627\u0644\u0629',
      category: '\u0627\u0644\u0641\u0626\u0629',
      criticality: '\u0627\u0644\u062d\u0631\u062c\u064a\u0629',
      availability: '\u0627\u0644\u062a\u0648\u0641\u0631',
      last_maintenance: '\u0622\u062e\u0631 \u0635\u064a\u0627\u0646\u0629',
      next_maintenance: '\u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629',
      image_url: '\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0633\u0645\u064a\u0629',
    },
    periodicities: {
      HEBDOMADAIRE: '\u0623\u0633\u0628\u0648\u0639\u064a\u0629',
      MENSUELLE: '\u0634\u0647\u0631\u064a\u0629',
      BIMESTRIELLE: '\u0643\u0644 \u0634\u0647\u0631\u064a\u0646',
      TRIMESTRIELLE: '\u0643\u0644 \u062b\u0644\u0627\u062b\u0629 \u0623\u0634\u0647\u0631',
    },
    statuses: {
      OPERATIONAL: '\u0641\u064a \u0627\u0644\u062e\u062f\u0645\u0629',
      IN_MAINTENANCE: '\u0641\u064a \u0627\u0644\u0635\u064a\u0627\u0646\u0629',
      OUT_OF_SERVICE: '\u0641\u064a \u0639\u0637\u0644',
      OFFLINE: '\u062e\u0627\u0631\u062c \u0627\u0644\u062e\u062f\u0645\u0629',
    },
    criticalities: { CRITICAL: '\u062d\u0631\u062c\u0629', HIGH: '\u0639\u0627\u0644\u064a\u0629', MEDIUM: '\u0645\u062a\u0648\u0633\u0637\u0629', LOW: '\u0645\u0646\u062e\u0641\u0636\u0629' },
  },
}

const content = computed(() => pageContent[language.value] || pageContent.FR)
const form = reactive({
  code: '',
  name: '',
  zone_id: '',
  periodicity: '',
  status: 'OPERATIONAL',
  category: '',
  criticality: '',
  availability: '',
  last_maintenance: '',
  next_maintenance: '',
  image_url: '',
})
const periodicities = computed(() => Object.entries(content.value.periodicities).map(([value, label]) => ({ value, label })))
const statuses = computed(() => Object.entries(content.value.statuses).map(([value, label]) => ({ value, label })))
const criticalities = computed(() => Object.entries(content.value.criticalities).map(([value, label]) => ({ value, label })))
const optionalFormFields = computed(() => [
  { key: 'category', label: fieldLabel('category'), required: isFieldRequired('category') },
  { key: 'criticality', label: fieldLabel('criticality'), required: isFieldRequired('criticality'), options: criticalities.value },
  { key: 'availability', label: fieldLabel('availability'), required: isFieldRequired('availability'), type: 'number', dir: 'ltr' },
  { key: 'last_maintenance', label: fieldLabel('last_maintenance'), required: isFieldRequired('last_maintenance'), type: 'date', dir: 'ltr' },
  { key: 'next_maintenance', label: fieldLabel('next_maintenance'), required: isFieldRequired('next_maintenance'), type: 'date', dir: 'ltr' },
  { key: 'image_url', label: fieldLabel('image_url'), required: isFieldRequired('image_url'), type: 'url', dir: 'ltr' },
].filter((field) => isFieldEnabled(field.key)))

watch(() => props.open, (open) => {
  if (!open) return
  fillForm(props.machine)
  errorMessage.value = ''
})

watch(() => props.machine, (machine) => {
  if (!props.open) return
  fillForm(machine)
  errorMessage.value = ''
})

function submitForm() {
  if (!form.code || !form.name || !form.zone_id) {
    errorMessage.value = content.value.required
    return
  }

  const payload = {
    code: form.code,
    name: form.name,
    zone_id: form.zone_id,
    periodicity: form.periodicity || undefined,
    status: form.status,
  }

  optionalFormFields.value.forEach((field) => {
    if (form[field.key] !== '') {
      payload[field.key] = field.key === 'availability' ? Number(form[field.key]) : form[field.key]
    }
  })

  emit('save', payload)
}

function isFieldEnabled(fieldKey) {
  return props.enabledOptionalFields.includes(fieldKey)
}

function isFieldRequired(fieldKey) {
  const setting = props.fieldSettings.find((item) => item.field_key === fieldKey)
  return Boolean(setting?.is_enabled && setting?.is_required)
}

function fieldLabel(fieldKey) {
  const setting = props.fieldSettings.find((item) => item.field_key === fieldKey)
  return setting?.label || content.value.fields[fieldKey] || fieldKey
}

function fillForm(machine) {
  form.code = machine?.code && machine.code !== content.value.unavailableValue ? machine.code : ''
  form.name = machine?.name && machine.name !== content.value.unavailableValue ? machine.name : ''
  form.zone_id = machine?.zoneId || machine?.raw?.zone_id || machine?.raw?.zone?.id || ''
  form.periodicity = machine?.periodicityRaw || ''
  form.status = machine?.statusRaw || 'OPERATIONAL'
  form.category = cleanValue(machine?.category)
  form.criticality = machine?.raw?.criticality || ''
  form.availability = machine?.availability ?? ''
  form.last_maintenance = dateInputValue(machine?.raw?.last_maintenance || machine?.raw?.lastMaintenance)
  form.next_maintenance = dateInputValue(machine?.raw?.next_maintenance || machine?.raw?.nextMaintenance)
  form.image_url = machine?.imageUrl || machine?.raw?.image_url || machine?.raw?.imageUrl || ''
}

function cleanValue(value) {
  return value && value !== content.value.unavailableValue ? value : ''
}

function dateInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}
</script>

<style scoped>
.modal-overlay { position: fixed; z-index: 10000; inset: 0; display: grid; padding: 25px; place-items: center; background: rgba(5,10,18,.56); backdrop-filter: blur(3px); }
.modal-card { width: min(720px, 100%); max-height: 92vh; overflow-y: auto; background: linear-gradient(180deg, rgba(31,43,57,.98), rgba(16,25,36,.98)), #101924; border: 1px solid rgba(126,146,170,.24); border-radius: 14px; color: #f4f7fb; box-shadow: 0 30px 90px rgba(0,0,0,.52); }
header, footer { display: flex; justify-content: space-between; gap: 12px; padding: 22px 24px; border-bottom: 1px solid rgba(116,135,158,.15); }
footer { justify-content: flex-end; border-top: 1px solid rgba(116,135,158,.15); border-bottom: 0; }
header span { color: #83b95c; font-size: 11px; font-weight: 900; text-transform: uppercase; }
header h2 { margin: 5px 0 0; color: #f8fbff; }
header button { width: 36px; height: 36px; background: rgba(13,21,32,.82); border: 1px solid rgba(210,221,234,.28); border-radius: 8px; color: #f2f6fb; cursor: pointer; }
.form-body { display: grid; grid-template-columns: repeat(2, 1fr); gap: 17px; padding: 24px; }
.form-group { display: flex; flex-direction: column; gap: 7px; }
.error-message { grid-column: 1 / -1; margin: 0; color: #ff7f8e; font-weight: 800; }
label { color: #aeb9c8; font-size: 12px; font-weight: 900; }
input, select { width: 100%; padding: 12px; background: #0d1520; border: 1px solid rgba(126,146,170,.26); border-radius: 8px; outline: none; color: #f4f7fb; font: inherit; box-sizing: border-box; }
input:focus, select:focus { border-color: rgba(131,185,92,.62); box-shadow: 0 0 0 3px rgba(131,185,92,.12); }
footer button { min-height: 44px; padding: 0 18px; border-radius: 11px; font-weight: 900; cursor: pointer; }
.cancel-button { background: rgba(13,21,32,.82); border: 1px solid rgba(210,221,234,.28); color: #f2f6fb; }
.save-button { background: #5f8f2f; border: 1px solid rgba(131,185,92,.44); color: white; }
@media (max-width: 650px) { .form-body { grid-template-columns: 1fr; } .error-message { grid-column: auto; } }
</style>
