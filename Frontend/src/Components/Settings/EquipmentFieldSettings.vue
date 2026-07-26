<template>
  <section class="settings-panel">
    <div class="panel-heading">
      <h2>{{ content.title }}</h2>
      <p>{{ content.subtitle }}</p>
    </div>

    <div v-if="loading" class="settings-state">{{ content.loading }}</div>
    <div v-else-if="errorMessage" class="settings-state error">
      <strong>{{ content.error }}</strong>
      <span>{{ errorMessage }}</span>
    </div>
    <div v-else-if="orderedSettings.length === 0" class="settings-state">{{ content.empty }}</div>

    <div v-else class="field-settings-list">
      <article v-for="setting in orderedSettings" :key="setting.field_key" class="field-row">
        <div class="field-main">
          <strong>{{ setting.label || setting.field_key }}</strong>
          <span>{{ content.order }} {{ setting.display_order ?? content.unavailable }}</span>
        </div>

        <div class="field-actions">
          <label class="switch-control">
            <input
              :checked="setting.is_enabled"
              :disabled="isUpdating(setting.field_key)"
              type="checkbox"
              @change="toggleEnabled(setting, $event.target.checked)"
            />
            <span></span>
            <b>{{ setting.is_enabled ? content.enabled : content.disabled }}</b>
          </label>

          <label v-if="setting.is_enabled" class="switch-control">
            <input
              :checked="setting.is_required"
              :disabled="isUpdating(setting.field_key)"
              type="checkbox"
              @change="toggleRequired(setting, $event.target.checked)"
            />
            <span></span>
            <b>{{ setting.is_required ? content.required : content.optional }}</b>
          </label>

          <small v-if="isUpdating(setting.field_key)">{{ content.saving }}</small>
        </div>
      </article>
    </div>

    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getEquipmentFieldSettings, updateEquipmentFieldSetting } from '@/services/equipmentFieldSettingsService'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const settings = ref([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const updatingKeys = ref([])

const content = computed(() => ({
  FR: {
    title: 'Propriétés des machines',
    subtitle: 'Choisissez les informations utilisées dans la gestion du parc machines.',
    loading: 'Chargement des propriétés...',
    error: 'Impossible de charger les propriétés des machines.',
    empty: 'Aucune propriété configurable disponible.',
    enabled: 'Activé',
    disabled: 'Désactivé',
    required: 'Obligatoire',
    optional: 'Optionnel',
    saving: 'Enregistrement...',
    saved: 'Propriété mise à jour.',
    order: 'Ordre',
    unavailable: '—',
  },
  EN: {
    title: 'Machine properties',
    subtitle: 'Choose the information used to manage the machine fleet.',
    loading: 'Loading properties...',
    error: 'Unable to load machine properties.',
    empty: 'No configurable property available.',
    enabled: 'Enabled',
    disabled: 'Disabled',
    required: 'Required',
    optional: 'Optional',
    saving: 'Saving...',
    saved: 'Property updated.',
    order: 'Order',
    unavailable: '—',
  },
  AR: {
    title: 'خصائص الآلات',
    subtitle: 'اختر المعلومات المستخدمة في إدارة أسطول الآلات.',
    loading: 'جاري تحميل الخصائص...',
    error: 'تعذر تحميل خصائص الآلات.',
    empty: 'لا توجد خصائص قابلة للإعداد.',
    enabled: 'مفعلة',
    disabled: 'معطلة',
    required: 'إلزامية',
    optional: 'اختيارية',
    saving: 'جاري الحفظ...',
    saved: 'تم تحديث الخاصية.',
    order: 'الترتيب',
    unavailable: '—',
  },
})[languageStore.language] || {})

const orderedSettings = computed(() => [...settings.value].sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)))

onMounted(loadSettings)

async function loadSettings() {
  try {
    loading.value = true
    errorMessage.value = ''
    settings.value = await getEquipmentFieldSettings()
  } catch (error) {
    errorMessage.value = error.message || content.value.error
    settings.value = []
  } finally {
    loading.value = false
  }
}

async function toggleEnabled(setting, isEnabled) {
  const payload = { is_enabled: isEnabled, is_required: isEnabled ? Boolean(setting.is_required) : false }
  await updateSetting(setting.field_key, payload)
}

async function toggleRequired(setting, isRequired) {
  if (!setting.is_enabled) return
  await updateSetting(setting.field_key, { is_required: isRequired })
}

async function updateSetting(fieldKey, payload) {
  try {
    startUpdating(fieldKey)
    errorMessage.value = ''
    successMessage.value = ''
    const updated = await updateEquipmentFieldSetting(fieldKey, payload)
    settings.value = settings.value.map((setting) => (setting.field_key === fieldKey ? normalizeUpdatedSetting(setting, updated, payload) : setting))
    successMessage.value = content.value.saved
  } catch (error) {
    errorMessage.value = error.message || content.value.error
  } finally {
    stopUpdating(fieldKey)
  }
}

function normalizeUpdatedSetting(currentSetting, updatedSetting, payload) {
  const nextSetting = updatedSetting && updatedSetting.field_key ? updatedSetting : { ...currentSetting, ...payload }
  return nextSetting.is_enabled ? nextSetting : { ...nextSetting, is_required: false }
}

function isUpdating(fieldKey) {
  return updatingKeys.value.includes(fieldKey)
}

function startUpdating(fieldKey) {
  updatingKeys.value = [...new Set([...updatingKeys.value, fieldKey])]
}

function stopUpdating(fieldKey) {
  updatingKeys.value = updatingKeys.value.filter((key) => key !== fieldKey)
}
</script>

<style scoped>
@import './settings.css';

.settings-state {
  display: grid;
  gap: 5px;
  padding: 16px;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.82);
  color: #aeb9c8;
  font-size: 13px;
  font-weight: 850;
}

.settings-state.error {
  border-color: rgba(220, 55, 71, 0.32);
  color: #ffb4be;
}

.settings-state strong {
  color: #f8fbff;
}

.field-settings-list {
  display: grid;
  gap: 10px;
}

.field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 15px 16px;
  border: 1px solid rgba(126, 146, 170, 0.24);
  border-radius: 8px;
  background: rgba(13, 21, 32, 0.82);
}

.field-main strong {
  display: block;
  color: #f8fbff;
  font-size: 14px;
  font-weight: 950;
}

.field-main span,
.field-actions small,
.success-message {
  color: #8d9aab;
  font-size: 11px;
  font-weight: 850;
}

.field-main span {
  display: block;
  margin-top: 5px;
}

.field-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
}

.switch-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #d7e0ec;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.switch-control input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.switch-control span {
  position: relative;
  width: 42px;
  height: 24px;
  flex: 0 0 42px;
  border: 1px solid rgba(126, 146, 170, 0.28);
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  transition: 0.2s ease;
}

.switch-control span::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #cbd5e1;
  content: '';
  transition: 0.2s ease;
}

.switch-control input:checked + span {
  border-color: rgba(131, 185, 92, 0.5);
  background: rgba(131, 185, 92, 0.28);
}

.switch-control input:checked + span::after {
  left: 21px;
  background: #bce39d;
}

.switch-control input:disabled + span {
  opacity: 0.56;
}

.success-message {
  margin: 14px 0 0;
  color: #bce39d;
}

@media (max-width: 780px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .field-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
