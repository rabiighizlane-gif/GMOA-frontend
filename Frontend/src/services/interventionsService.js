import api from './authService'

function ensureAuthenticated() {
  if (!localStorage.getItem('token')) {
    throw new Error('Utilisateur non authentifie.')
  }
}

function resolveErrorMessage(error, fallbackMessage) {
  if (error.response?.status === 401) {
    return 'Session expiree. Veuillez vous reconnecter.'
  }

  if (error.response?.status === 403) {
    return 'Action non autorisee pour votre role.'
  }

  return error.response?.data?.message || error.response?.data?.error || fallbackMessage
}

function unwrapInterventions(data) {
  if (Array.isArray(data)) return { interventions: data, pagination: null }
  if (Array.isArray(data?.interventions)) {
    return { interventions: data.interventions, pagination: data.pagination || null }
  }
  if (Array.isArray(data?.data?.interventions)) {
    return { interventions: data.data.interventions, pagination: data.data.pagination || null }
  }
  if (Array.isArray(data?.data)) return { interventions: data.data, pagination: data.pagination || null }
  return { interventions: [], pagination: data?.data?.pagination || data?.pagination || null }
}

function unwrapIntervention(data) {
  return data?.data?.intervention || data?.intervention || data?.data || data
}

export async function getInterventions(params = {}) {
  ensureAuthenticated()

  try {
    const response = await api.get('/interventions', { params })
    return unwrapInterventions(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les interventions.'))
  }
}

export async function getInterventionStats() {
  ensureAuthenticated()

  try {
    const response = await api.get('/interventions/stats')
    return response.data?.data?.stats || response.data?.stats || response.data?.data || response.data || {}
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les statistiques interventions.'))
  }
}

export async function getInterventionById(id) {
  ensureAuthenticated()

  try {
    const response = await api.get(`/interventions/${id}`)
    return unwrapIntervention(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de charger l'intervention."))
  }
}

export async function createIntervention(payload) {
  ensureAuthenticated()

  try {
    const response = await api.post('/interventions', payload)
    return unwrapIntervention(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de creer l'intervention."))
  }
}

export async function updateIntervention(id, payload) {
  ensureAuthenticated()

  try {
    const response = await api.put(`/interventions/${id}`, payload)
    return unwrapIntervention(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de modifier l'intervention."))
  }
}

export async function updateInterventionStatus(id, payload) {
  ensureAuthenticated()

  try {
    const response = await api.patch(`/interventions/${id}/status`, payload)
    return unwrapIntervention(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de modifier le statut de l'intervention."))
  }
}

export async function assignTechnician(id, technicianId) {
  ensureAuthenticated()

  try {
    const response = await api.patch(`/interventions/${id}/assign`, {
      technician_id: technicianId || null,
    })
    return unwrapIntervention(response.data)
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible d'affecter le technicien."))
  }
}

export async function deleteIntervention(id) {
  ensureAuthenticated()

  try {
    const response = await api.delete(`/interventions/${id}`)
    return response.data || null
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de supprimer l'intervention."))
  }
}
