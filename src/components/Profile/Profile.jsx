import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { posts } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    radius: user.radius,
  });

  const myPosts = posts.filter(p => p.userId === user.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const radiusOptions = [1, 2, 3, 4, 5];

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img src={user.avatar} alt={user.name} className="profile-avatar" />
          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="profile-name-input"
              />
            ) : (
              <h2 className="profile-name">{user.name}</h2>
            )}
            <p className="profile-email">{user.email}</p>
            <p className="profile-location">📍 {user.location.address}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Parlez-nous de vous..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Rayon de recherche (km)</label>
              <div className="radius-selector">
                {radiusOptions.map(radius => (
                  <button
                    key={radius}
                    type="button"
                    className={`radius-button ${formData.radius === radius ? 'radius-button-active' : ''}`}
                    onClick={() => setFormData({ ...formData, radius })}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name,
                    bio: user.bio,
                    radius: user.radius,
                  });
                }}
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-bio">
              <h3>À propos</h3>
              <p>{user.bio || 'Aucune bio pour le moment.'}</p>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">{myPosts.length}</div>
                <div className="stat-label">Publications</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user.neighbors?.length || 0}</div>
                <div className="stat-label">Voisins</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{user.radius} km</div>
                <div className="stat-label">Rayon</div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Modifier le profil
            </button>
          </>
        )}
      </div>

      <div className="profile-posts">
        <h3>Mes publications</h3>
        {myPosts.length === 0 ? (
          <div className="empty-state-small">
            <div className="empty-state-icon">📭</div>
            <p>Vous n'avez pas encore de publication</p>
          </div>
        ) : (
          <div className="posts-grid">
            {myPosts.map(post => (
              <div key={post.id} className="profile-post-card">
                {post.images && post.images.length > 0 && (
                  <div
                    className="post-thumbnail"
                    style={{ backgroundImage: `url(${post.images[0]})` }}
                  />
                )}
                <div className="post-card-content">
                  <span className="post-type-badge" style={{ backgroundColor: '#667eea' }}>
                    {post.type}
                  </span>
                  <p className="post-card-text">{post.content}</p>
                  <div className="post-card-footer">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments.length}</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

