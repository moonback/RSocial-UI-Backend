import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Messages.css';

const Messages = () => {
  const { user } = useAuth();
  const { messages, sendMessage, markMessageAsRead, blockUser, reportContent } = useApp();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Grouper les messages par conversation
  const conversations = useMemo(() => {
    const convMap = new Map();

    messages.forEach(msg => {
      const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const otherName = msg.senderId === user.id ? msg.receiverName : msg.senderName;

      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          userId: otherId,
          userName: otherName,
          messages: [],
        });
      }

      convMap.get(otherId).messages.push(msg);
    });

    // Trier les messages de chaque conversation
    convMap.forEach(conv => {
      conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      conv.lastMessage = conv.messages[conv.messages.length - 1];
      conv.unreadCount = conv.messages.filter(m => !m.read && m.senderId !== user.id).length;
    });

    // Convertir en tableau et trier par dernier message
    return Array.from(convMap.values()).sort((a, b) =>
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );
  }, [messages, user.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation) return;

    sendMessage({
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedConversation.userId,
      receiverName: selectedConversation.userName,
      content: messageText,
    });

    setMessageText('');
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Marquer les messages comme lus
    conversation.messages.forEach(msg => {
      if (!msg.read && msg.senderId !== user.id) {
        markMessageAsRead(msg.id);
      }
    });
  };

  const handleBlock = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir bloquer ${selectedConversation.userName} ?`)) {
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
          {conversations.length === 0 ? (
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
                  src={`https://ui-avatars.com/api/?name=${conv.userName}&background=random`}
                  alt={conv.userName}
                  className="conversation-avatar"
                />
                <div className="conversation-info">
                  <div className="conversation-name">{conv.userName}</div>
                  <div className="conversation-preview">
                    {conv.lastMessage.content.substring(0, 50)}
                    {conv.lastMessage.content.length > 50 ? '...' : ''}
                  </div>
                </div>
                <div className="conversation-meta">
                  <div className="conversation-time">
                    {formatRelativeTime(conv.lastMessage.createdAt)}
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
                    src={`https://ui-avatars.com/api/?name=${selectedConversation.userName}&background=random`}
                    alt={selectedConversation.userName}
                    className="conversation-avatar"
                  />
                  <span>{selectedConversation.userName}</span>
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
                    className={`message-bubble ${msg.senderId === user.id ? 'message-sent' : 'message-received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {formatRelativeTime(msg.createdAt)}
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
                />
                <button type="submit" className="message-send-btn">
                  ➤
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

