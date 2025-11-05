import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import messageService from '../../services/messageService';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const { blockUser, reportContent } = useApp();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Charger les conversations depuis l'API
  useEffect(() => {
    loadConversations();
    
    // Écouter les nouveaux messages via WebSocket
    messageService.onNewMessage((newMessage) => {
      // Recharger les conversations quand un nouveau message arrive
      loadConversations();
    });
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const fetchedConversations = await messageService.getConversations();
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await messageService.sendMessage(selectedConversation.userId, messageText);
      
      // Recharger les conversations pour avoir le nouveau message
      await loadConversations();
      
      // Mettre à jour la conversation sélectionnée
      const updatedConversation = conversations.find(c => c.userId === selectedConversation.userId);
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }

      setMessageText('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Marquer les messages comme lus
    const unreadMessages = conversation.messages.filter(
      m => !m.read && m.receiver_id === user.id
    );
    
    for (const msg of unreadMessages) {
      try {
        await messageService.markAsRead(msg.id);
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }
    
    // Recharger pour mettre à jour les compteurs
    loadConversations();
  };

  const handleBlock = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir bloquer ${selectedConversation.user.name} ?`)) {
      blockUser(selectedConversation.userId);
      setSelectedConversation(null);
      alert('Utilisateur bloqué');
    }
  };

  const handleReport = () => {
    const reason = prompt('Raison du signalement :');
    if (reason) {
      reportContent({
        type: 'user',
        contentId: selectedConversation.userId,
        reason,
        reportedBy: user.id,
      });
      alert('Signalement envoyé. Merci de votre contribution.');
    }
  };

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>Messages</h2>
        <p>Conversations privées avec vos voisins</p>
      </div>

      <div className="messages-layout">
        {/* Liste des conversations */}
        <div className="conversations-list">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Chargement...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="empty-state-small">
              <div className="empty-state-icon">💬</div>
              <p>Aucun message</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.userId}
                className={`conversation-item ${selectedConversation?.userId === conv.userId ? 'conversation-active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <img
                  src={conv.user?.avatar || `https://ui-avatars.com/api/?name=${conv.user?.name || conv.userName}&background=random`}
                  alt={conv.user?.name || conv.userName}
                  className="conversation-avatar"
                />
                <div className="conversation-info">
                  <div className="conversation-name">{conv.user?.name || conv.userName}</div>
                  <div className="conversation-preview">
                    {conv.lastMessage?.content.substring(0, 50)}
                    {conv.lastMessage?.content.length > 50 ? '...' : ''}
                  </div>
                </div>
                <div className="conversation-meta">
                  <div className="conversation-time">
                    {formatRelativeTime(conv.lastMessage?.created_at || conv.lastMessage?.createdAt)}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="conversation-badge">{conv.unreadCount}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Zone de conversation */}
        <div className="conversation-area">
          {selectedConversation ? (
            <>
              <div className="conversation-header">
                <div className="conversation-header-user">
                  <img
                    src={selectedConversation.user?.avatar || `https://ui-avatars.com/api/?name=${selectedConversation.user?.name || selectedConversation.userName}&background=random`}
                    alt={selectedConversation.user?.name || selectedConversation.userName}
                    className="conversation-avatar"
                  />
                  <span>{selectedConversation.user?.name || selectedConversation.userName}</span>
                </div>
                <div className="conversation-actions">
                  <button className="action-btn" onClick={handleReport} title="Signaler">
                    ⚠️
                  </button>
                  <button className="action-btn" onClick={handleBlock} title="Bloquer">
                    🚫
                  </button>
                </div>
              </div>

              <div className="messages-thread">
                {selectedConversation.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${(msg.sender_id || msg.senderId) === user.id ? 'message-sent' : 'message-received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {formatRelativeTime(msg.created_at || msg.createdAt)}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="message-input"
                  disabled={sending}
                />
                <button type="submit" className="message-send-btn" disabled={sending}>
                  {sending ? '⏳' : '➤'}
                </button>
              </form>
            </>
          ) : (
            <div className="conversation-empty">
              <div className="empty-state-icon">💬</div>
              <p>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

