<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" @submit.prevent="submitForm">
        <header><div><span>Machine</span><h2>{{ machine ? 'Modifier la machine' : 'Ajouter une machine' }}</h2></div><button type="button" @click="$emit('close')">×</button></header>
        <div class="form-body">
          <div v-for="field in fields" :key="field.key" class="form-group" :class="{ full: field.type === 'textarea' }">
            <label>{{ field.label }} <span v-if="field.required">*</span></label>
            <select v-if="field.options" v-model="form[field.key]" :required="field.required"><option value="">Sélectionner</option><option v-for="option in field.options" :key="option">{{ option }}</option></select>
            <textarea v-else-if="field.type === 'textarea'" v-model.trim="form[field.key]" rows="4"></textarea>
            <input v-else v-model.trim="form[field.key]" :type="field.type || 'text'" :required="field.required" />
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
        <footer><button type="button" class="cancel-button" @click="$emit('close')">Annuler</button><button type="submit" class="save-button">Enregistrer</button></footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
const props = defineProps({ open: Boolean, machine: { type: Object, default: null } })
const emit = defineEmits(['close', 'save'])
const errorMessage = ref('')
const categories = ['Mécanique', 'Hydraulique', 'Électrique', 'Pneumatique', 'Conditionnement', 'Utilités']
const statuses = ['En service', 'En maintenance', 'En panne', 'Hors service']
const criticalities = ['Critique', 'Haute', 'Moyenne', 'Faible']
const fields = [
  { key: 'id', label: 'ID machine', required: true }, { key: 'name', label: 'Nom', required: true },
  { key: 'category', label: 'Catégorie', required: true, options: categories }, { key: 'line', label: 'Ligne de production', required: true },
  { key: 'manufacturer', label: 'Fabricant' }, { key: 'model', label: 'Modèle' }, { key: 'serialNumber', label: 'Numéro de série' },
  { key: 'commissioningDate', label: 'Date de mise en service' }, { key: 'location', label: 'Localisation' },
  { key: 'criticality', label: 'Criticité', options: criticalities }, { key: 'status', label: 'État', options: statuses },
  { key: 'availability', label: 'Disponibilité (%)', type: 'number' }, { key: 'lastMaintenance', label: 'Dernière maintenance' }, { key: 'nextMaintenance', label: 'Prochaine maintenance' },
  { key: 'description', label: 'Description', type: 'textarea' }, { key: 'photo', label: 'Photo', type: 'file' }, { key: 'technicalDocument', label: 'Document technique', type: 'file' }
]
const emptyForm = () => ({ id: '', name: '', category: 'Mécanique', line: '', manufacturer: '', model: '', serialNumber: '', commissioningDate: '', location: '', criticality: 'Moyenne', status: 'En service', availability: 100, lastMaintenance: '', nextMaintenance: '', description: '' })
const form = reactive(emptyForm())
watch(() => props.machine, (machine) => { Object.assign(form, machine || emptyForm()); errorMessage.value = '' }, { immediate: true })
function submitForm() {
  if (!form.id || !form.name || !form.category || !form.line) { errorMessage.value = 'Veuillez remplir les champs obligatoires.'; return }
  emit('save', { ...props.machine, ...form, availability: Number(form.availability || 0) })
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
.error-message { margin: 0; color: #e31e24; font-weight: 800; }
footer button { min-height: 44px; padding: 0 18px; border-radius: 11px; font-weight: 900; cursor: pointer; }
.cancel-button { background: white; border: 1px solid #dfe5d6; color: #64748b; }
.save-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
@media (max-width: 650px) { .form-body { grid-template-columns: 1fr; } .form-group.full, .error-message { grid-column: auto; } }
</style>
