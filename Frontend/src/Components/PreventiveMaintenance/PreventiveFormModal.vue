<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" @submit.prevent="submitForm">
        <header>
          <div>
            <span>{{ content.kicker }}</span>
            <h2>{{ maintenance ? content.editTitle : content.createTitle }}</h2>
          </div>
          <button type="button" @click="$emit('close')">x</button>
        </header>

        <div class="form-body">
          <div class="form-group full">
            <label>{{ content.plan }} *</label>
            <input v-model.trim="form.plan" required :placeholder="content.planPlaceholder" />
          </div>

          <div class="form-group">
            <label>{{ content.machine }} *</label>
            <select v-model="form.machine" required>
              <option value="">{{ content.select }}</option>
              <option v-for="machine in machines" :key="machine" :value="machine">{{ machine }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ content.line }} *</label>
            <select v-model="form.line" required>
              <option value="">{{ content.select }}</option>
              <option v-for="line in lines" :key="line" :value="line">{{ line }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ content.frequency }} *</label>
            <select v-model="form.frequency" required>
              <option value="">{{ content.select }}</option>
              <option v-for="frequency in frequencies" :key="frequency.value" :value="frequency.value">
                {{ frequency.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ content.responsible }} *</label>
            <select v-model="form.technician" required>
              <option value="">{{ content.select }}</option>
              <option>Nabil Amrani</option>
              <option>Ahmed El Mansouri</option>
              <option>Sara El Idrissi</option>
              <option>Youssef Berrada</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ content.nextDueDate }} *</label>
            <input v-model="form.nextDueDate" type="date" required />
          </div>

          <div class="form-group">
            <label>{{ content.duration }}</label>
            <input v-model="form.estimatedDuration" :placeholder="content.durationPlaceholder" />
          </div>

          <div class="form-group full">
            <label>{{ content.description }}</label>
            <textarea v-model.trim="form.description" rows="4" :placeholder="content.descriptionPlaceholder"></textarea>
          </div>
        </div>

        <footer>
          <button type="button" class="cancel-button" @click="$emit('close')">
            {{ content.cancel }}
          </button>
          <button type="submit" class="save-button">
            {{ maintenance ? content.saveEdit : content.saveCreate }}
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  open: Boolean,
  maintenance: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const translations = {
  FR: {
    kicker: 'Maintenance preventive',
    editTitle: 'Modifier le plan',
    createTitle: 'Nouveau plan preventif',
    plan: 'Nom du plan',
    planPlaceholder: 'Ex. Graissage du moteur',
    machine: 'Machine',
    line: 'Ligne',
    frequency: 'Frequence',
    responsible: 'Responsable',
    nextDueDate: 'Prochaine echeance',
    duration: 'Duree estimee',
    durationPlaceholder: 'Ex. 2 heures',
    description: 'Description',
    descriptionPlaceholder: 'Decrire les controles et operations a realiser...',
    select: 'Selectionner',
    cancel: 'Annuler',
    saveEdit: 'Enregistrer les modifications',
    saveCreate: 'Creer le plan',
    frequencies: ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Annuelle'],
  },
  EN: {
    kicker: 'Preventive maintenance',
    editTitle: 'Edit plan',
    createTitle: 'New preventive plan',
    plan: 'Plan name',
    planPlaceholder: 'E.g. Motor greasing',
    machine: 'Machine',
    line: 'Line',
    frequency: 'Frequency',
    responsible: 'Responsible',
    nextDueDate: 'Next due date',
    duration: 'Estimated duration',
    durationPlaceholder: 'E.g. 2 hours',
    description: 'Description',
    descriptionPlaceholder: 'Describe the checks and operations to perform...',
    select: 'Select',
    cancel: 'Cancel',
    saveEdit: 'Save changes',
    saveCreate: 'Create plan',
    frequencies: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
  },
  AR: {
    kicker: 'الصيانة الوقائية',
    editTitle: 'تعديل الخطة',
    createTitle: 'خطة وقائية جديدة',
    plan: 'اسم الخطة',
    planPlaceholder: 'مثال: تشحيم المحرك',
    machine: 'الآلة',
    line: 'الخط',
    frequency: 'التواتر',
    responsible: 'المسؤول',
    nextDueDate: 'الموعد القادم',
    duration: 'المدة المقدرة',
    durationPlaceholder: 'مثال: ساعتان',
    description: 'الوصف',
    descriptionPlaceholder: 'صف الفحوصات والعمليات المطلوب إنجازها...',
    select: 'اختيار',
    cancel: 'إلغاء',
    saveEdit: 'حفظ التعديلات',
    saveCreate: 'إنشاء الخطة',
    frequencies: ['يومية', 'أسبوعية', 'شهرية', 'ربع سنوية', 'سنوية'],
  },
}

const rawFrequencies = ['Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Annuelle']
const machines = ['Convoyeur M-309', 'Pasteurisateur P-204', 'Remplisseuse R-118', 'Compresseur M-412']
const lines = ['Ligne Production 1', 'Ligne Conditionnement', 'Ligne Utilites']
const content = computed(() => translations[language.value] || translations.FR)
const frequencies = computed(() => rawFrequencies.map((value, index) => ({ value, label: content.value.frequencies[index] || value })))

const emptyForm = () => ({
  plan: '',
  machine: '',
  line: '',
  frequency: '',
  technician: '',
  nextDueDate: '',
  estimatedDuration: '',
  description: '',
})

const form = reactive(emptyForm())

watch(
  () => props.maintenance,
  (maintenance) => {
    Object.assign(form, maintenance || emptyForm())
  },
  { immediate: true }
)

const submitForm = () => {
  emit('save', {
    ...props.maintenance,
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
  background: rgba(5, 10, 18, 0.56);
  backdrop-filter: blur(3px);
}

.modal-card {
  width: min(720px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(31,43,57,.98), rgba(16,25,36,.98)), #101924;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 14px;
  color: #f4f7fb;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.52);
}

header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(116, 135, 158, 0.15);
}

header span {
  color: #83b95c;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

header h2 {
  margin: 5px 0 0;
  color: #f8fbff;
  font-size: 21px;
}

header button {
  width: 36px;
  height: 36px;
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(210, 221, 234, 0.28);
  border-radius: 8px;
  color: #f2f6fb;
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

.form-group.full {
  grid-column: 1 / -1;
}

label {
  color: #aeb9c8;
  font-size: 12px;
  font-weight: 800;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px;
  background: #0d1520;
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
  color: #f4f7fb;
  outline: none;
  font: inherit;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  border-color: rgba(131, 185, 92, 0.62);
  box-shadow: 0 0 0 3px rgba(131, 185, 92, 0.12);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid rgba(116, 135, 158, 0.15);
}

footer button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button {
  background: rgba(13, 21, 32, 0.82);
  border: 1px solid rgba(210, 221, 234, 0.28);
  color: #f2f6fb;
}

.save-button {
  background: #5f8f2f;
  border: 1px solid rgba(131, 185, 92, 0.44);
  color: white;
}

@media (max-width: 650px) {
  .form-body {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: auto;
  }
}
</style>
