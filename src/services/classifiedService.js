import api from '../config/api';

export const classifiedService = {
  // Récupérer les petites annonces locales
  getClassifieds: async (lat, lng, radius, category = 'all') => {
    const { data } = await api.get('/classifieds', {
      params: { lat, lng, radius, category }
    });
    return data.classifieds;
  },

  // Créer une petite annonce
  createClassified: async (classifiedData) => {
    const { data } = await api.post('/classifieds', classifiedData);
    return data.classified;
  },

  // Récupérer les détails d'une annonce
  getClassifiedDetails: async (classifiedId) => {
    const { data } = await api.get(`/classifieds/${classifiedId}`);
    return data.classified;
  },

  // Supprimer une annonce (auteur uniquement)
  deleteClassified: async (classifiedId) => {
    await api.delete(`/classifieds/${classifiedId}`);
  },

  // Marquer comme vendu/donné
  markAsSold: async (classifiedId) => {
    const { data } = await api.put(`/classifieds/${classifiedId}/sold`);
    return data;
  }
};

export default classifiedService;

