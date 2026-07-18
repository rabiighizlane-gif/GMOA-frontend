<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" @submit.prevent="submit('En attente')">
        <header>
          <div>
            <span>Demande de maintenance</span>
            <h2>{{ request ? 'Modifier la demande' : 'Nouvelle demande' }}</h2>
          </div>
          <button type="button" @click="$emit('close')">×</button>
        </header>

        <div class="form-body">
          <div class="form-group">
            <label>Machine *</label>
            <input v-model.trim="form.machine" required />
          </div>
          <div class="form-group">
            <label>Ligne *</label>
            <input v-model.trim="form.line" required />
          </div>
          <div class="form-group">
            <label>Type de problème *</label>
            <select v-model="form.problemType" required>
              <option value="">Sélectionner</option>
              <option v-for="type in problemTypes" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priorité *</label>
            <select v-model="form.priority" required>
              <option>Critique</option><option>Haute</option><option>Moyenne</option><option>Faible</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date et heure d’observation</label>
            <input v-model="form.observedAt" type="datetime-local" />
          </div>
          <div class="form-group">
            <label>Demandeur</label>
            <input v-model.trim="form.requester" />
          </div>
          <div class="form-group">
            <label>Machine arrêtée</label>
            <select v-model="form.machineStopped">
              <option :value="false">Non</option>
              <option :value="true">Oui</option>
            </select>
          </div>
          <div class="form-group">
            <label>Risque sécurité</label>
            <select v-model="form.safetyRisk">
              <option :value="false">Non</option>
              <option :value="true">Oui</option>
            </select>
          </div>
          <div class="form-group">
            <label>Localisation précise</label>
            <input v-model.trim="form.zone" />
          </div>
          <div class="form-group">
            <label>Photo ou pièce jointe</label>
            <input type="file" />
          </div>
          <div class="form-group full">
            <label>Description courte *</label>
            <input v-model.trim="form.shortDescription" required />
          </div>
          <div class="form-group full">
            <label>Description détaillée *</label>
            <textarea v-model.trim="form.fullDescription" rows="4" required></textarea>
          </div>
          <div class="form-group full">
            <label>Symptômes observés</label>
            <textarea v-model.trim="form.symptoms" rows="3"></textarea>
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <footer>
          <button type="button" class="cancel-button" @click="$emit('close')">Annuler</button>
          <button type="button" class="draft-button" @click="submit('Brouillon')">Enregistrer comme brouillon</button>
          <button type="submit" class="save-button">Soumettre la demande</button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  request: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])
const errorMessage = ref('')
const problemTypes = ['Mécanique', 'Électrique', 'Pneumatique', 'Hydraulique', 'Température', 'Bruit', 'Vibration', 'Fuite', 'Autre']

const emptyForm = () => ({
  machine: '',
  line: '',
  problemType: '',
  shortDescription: '',
  fullDescription: '',
  priority: 'Moyenne',
  observedAt: '2026-07-18T08:00',
  machineStopped: false,
  safetyRisk: false,
  zone: '',
  symptoms: '',
  requester: 'Super Admin',
  operatorComment: ''
})

const form = reactive(emptyForm())

watch(() => props.request, (request) => {
  Object.assign(form, request || emptyForm())
  errorMessage.value = ''
}, { immediate: true })

function submit(status) {
  if (!form.machine || !form.line || !form.problemType || !form.shortDescription || !form.fullDescription) {
    errorMessage.value = 'Veuillez remplir les champs obligatoires.'
    return
  }

  emit('save', {
    ...props.request,
    ...form,
    status
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
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(3px);
}

.modal-card {
  width: min(850px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
}

header,
footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px;
  border-bottom: 1px solid #edf0e8;
}

footer {
  justify-content: flex-end;
  flex-wrap: wrap;
  border-top: 1px solid #edf0e8;
  border-bottom: 0;
}

header span { color: #6a9a2a; font-size: 11px; font-weight: 900; text-transform: uppercase; }
header h2 { margin: 5px 0 0; color: #111827; }
header button { width: 36px; height: 36px; background: #f7f9f3; border: 0; border-radius: 10px; cursor: pointer; }
.form-body { display: grid; grid-template-columns: repeat(2, 1fr); gap: 17px; padding: 24px; }
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group.full, .error-message { grid-column: 1 / -1; }
label { color: #4a0a0a; font-size: 12px; font-weight: 900; }
input, select, textarea {
  width: 100%;
  padding: 12px;
  background: #fafbf7;
  border: 1px solid #dfe5d6;
  border-radius: 11px;
  outline: none;
  font: inherit;
  box-sizing: border-box;
}
input:focus, select:focus, textarea:focus {
  border-color: #6a9a2a;
  box-shadow: 0 0 0 3px rgba(106, 154, 42, 0.12);
}
.error-message { margin: 0; color: #e31e24; font-weight: 800; }
footer button { min-height: 44px; padding: 0 18px; border-radius: 11px; font-weight: 900; cursor: pointer; }
.cancel-button, .draft-button { background: white; border: 1px solid #dfe5d6; color: #64748b; }
.save-button { background: #6a9a2a; border: 1px solid #6a9a2a; color: white; }
@media (max-width: 650px) {
  .form-body { grid-template-columns: 1fr; }
  .form-group.full, .error-message { grid-column: auto; }
}
</style>
