const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const endpoint = (path = '') => `${API_BASE_URL}/preventive-maintenance${path}`

function authHeaders() {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path, options = {}) {
  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Action maintenance preventive impossible.')
  }

  return data
}

export async function getPreventiveMaintenances() {
  const data = await request()
  return data.maintenances || data.plans || data
}

export async function createPreventiveMaintenance(maintenance) {
  const data = await request('', {
    method: 'POST',
    body: JSON.stringify(maintenance),
  })

  return data.maintenance || data.plan || data
}

export async function updatePreventiveMaintenance(id, maintenance) {
  const data = await request(`/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(maintenance),
  })

  return data.maintenance || data.plan || data
}

export async function completePreventiveMaintenance(id) {
  const data = await request(`/${encodeURIComponent(id)}/complete`, {
    method: 'PATCH',
  })

  return data.maintenance || data.plan || data
}

export async function deletePreventiveMaintenance(id) {
  return request(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
