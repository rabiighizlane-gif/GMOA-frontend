import api from './authService'

function resolveErrorMessage(error, fallbackMessage) {
  if (!error.response) {
    return 'Erreur reseau. Verifiez que le backend est demarre.'
  }

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
  if (Array.isArray(data?.breakdowns)) return data.breakdowns
  if (Array.isArray(data?.data?.breakdowns)) return data.data.breakdowns
  if (Array.isArray(data?.data)) return data.data
  return []
}

function unwrapItem(data) {
  return data?.data?.breakdown || data?.breakdown || data?.data || data
}

function unwrapStats(data) {
  return data?.data?.stats || data?.stats || data?.data || data || {}
}

export async function getBreakdowns() {
  ensureAuthenticated()

  try {
    const response = await api.get('/breakdowns')
    return unwrapList(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les pannes.'))
  }
}

export async function getBreakdownStats() {
  ensureAuthenticated()

  try {
    const response = await api.get('/breakdowns/stats')
    return unwrapStats(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les indicateurs pannes.'))
  }
}

export async function createBreakdown(data) {
  ensureAuthenticated()

  try {
    const response = await api.post('/breakdowns', data)
    return unwrapItem(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de creer la panne.'))
  }
}

export async function updateBreakdown(id, data) {
  ensureAuthenticated()

  try {
    const response = await api.patch(`/breakdowns/${id}`, data)
    return unwrapItem(response.data)
  } catch (error) {
    if ([404, 405].includes(error.response?.status)) {
      try {
        const response = await api.put(`/breakdowns/${id}`, data)
        return unwrapItem(response.data)
      } catch (putError) {
        throw new Error(resolveErrorMessage(putError, 'Impossible de modifier la panne.'))
      }
    }

    throw new Error(resolveErrorMessage(error, 'Impossible de modifier la panne.'))
  }
}

export async function deleteBreakdown(id) {
  ensureAuthenticated()

  try {
    const response = await api.delete(`/breakdowns/${id}`)
    return response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de supprimer la panne.'))
  }
}
