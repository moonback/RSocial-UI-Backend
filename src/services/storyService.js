import api from '../config/api';

export const storyService = {
  // Récupérer les stories locales
  getStories: async (lat, lng, radius) => {
    const { data } = await api.get('/stories', {
      params: { lat, lng, radius }
    });
    return data.stories;
  },

  // Créer une story
  createStory: async (storyData) => {
    const { data } = await api.post('/stories', storyData);
    return data.story;
  },

  // Marquer une story comme vue
  viewStory: async (storyId) => {
    await api.post(`/stories/${storyId}/view`);
  },

  // Supprimer une story
  deleteStory: async (storyId) => {
    await api.delete(`/stories/${storyId}`);
  }
};

export default storyService;

