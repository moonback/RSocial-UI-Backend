import api from '../config/api';
import socketService from './socketService';

export const messageService = {
  // Récupérer les conversations
  getConversations: async () => {
    const { data } = await api.get('/messages/conversations');
    return data.conversations;
  },

  // Envoyer un message
  sendMessage: async (receiverId, content) => {
    const { data } = await api.post('/messages', {
      receiverId,
      content
    });
    return data.message;
  },

  // Marquer comme lu
  markAsRead: async (messageId) => {
    await api.put(`/messages/${messageId}/read`);
  },

  // Écouter les nouveaux messages
  onNewMessage: (callback) => {
    socketService.on('new_message', callback);
  },

  // Utilisateur en train d'écrire
  typing: (receiverId) => {
    socketService.emit('typing', { receiverId });
  },

  stopTyping: (receiverId) => {
    socketService.emit('stop_typing', { receiverId });
  }
};

export default messageService;

