import api from '../config/api';

export const eventService = {
  // Récupérer les événements locaux
  getEvents: async (lat, lng, radius, filter = 'all') => {
    const { data } = await api.get('/events', {
      params: { lat, lng, radius, filter }
    });
    return data.events;
  },

  // Créer un événement
  createEvent: async (eventData) => {
    const { data } = await api.post('/events', eventData);
    return data.event;
  },

  // RSVP à un événement
  rsvpEvent: async (eventId) => {
    const { data } = await api.post(`/events/${eventId}/rsvp`);
    return data;
  },

  // Annuler RSVP
  cancelRsvp: async (eventId) => {
    const { data } = await api.delete(`/events/${eventId}/rsvp`);
    return data;
  },

  // Récupérer les détails d'un événement
  getEventDetails: async (eventId) => {
    const { data } = await api.get(`/events/${eventId}`);
    return data.event;
  },

  // Supprimer un événement (créateur uniquement)
  deleteEvent: async (eventId) => {
    await api.delete(`/events/${eventId}`);
  }
};

export default eventService;

