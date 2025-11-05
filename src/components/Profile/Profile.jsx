import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import { getUserLocation, geocodeAddress, reverseGeocode } from '../../utils/geolocation';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { posts } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    radius: user?.radius || 3,
    address: user?.location?.address || '',
  });
  const [location, setLocation] = useState(user?.location || null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [errors, setErrors] = useState({});

  // Mettre à jour les données quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
        radius: user.radius,
        address: user.location?.address || '',
      });
      setLocation(user.location || null);
    }
  }, [user]);

  const myPosts = posts.filter(p => p.userId === user.id || p.user_id === user.id);

  // Obtenir la position GPS actuelle et récupérer l'adresse
  const handleGetLocation = async () => {
    setGettingLocation(true);
    setErrors({});
    try {
      // Obtenir les coordonnées GPS
      const gpsLocation = await getUserLocation();
      
      // Faire un reverse geocoding pour obtenir l'adresse
      try {
        const locationWithAddress = await reverseGeocode(gpsLocation.lat, gpsLocation.lng);
        setLocation(locationWithAddress);
        setFormData({
          ...formData,
          address: locationWithAddress.address
        });
      } catch (reverseError) {
        // Si le reverse geocoding échoue, utiliser les coordonnées avec une adresse par défaut
        const locationData = {
          ...gpsLocation,
          address: formData.address || `Position: ${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}`
        };
        setLocation(locationData);
        console.warn('Reverse geocoding échoué, utilisation des coordonnées:', reverseError);
      }
    } catch (error) {
      setErrors({
        location: 'Impossible d\'obtenir votre localisation GPS'
      });
    }
    setGettingLocation(false);
  };

  // Géocoder l'adresse saisie
  const handleGeocodeAddress = async () => {
    if (!formData.address || formData.address.trim().length === 0) {
      setErrors({ address: 'Veuillez saisir une adresse' });
      return;
    }

    setGeocodingAddress(true);
    setErrors({});
    try {
      const geocodedLocation = await geocodeAddress(formData.address);
      setLocation(geocodedLocation);
      setFormData({
        ...formData,
        address: geocodedLocation.address
      });
    } catch (error) {
      setErrors({
        location: error.message || 'Impossible de géocoder l\'adresse'
      });
    }
    setGeocodingAddress(false);
  };

  // Géocoder automatiquement quand l'utilisateur quitte le champ adresse
  const handleAddressBlur = async () => {
    if (formData.address && formData.address.trim().length > 0 && !location) {
      await handleGeocodeAddress();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si pas de localisation, essayer de géocoder l'adresse
    if (!location && formData.address) {
      setGeocodingAddress(true);
      try {
        const geocodedLocation = await geocodeAddress(formData.address);
        setLocation(geocodedLocation);
        setFormData({
          ...formData,
          address: geocodedLocation.address
        });
      } catch (error) {
        setErrors({
          location: error.message || 'Impossible de géocoder l\'adresse'
        });
        setGeocodingAddress(false);
        return;
      }
      setGeocodingAddress(false);
    }
    
    if (!location) {
      setErrors({
        location: 'Veuillez géolocaliser votre adresse'
      });
      return;
    }
    
    // Mettre à jour avec la location
    const updates = {
      ...formData,
      location
    };
    
    await updateUser(updates);
    setIsEditing(false);
    setErrors({});
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
            <p className="profile-location">📍 {user.location?.address || 'Adresse non définie'}</p>
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
              <label>Adresse *</label>
              <div className="input-with-buttons">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                  onBlur={handleAddressBlur}
                  placeholder="15 Rue de la Paix, Paris"
                  autoComplete="street-address"
                  disabled={geocodingAddress}
                  className={errors.address || errors.location ? 'error' : ''}
                />
                <div className="location-buttons">
                  <button
                    type="button"
                    onClick={handleGeocodeAddress}
                    className="btn-secondary btn-geocode"
                    disabled={geocodingAddress || gettingLocation}
                    title="Géocoder l'adresse"
                  >
                    {geocodingAddress ? '⏳' : '🔍'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="btn-secondary btn-gps"
                    disabled={gettingLocation || geocodingAddress}
                    title="Utiliser ma position GPS"
                  >
                    {gettingLocation ? '⏳' : '📍'}
                  </button>
                </div>
              </div>
              {location && (
                <div className="location-info">
                  ✅ Localisation : {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
              )}
              {errors.address && <span className="error-text">{errors.address}</span>}
              {errors.location && <span className="error-text">{errors.location}</span>}
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
                    bio: user.bio || '',
                    radius: user.radius,
                    address: user.location?.address || '',
                  });
                  setLocation(user.location);
                  setErrors({});
                }}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={geocodingAddress || gettingLocation}
              >
                {geocodingAddress || gettingLocation ? 'Traitement...' : 'Enregistrer'}
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

