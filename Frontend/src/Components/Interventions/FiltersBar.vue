<template>
  <section class="filters-bar">
    <label class="field search-field">
      <InterventionIcon name="search" />
      <input
        :value="modelValue.search"
        type="search"
        :placeholder="content.search"
        @input="update('search', $event.target.value)"
      />
    </label>

    <label class="field">
      <span>{{ content.date }}</span>
      <input :value="modelValue.date" type="date" @input="update('date', $event.target.value)" />
    </label>

    <label class="field">
      <span>{{ content.technician }}</span>
      <select :value="modelValue.technician" @change="update('technician', $event.target.value)">
        <option value="">{{ content.all }}</option>
        <option v-for="technician in technicians" :key="technician" :value="technician">{{ displayTechnician(technician) }}</option>
      </select>
    </label>

    <label class="field">
      <span>{{ content.status }}</span>
      <select :value="modelValue.status" @change="update('status', $event.target.value)">
        <option value="">{{ content.all }}</option>
        <option value="Terminee">{{ content.done }}</option>
        <option value="En cours">{{ content.inProgress }}</option>
        <option value="En attente">{{ content.pending }}</option>
      </select>
    </label>

    <button class="ghost-button" type="button">
      <InterventionIcon name="download" />
      {{ content.export }}
    </button>

    <button v-if="canCreate" class="primary-button" type="button">
      <InterventionIcon name="plus" />
      {{ content.create }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import InterventionIcon from './InterventionIcon.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  technicians: {
    type: Array,
    default: () => [],
  },
  canCreate: {
    type: Boolean,
    default: true,
  },
  content: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const languageStore = useLanguageStore()
const language = computed(() => languageStore.language)

const technicianNames = {
  AR: {
    'Nabil Amrani': '\u0646\u0628\u064a\u0644 \u0627\u0644\u0639\u0645\u0631\u0627\u0646\u064a',
    'Ahmed El Mansouri': '\u0623\u062d\u0645\u062f \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u064a',
    'Youssef Berrada': '\u064a\u0648\u0633\u0641 \u0628\u0631\u0627\u062f\u0629',
    'Sara El Idrissi': '\u0633\u0627\u0631\u0629 \u0627\u0644\u0625\u062f\u0631\u064a\u0633\u064a',
    'Karim El Fassi': '\u0643\u0631\u064a\u0645 \u0627\u0644\u0641\u0627\u0633\u064a',
  },
}

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function displayTechnician(name) {
  return technicianNames[language.value]?.[name] || name
}
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(116, 135, 158, 0.28);
  border-radius: 8px;
  background: rgba(17, 27, 38, 0.9);
  padding: 14px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 18px 40px rgba(0,0,0,.24);
}

.field {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(126, 146, 170, 0.26);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.72);
  color: #aeb9c8;
  padding: 0 13px;
  font-size: 12px;
  font-weight: 900;
}

.search-field {
  flex: 1 1 280px;
  background: rgba(13, 21, 32, 0.72);
}

.field input,
.field select {
  min-width: 120px;
  border: 0;
  background: transparent;
  color: #f4f7fb;
  outline: none;
  font-size: 13px;
  font-weight: 850;
}

.search-field input {
  width: 100%;
  min-width: 180px;
}

.ghost-button,
.primary-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.ghost-button {
  border: 1px solid rgba(210, 221, 234, 0.28);
  background: rgba(13, 21, 32, 0.82);
  color: #f2f6fb;
}

.primary-button {
  border: 1px solid rgba(131, 185, 92, 0.44);
  background: #5f8f2f;
  color: #f8fbff;
}

.ghost-button:hover,
.primary-button:hover {
  transform: translateY(-2px);
}

.ghost-button:hover {
  background: rgba(24, 38, 53, 0.92);
  border-color: rgba(91, 155, 215, 0.72);
}

@media (max-width: 760px) {
  .filters-bar > * {
    width: 100%;
  }

  .field input,
  .field select {
    width: 100%;
  }
}
</style>
