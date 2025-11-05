import api from '../config/api';

export const neighborService = {
  // Récupérer les voisins proches
  getNeighbors: async (lat, lng, radius = 5) => {
    const { data } = await api.get('/users/neighbors', {
      params: { lat, lng, radius }
    });
    return data.neighbors || [];
  },

  // Récupérer les suggestions de voisins à suivre
  getSuggestedNeighbors: async (lat, lng, radius = 5) => {
    const { data } = await api.get('/users/suggested', {
      params: { lat, lng, radius }
    });
    return data.suggestions || [];
  },

  // Suivre un voisin
  followNeighbor: async (userId) => {
    const { data } = await api.post(`/users/${userId}/follow`);
    return data;
  },

  // Ne plus suivre un voisin
  unfollowNeighbor: async (userId) => {
    await api.delete(`/users/${userId}/follow`);
  },

  // Récupérer les statistiques du voisinage
  getNeighborhoodStats: async (lat, lng, radius = 5) => {
    const { data } = await api.get('/users/neighborhood-stats', {
      params: { lat, lng, radius }
    });
    return data.stats || {};
  }
};

export default neighborService;

