import api from './authService'

function resolveErrorMessage(error, fallbackMessage) {
  if (error.response?.status === 401) {
    return 'Session expirée. Veuillez vous reconnecter.'
  }

  return error.response?.data?.message || error.response?.data?.error || fallbackMessage
}

export async function getUsers() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.get('/users')
    const data = response.data

    if (Array.isArray(data)) return data
    if (Array.isArray(data?.users)) return data.users
    if (Array.isArray(data?.data)) return data.data

    return []
  } catch (error) {
    throw new Error(resolveErrorMessage(error, 'Impossible de charger les utilisateurs.'))
  }
}

export async function createUser(payload) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.post('/users', payload)
    return response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de créer l'utilisateur."))
  }
}

export async function updateUser(id, payload) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifié.')
  }

  try {
    const response = await api.patch(`/users/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "Impossible de modifier l'utilisateur."))
  }
}
