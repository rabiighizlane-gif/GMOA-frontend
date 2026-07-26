import api from './authService'

function resolveErrorMessage(error, fallbackMessage) {
  if (error.response?.status === 401) {
    return 'Session expirée. Veuillez vous reconnecter.'
  }

  return error.response?.data?.message || error.response?.data?.error || fallbackMessage
}

function unwrapSettings(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.settings)) return data.settings
  if (Array.isArray(data?.data)) return data.data
  return []
}

function normalizeSetting(setting) {
  const fieldKey = normalizeFieldKey(setting.field_key || setting.fieldKey || setting.key)

  return {
    ...setting,
    field_key: fieldKey,
    label: setting.label || fieldKey,
    is_enabled: Boolean(setting.is_enabled ?? setting.isEnabled),
    is_required: Boolean(setting.is_required ?? setting.isRequired),
    display_order: setting.display_order ?? setting.displayOrder,
  }
}

function normalizeFieldKey(fieldKey) {
  const aliases = {
    imageUrl: 'image_url',
    imageURL: 'image_url',
    lastMaintenance: 'last_maintenance',
    nextMaintenance: 'next_maintenance',
  }

  return aliases[fieldKey] || fieldKey
}

export async function getEquipmentFieldSettings() {
  try {
    const response = await api.get('/equipment-field-settings')
    return unwrapSettings(response.data).map(normalizeSetting).filter((setting) => setting.field_key)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les propriétés des machines.'))
  }
}

export async function updateEquipmentFieldSetting(fieldKey, payload) {
  try {
    const response = await api.patch(`/equipment-field-settings/${fieldKey}`, payload)
    return normalizeSetting(response.data?.setting || response.data?.data || response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de mettre à jour la propriété machine.'))
  }
}
