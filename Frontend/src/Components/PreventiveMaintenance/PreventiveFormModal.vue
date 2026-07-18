<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="$emit('close')"
    >
      <form
        class="modal-card"
        @submit.prevent="submitForm"
      >
        <header>
          <div>
            <span>Maintenance préventive</span>
            <h2>
              {{ maintenance ? 'Modifier le plan' : 'Nouveau plan préventif' }}
            </h2>
          </div>

          <button
            type="button"
            @click="$emit('close')"
          >
            ×
          </button>
        </header>

        <div class="form-body">
          <div class="form-group full">
            <label>Nom du plan *</label>
            <input
              v-model.trim="form.plan"
              required
              placeholder="Ex. Graissage du moteur"
            />
          </div>

          <div class="form-group">
            <label>Machine *</label>
            <select
              v-model="form.machine"
              required
            >
              <option value="">Sélectionner</option>
              <option>Convoyeur M-309</option>
              <option>Pasteurisateur P-204</option>
              <option>Remplisseuse R-118</option>
              <option>Compresseur M-412</option>
            </select>
          </div>

          <div class="form-group">
            <label>Ligne *</label>
            <select
              v-model="form.line"
              required
            >
              <option value="">Sélectionner</option>
              <option>Ligne Production 1</option>
              <option>Ligne Conditionnement</option>
              <option>Ligne Utilités</option>
            </select>
          </div>

          <div class="form-group">
            <label>Fréquence *</label>
            <select
              v-model="form.frequency"
              required
            >
              <option value="">Sélectionner</option>
              <option>Quotidienne</option>
              <option>Hebdomadaire</option>
              <option>Mensuelle</option>
              <option>Trimestrielle</option>
              <option>Annuelle</option>
            </select>
          </div>

          <div class="form-group">
            <label>Responsable *</label>
            <select
              v-model="form.technician"
              required
            >
              <option value="">Sélectionner</option>
              <option>Nabil Amrani</option>
              <option>Ahmed El Mansouri</option>
              <option>Sara El Idrissi</option>
              <option>Youssef Berrada</option>
            </select>
          </div>

          <div class="form-group">
            <label>Prochaine échéance *</label>
            <input
              v-model="form.nextDueDate"
              type="date"
              required
            />
          </div>

          <div class="form-group">
            <label>Durée estimée</label>
            <input
              v-model="form.estimatedDuration"
              placeholder="Ex. 2 heures"
            />
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea
              v-model.trim="form.description"
              rows="4"
              placeholder="Décrire les contrôles et opérations à réaliser..."
            ></textarea>
          </div>
        </div>

        <footer>
          <button
            type="button"
            class="cancel-button"
            @click="$emit('close')"
          >
            Annuler
          </button>

          <button
            type="submit"
            class="save-button"
          >
            {{ maintenance ? 'Enregistrer les modifications' : 'Créer le plan' }}
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  maintenance: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const emptyForm = () => ({
  plan: '',
  machine: '',
  line: '',
  frequency: '',
  technician: '',
  nextDueDate: '',
  estimatedDuration: '',
  description: ''
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
    ...form
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
  width: min(720px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
}

header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid #edf0e8;
}

header span {
  color: #6a9a2a;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

header h2 {
  margin: 5px 0 0;
  color: #111827;
  font-size: 21px;
}

header button {
  width: 36px;
  height: 36px;
  background: #f7f9f3;
  border: 0;
  border-radius: 10px;
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
  color: #4a0a0a;
  font-size: 12px;
  font-weight: 800;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px;
  background: #fafbf7;
  border: 1px solid #dfe5d6;
  border-radius: 11px;
  outline: none;
  font: inherit;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #6a9a2a;
  box-shadow: 0 0 0 3px rgba(106, 154, 42, 0.12);
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #edf0e8;
}

footer button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 11px;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button {
  background: white;
  border: 1px solid #dfe5d6;
  color: #64748b;
}

.save-button {
  background: #6a9a2a;
  border: 1px solid #6a9a2a;
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
