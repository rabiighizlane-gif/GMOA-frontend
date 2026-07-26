import api from './authService'

export async function getPreventiveChart() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifie.')
  }

  try {
    const response = await api.get('/dashboard/preventive-chart')

    return response.data?.preventive_chart
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Impossible de charger le graphe preventif.')
  }
}

export async function getPreventiveDistribution() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Utilisateur non authentifie.')
  }

  try {
    const response = await api.get('/dashboard/preventive-distribution')

    return response.data?.preventive_distribution
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Impossible de charger les donnees de maintenance preventive.')
  }
}
