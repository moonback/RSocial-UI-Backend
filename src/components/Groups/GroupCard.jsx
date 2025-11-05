import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Groups.css';

const GroupCard = ({ group }) => {
  const { user } = useAuth();
  const { joinGroup, leaveGroup } = useApp();

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    group.location.lat,
    group.location.lng
  );

  const isMember = group.members.includes(user.id);

  const handleJoinLeave = () => {
    if (isMember) {
      if (window.confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) {
        leaveGroup(group.id, user.id);
      }
    } else {
      joinGroup(group.id, user.id);
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
            <span>{group.members.length} membres</span>
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
        >
          {isMember ? '✓ Membre' : 'Rejoindre'}
        </button>
      </div>
    </div>
  );
};

export default GroupCard;

