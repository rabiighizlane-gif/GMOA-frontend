import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedApiUrl = rawApiUrl.replace(/\/$/, '');
const apiBaseUrl = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

let pendingProfileRequest = null;

// Interceptor: Kay-zid le Token JWT f les headers automatique
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
    }

    return Promise.reject(error);
  },
);

export async function getProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Utilisateur non authentifie.');
  }

  if (!pendingProfileRequest) {
    pendingProfileRequest = api
      .get('/auth/profile')
      .then((response) => {
        const user = response.data?.user;

        if (!user) {
          throw new Error('Profil utilisateur introuvable.');
        }

        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));

        return user;
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          throw new Error('Session expiree. Veuillez vous reconnecter.');
        }

        throw new Error(error.response?.data?.message || 'Impossible de charger le profil utilisateur.');
      })
      .finally(() => {
        pendingProfileRequest = null;
      });
  }

  return pendingProfileRequest;
}

export default api;
