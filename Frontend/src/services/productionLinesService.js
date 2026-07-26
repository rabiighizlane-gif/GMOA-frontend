import api from './authService'

function resolveErrorMessage(error, fallbackMessage) {
  if (error.response?.status === 401) {
    return 'Session expiree. Veuillez vous reconnecter.'
  }

  return error.response?.data?.message || error.response?.data?.error || fallbackMessage
}

function ensureAuthenticated() {
  if (!localStorage.getItem('token')) {
    throw new Error('Utilisateur non authentifie.')
  }
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.production_lines)) return data.production_lines
  if (Array.isArray(data?.productionLines)) return data.productionLines
  if (Array.isArray(data?.lines)) return data.lines
  if (Array.isArray(data?.data)) return data.data
  return []
}

function unwrapItem(data) {
  return data?.production_line || data?.productionLine || data?.line || data?.data || data
}

export async function getProductionLines() {
  ensureAuthenticated()

  try {
    const response = await api.get('/production-lines')
    return unwrapList(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les lignes de production.'))
  }
}

export async function getProductionLineById(id) {
  ensureAuthenticated()

  try {
    const response = await api.get(`/production-lines/${id}`)
    return unwrapItem(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger la ligne de production.'))
  }
}

export async function createProductionLine(data) {
  ensureAuthenticated()

  try {
    const response = await api.post('/production-lines', data)
    return unwrapItem(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de creer la ligne de production.'))
  }
}

export async function updateProductionLine(id, data) {
  ensureAuthenticated()

  try {
    const response = await api.put(`/production-lines/${id}`, data)
    return unwrapItem(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de modifier la ligne de production.'))
  }
}

export async function deleteProductionLine(id) {
  ensureAuthenticated()

  try {
    const response = await api.delete(`/production-lines/${id}`)
    return response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de supprimer la ligne de production.'))
  }
}

export async function createZone(lineId, data) {
  ensureAuthenticated()

  try {
    const response = await api.post(`/production-lines/${lineId}/zones`, data)
    return unwrapItem(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de creer la zone.'))
  }
}

export async function updateZone(zoneId, data) {
  ensureAuthenticated()

  try {
    const response = await api.patch(`/zones/${zoneId}`, data)
    return unwrapItem(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de modifier la zone.'))
  }
}

export async function deleteZone(zoneId) {
  ensureAuthenticated()

  try {
    const response = await api.delete(`/zones/${zoneId}`)
    return response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de supprimer la zone.'))
  }
}
