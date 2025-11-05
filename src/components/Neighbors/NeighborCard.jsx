import React from 'react';
import { formatDistance } from '../../utils/geolocation';
import './Neighbors.css';

const NeighborCard = ({ 
  neighbor, 
  isFollowing, 
  onFollow, 
  onUnfollow, 
  showDistance = false,
  isSuggestion = false 
}) => {
  const handleFollowClick = () => {
    if (isFollowing) {
      onUnfollow();
    } else {
      onFollow();
    }
  };

  return (
    <div className={`neighbor-card ${isSuggestion ? 'suggestion' : ''}`}>
      <div className="neighbor-card-header">
        <img 
          src={neighbor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(neighbor.name)}&background=667eea&color=fff`} 
          alt={neighbor.name}
          className="neighbor-avatar"
        />
        {isSuggestion && (
          <span className="suggestion-badge">✨ Suggestion</span>
        )}
      </div>
      
      <div className="neighbor-card-body">
        <h4 className="neighbor-name">{neighbor.name}</h4>
        {neighbor.bio && (
          <p className="neighbor-bio">{neighbor.bio}</p>
        )}
        
        {showDistance && neighbor.distance !== undefined && (
          <div className="neighbor-distance">
            📍 {formatDistance(neighbor.distance)}
          </div>
        )}

        <div className="neighbor-stats">
          {neighbor.postsCount !== undefined && (
            <div className="neighbor-stat">
              <span className="stat-icon">📝</span>
              <span>{neighbor.postsCount} posts</span>
            </div>
          )}
          {neighbor.followersCount !== undefined && (
            <div className="neighbor-stat">
              <span className="stat-icon">👥</span>
              <span>{neighbor.followersCount} abonnés</span>
            </div>
          )}
        </div>
      </div>

      <div className="neighbor-card-footer">
        <button
          className={`follow-button ${isFollowing ? 'following' : ''}`}
          onClick={handleFollowClick}
        >
          {isFollowing ? '✓ Suivi' : '+ Suivre'}
        </button>
        <button
          className="message-button"
          onClick={() => {
            // Navigation vers la messagerie avec cet utilisateur
            window.location.href = `/messages?user=${neighbor.id}`;
          }}
        >
          💬 Message
        </button>
      </div>
    </div>
  );
};

export default NeighborCard;

