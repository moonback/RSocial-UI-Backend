import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import classifiedService from '../../services/classifiedService';
import { formatRelativeTime } from '../../utils/dateUtils';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Classifieds.css';

const ClassifiedCard = ({ classified, onClassifiedUpdated }) => {
  const { user } = useAuth();
  const { sendMessage } = useApp();
  const [loading, setLoading] = useState(false);

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    classified.location.lat,
    classified.location.lng
  );

  const isMyClassified = classified.user_id === user.id || classified.userId === user.id;

  const handleContact = () => {
    const userName = classified.user?.name || classified.userName;
    const userId = classified.user_id || classified.userId;
    
    const message = prompt(`Envoyer un message à ${userName} :`);
    if (message) {
      sendMessage({
        senderId: user.id,
        senderName: user.name,
        receiverId: userId,
        receiverName: userName,
        content: message,
        relatedType: 'classified',
        relatedId: classified.id,
      });
      alert('Message envoyé !');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      setLoading(true);
      await classifiedService.deleteClassified(classified.id);
      
      if (onClassifiedUpdated) {
        onClassifiedUpdated();
      }
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Vente: '#3b82f6',
      Don: '#10b981',
      Service: '#f59e0b',
      Recherche: '#8b5cf6',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="classified-card">
      {classified.images && classified.images.length > 0 && (
        <div
          className="classified-image"
          style={{ backgroundImage: `url(${classified.images[0]})` }}
        >
          <div
            className="classified-category-badge"
            style={{ backgroundColor: getCategoryColor(classified.category) }}
          >
            {classified.category}
          </div>
        </div>
      )}

      {(!classified.images || classified.images.length === 0) && (
        <div className="classified-image classified-no-image">
          <div className="no-image-icon">🏷️</div>
          <div
            className="classified-category-badge"
            style={{ backgroundColor: getCategoryColor(classified.category) }}
          >
            {classified.category}
          </div>
        </div>
      )}

      <div className="classified-content">
        <div className="classified-price">
          {classified.price === 0 ? 'Gratuit' : `${classified.price}€`}
        </div>

        <h3 className="classified-title">{classified.title}</h3>
        <p className="classified-description">{classified.description}</p>

        <div className="classified-meta">
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{formatDistance(distance)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⏰</span>
            <span>{formatRelativeTime(classified.created_at || classified.createdAt)}</span>
          </div>
        </div>

        <div className="classified-seller">
          <img 
            src={classified.user?.avatar || classified.userAvatar || `https://ui-avatars.com/api/?name=${classified.user?.name || classified.userName}&background=random`} 
            alt={classified.user?.name || classified.userName} 
            className="seller-avatar" 
          />
          <span className="seller-name">{classified.user?.name || classified.userName}</span>
        </div>

        {isMyClassified ? (
          <button className="classified-action-btn btn-delete" onClick={handleDelete} disabled={loading}>
            {loading ? '⏳' : '🗑️ Supprimer'}
          </button>
        ) : (
          <button className="classified-action-btn btn-primary" onClick={handleContact}>
            💬 Contacter
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassifiedCard;

