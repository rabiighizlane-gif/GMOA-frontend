<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <form class="modal-card" @submit.prevent="submitForm">
        <header>
          <div>
            <span>Pièces de rechange</span>
            <h2>{{ part ? 'Modifier la pièce' : 'Ajouter une pièce' }}</h2>
          </div>

          <button type="button" @click="$emit('close')">×</button>
        </header>

        <div class="form-body">
          <div class="form-group">
            <label>Référence *</label>
            <input v-model.trim="form.reference" required />
          </div>

          <div class="form-group">
            <label>Nom de la pièce *</label>
            <input v-model.trim="form.name" required />
          </div>

          <div class="form-group">
            <label>Catégorie *</label>
            <select v-model="form.category" required>
              <option value="">Sélectionner</option>
              <option v-for="category in categories" :key="category">{{ category }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Fournisseur *</label>
            <input v-model.trim="form.supplier" required />
          </div>

          <div class="form-group">
            <label>Machine compatible *</label>
            <input v-model.trim="form.machine" required />
          </div>

          <div class="form-group">
            <label>Ligne de production</label>
            <input v-model.trim="form.line" />
          </div>

          <div class="form-group">
            <label>Quantité initiale *</label>
            <input v-model.number="form.currentStock" min="0" type="number" required />
          </div>

          <div class="form-group">
            <label>Seuil minimum *</label>
            <input v-model.number="form.minimumStock" min="0" type="number" required />
          </div>

          <div class="form-group">
            <label>Stock maximum *</label>
            <input v-model.number="form.maximumStock" min="1" type="number" required />
          </div>

          <div class="form-group">
            <label>Emplacement *</label>
            <input v-model.trim="form.location" required />
          </div>

          <div class="form-group">
            <label>Prix unitaire *</label>
            <input v-model.number="form.unitPrice" min="0" type="number" required />
          </div>

          <div class="form-group">
            <label>Unité</label>
            <input v-model.trim="form.unit" placeholder="Pièce, litre..." />
          </div>

          <div class="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" />
          </div>

          <div class="form-group">
            <label>Fiche technique</label>
            <input type="file" accept=".pdf" />
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea v-model.trim="form.description" rows="4"></textarea>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>

        <footer>
          <button type="button" class="cancel-button" @click="$emit('close')">Annuler</button>
          <button type="submit" class="save-button">Enregistrer</button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  part: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])
const errorMessage = ref('')

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
  unit: 'Pièce'
})

const form = reactive(emptyForm())

watch(
  () => props.part,
  (part) => {
    Object.assign(form, part || emptyForm())
    errorMessage.value = ''
  },
  { immediate: true }
)

const submitForm = () => {
  if (form.maximumStock < form.minimumStock) {
    errorMessage.value = 'Le stock maximum doit être supérieur au seuil minimum.'
    return
  }

  if (form.currentStock > form.maximumStock) {
    errorMessage.value = 'Le stock actuel ne peut pas dépasser le stock maximum.'
    return
  }

  emit('save', {
    ...props.part,
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
  width: min(840px, 100%);
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
  font-weight: 900;
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

.form-group.full,
.error-message {
  grid-column: 1 / -1;
}

label {
  color: #4a0a0a;
  font-size: 12px;
  font-weight: 900;
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

.error-message {
  margin: 0;
  color: #e31e24;
  font-weight: 800;
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
  font-weight: 900;
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

  .form-group.full,
  .error-message {
    grid-column: auto;
  }
}
</style>
