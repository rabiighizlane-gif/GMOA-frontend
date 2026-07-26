import api from './authService'

function resolveErrorMessage(error, fallbackMessage) {
  if (error.response?.status === 401) {
    return 'Session expirée. Veuillez vous reconnecter.'
  }

  return error.response?.data?.message || error.response?.data?.error || fallbackMessage
}

function unwrapList(data, key) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function getEquipments() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.get('/equipments')
    return unwrapList(response.data, 'equipments')
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les machines.'))
  }
}

export async function getEquipmentStats() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.get('/equipments/stats')
    return response.data?.stats || response.data?.data || response.data || {}
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les statistiques machines.'))
  }
}

export async function getEquipmentById(id) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.get(`/equipments/${id}`)
    return response.data?.equipment || response.data?.data || response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger la machine.'))
  }
}

export async function createEquipment(payload) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.post('/equipments', payload)
    return response.data?.equipment || response.data?.data || response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de créer la machine."))
  }
}

export async function updateEquipment(id, payload) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifiÃ©.')
  }

  try {
    const response = await api.patch(`/equipments/${id}`, payload)
    return response.data?.equipment || response.data?.data || response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de modifier la machine.'))
  }
}
