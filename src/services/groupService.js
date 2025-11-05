import api from '../config/api';

export const groupService = {
  // Récupérer les groupes locaux
  getGroups: async (lat, lng, radius, type = 'all') => {
    const { data } = await api.get('/groups', {
      params: { lat, lng, radius, type }
    });
    return data.groups;
  },

  // Créer un groupe
  createGroup: async (groupData) => {
    const { data } = await api.post('/groups', groupData);
    return data.group;
  },

  // Rejoindre un groupe
  joinGroup: async (groupId) => {
    const { data } = await api.post(`/groups/${groupId}/join`);
    return data;
  },

  // Quitter un groupe
  leaveGroup: async (groupId) => {
    const { data } = await api.post(`/groups/${groupId}/leave`);
    return data;
  },

  // Récupérer les détails d'un groupe
  getGroupDetails: async (groupId) => {
    const { data } = await api.get(`/groups/${groupId}`);
    return data.group;
  },

  // Supprimer un groupe (créateur uniquement)
  deleteGroup: async (groupId) => {
    await api.delete(`/groups/${groupId}`);
  }
};

export default groupService;

