import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server.js';

const router = express.Router();

// Récupérer les conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:users!sender_id (id, name, avatar),
        receiver:users!receiver_id (id, name, avatar)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Grouper par conversation
    const conversations = {};
    messages.forEach(msg => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversations[otherId]) {
        conversations[otherId] = {
          userId: otherId,
          user: msg.sender_id === userId ? msg.receiver : msg.sender,
          messages: [],
          lastMessage: msg,
          unreadCount: 0
        };
      }
      conversations[otherId].messages.push(msg);
      if (!msg.read && msg.receiver_id === userId) {
        conversations[otherId].unreadCount++;
      }
    });

    res.json({ conversations: Object.values(conversations) });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// Envoyer un message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const messageId = uuidv4();
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert([{
        id: messageId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        sender:users!sender_id (id, name, avatar),
        receiver:users!receiver_id (id, name, avatar)
      `)
      .single();

    if (error) throw error;

    // Émettre via WebSocket
    io.to(`user_${receiverId}`).emit('new_message', message);

    res.status(201).json({ message });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// Marquer comme lu
router.put('/:messageId/read', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('receiver_id', userId);

    if (error) throw error;

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

export default router;

