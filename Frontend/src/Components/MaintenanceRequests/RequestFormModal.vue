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
  background: rgba(5, 10, 17, 0.68);
  backdrop-filter: blur(6px);
}

.modal-card {
  width: min(850px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: rgba(17, 27, 38, 0.96);
  border: 1px solid rgba(126, 146, 170, 0.3);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
}

header,
footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(126, 146, 170, 0.22);
}

footer {
  justify-content: flex-end;
  flex-wrap: wrap;
  border-top: 1px solid rgba(126, 146, 170, 0.22);
  border-bottom: 0;
}

header span { color: #bce39d; font-size: 11px; font-weight: 900; text-transform: uppercase; }
header h2 { margin: 5px 0 0; color: #f8fbff; }
header button { width: 36px; height: 36px; background: #0d1520; border: 1px solid rgba(210, 221, 234, 0.18); border-radius: 8px; color: #f4f7fb; cursor: pointer; }
.form-body { display: grid; grid-template-columns: repeat(2, 1fr); gap: 17px; padding: 24px; }
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group.full, .error-message { grid-column: 1 / -1; }
label { color: #d7e0ec; font-size: 12px; font-weight: 900; }
input, select, textarea {
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
input::placeholder, textarea::placeholder { color: #6f7e91; }
input:focus, select:focus, textarea:focus {
  border-color: #83b95c;
  box-shadow: 0 0 0 3px rgba(131, 185, 92, 0.16);
}
.error-message { margin: 0; color: #ff7f8e; font-weight: 800; }
footer button { min-height: 44px; padding: 0 18px; border-radius: 8px; font-weight: 900; cursor: pointer; }
.cancel-button, .draft-button { background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); color: #d7e0ec; }
.save-button { background: #5f8f2f; border: 1px solid rgba(131, 185, 92, 0.44); color: #f8fbff; }
@media (max-width: 650px) {
  .form-body { grid-template-columns: 1fr; }
  .form-group.full, .error-message { grid-column: auto; }
}
</style>
