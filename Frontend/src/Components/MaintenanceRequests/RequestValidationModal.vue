<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" @submit.prevent="submit">
        <header>
          <div>
            <span>Validation de demande</span>
            <h2>{{ title }}</h2>
          </div>
          <button type="button" @click="$emit('close')">×</button>
        </header>

        <div class="form-body">
          <div v-if="action === 'accept'" class="form-group">
            <label>Priorité confirmée</label>
            <select v-model="form.priority">
              <option>Critique</option><option>Haute</option><option>Moyenne</option><option>Faible</option>
            </select>
          </div>

          <div v-if="action === 'accept'" class="form-group">
            <label>Technicien suggéré</label>
            <input v-model.trim="form.technician" />
          </div>

          <div v-if="action === 'accept'" class="form-group">
            <label>Date souhaitée</label>
            <input v-model="form.targetDate" type="date" />
          </div>

          <div v-if="action === 'reject'" class="form-group full">
            <label>Motif du refus *</label>
            <textarea v-model.trim="form.reason" rows="3"></textarea>
          </div>

          <div v-if="action === 'askInfo'" class="form-group full">
            <label>Informations demandées *</label>
            <textarea v-model.trim="form.requestedInfo" rows="3"></textarea>
          </div>

          <div v-if="action === 'askInfo'" class="form-group">
            <label>Échéance de réponse</label>
            <input v-model="form.responseDueDate" type="date" />
          </div>

          <div class="form-group full">
            <label>Commentaire</label>
            <textarea v-model.trim="form.comment" rows="3"></textarea>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <footer>
          <button type="button" class="cancel-button" @click="$emit('close')">Annuler</button>
          <button type="submit" class="save-button">{{ submitLabel }}</button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  action: { type: String, default: '' },
  request: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm'])
const errorMessage = ref('')

const form = reactive({
  priority: 'Moyenne',
  technician: 'Nabil Amrani',
  targetDate: '2026-07-18',
  reason: '',
  requestedInfo: '',
  responseDueDate: '2026-07-19',
  comment: ''
})

watch(() => props.request, (request) => {
  form.priority = request?.priority || 'Moyenne'
  form.technician = 'Nabil Amrani'
  form.targetDate = '2026-07-18'
  form.reason = ''
  form.requestedInfo = ''
  form.responseDueDate = '2026-07-19'
  form.comment = ''
  errorMessage.value = ''
}, { immediate: true })

const title = computed(() => ({
  accept: 'Accepter la demande',
  reject: 'Refuser la demande',
  askInfo: 'Demander des informations'
}[props.action] || 'Validation'))

const submitLabel = computed(() => ({
  accept: 'Accepter',
  reject: 'Refuser',
  askInfo: 'Envoyer la demande'
}[props.action] || 'Valider'))

function submit() {
  if (props.action === 'reject' && !form.reason.trim()) {
    errorMessage.value = 'Le motif de refus est obligatoire.'
    return
  }

  if (props.action === 'askInfo' && !form.requestedInfo.trim()) {
    errorMessage.value = 'Le message d’informations demandées est obligatoire.'
    return
  }

  emit('confirm', { action: props.action, payload: { ...form } })
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
  width: min(620px, 100%);
  overflow: hidden;
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
  border-top: 1px solid rgba(126, 146, 170, 0.22);
  border-bottom: 0;
}

header span { color: #bce39d; font-size: 11px; font-weight: 900; text-transform: uppercase; }
header h2 { margin: 5px 0 0; color: #f8fbff; }
header button { width: 36px; height: 36px; background: #0d1520; border: 1px solid rgba(210, 221, 234, 0.18); border-radius: 8px; color: #f4f7fb; cursor: pointer; }

.form-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 17px;
  padding: 24px;
}

.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group.full,
.error-message { grid-column: 1 / -1; }
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
.cancel-button { background: rgba(13, 21, 32, 0.82); border: 1px solid rgba(210, 221, 234, 0.28); color: #d7e0ec; }
.save-button { background: #5f8f2f; border: 1px solid rgba(131, 185, 92, 0.44); color: #f8fbff; }
</style>
