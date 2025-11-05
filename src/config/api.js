import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use((config) => {
  console.log('[API] Requête envoyée:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data ? {
      ...config.data,
      password: config.data.password ? `[${config.data.password.length} caractères]` : undefined
    } : undefined
  });
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Token ajouté à la requête');
  } else {
    console.log('[API] Aucun token trouvé dans localStorage');
  }
  return config;
}, (error) => {
  console.error('[API] Erreur dans l\'intercepteur de requête:', error);
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('[API] Réponse reçue:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API] Erreur dans la réponse:');
    console.error('[API] Status:', error.response?.status);
    console.error('[API] Status Text:', error.response?.statusText);
    console.error('[API] URL:', error.config?.url);
    console.error('[API] Données d\'erreur:', error.response?.data);
    console.error('[API] Message d\'erreur:', error.message);
    
    if (error.response?.status === 401) {
      console.log('[API] Erreur 401 - Déconnexion automatique');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

