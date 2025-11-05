import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import groupService from '../../services/groupService';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Groups.css';

const GroupCard = ({ group, onGroupUpdated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(group.isMember);

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    group.location.lat,
    group.location.lng
  );

  const handleJoinLeave = async () => {
    if (isMember) {
      if (!window.confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) {
        return;
      }
    }

    try {
      setLoading(true);
      if (isMember) {
        await groupService.leaveGroup(group.id);
        setIsMember(false);
      } else {
        await groupService.joinGroup(group.id);
        setIsMember(true);
      }
      
      if (onGroupUpdated) {
        onGroupUpdated();
      }
    } catch (error) {
      console.error('Erreur join/leave:', error);
      alert('Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      Rue: '🏘️',
      Immeuble: '🏢',
      Hobby: '🎨',
      Autre: '👥',
    };
    return icons[type] || '👥';
  };

  return (
    <div className="group-card">
      <div className="group-header">
        <img src={group.avatar} alt={group.name} className="group-avatar" />
        <div className="group-badge">{getTypeIcon(group.type)}</div>
      </div>

      <div className="group-body">
        <h3 className="group-title">{group.name}</h3>
        <p className="group-description">{group.description}</p>

        <div className="group-info">
          <div className="group-info-item">
            <span className="info-icon">👥</span>
            <span>{group.members} membres</span>
          </div>
          <div className="group-info-item">
            <span className="info-icon">📍</span>
            <span>{formatDistance(distance)}</span>
          </div>
          <div className="group-info-item">
            <span className="info-icon">🏷️</span>
            <span>{group.type}</span>
          </div>
        </div>
      </div>

      <div className="group-footer">
        <button
          className={`group-action-btn ${isMember ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleJoinLeave}
          disabled={loading}
        >
          {loading ? '⏳' : isMember ? '✓ Membre' : 'Rejoindre'}
        </button>
      </div>
    </div>
  );
};

export default GroupCard;

