import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';
import { getUserLocation, geocodeAddress, reverseGeocode } from '../../utils/geolocation';
import './Auth.css';

const Register = ({ onToggleMode }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [location, setLocation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Obtenir la position GPS actuelle et récupérer l'adresse
  const handleGetLocation = async () => {
    setGettingLocation(true);
    setErrors({ ...errors, location: '' });
    try {
      // Obtenir les coordonnées GPS
      const gpsLocation = await getUserLocation();
      
      // Faire un reverse geocoding pour obtenir l'adresse
      try {
        const locationWithAddress = await reverseGeocode(gpsLocation.lat, gpsLocation.lng);
        setLocation(locationWithAddress);
        setFormData({
          ...formData,
          address: locationWithAddress.address,
          location: locationWithAddress,
        });
      } catch (reverseError) {
        // Si le reverse geocoding échoue, utiliser les coordonnées avec une adresse par défaut
        const locationData = {
          ...gpsLocation,
          address: formData.address || `Position: ${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}`
        };
        setLocation(locationData);
        setFormData({
          ...formData,
          location: locationData,
        });
        console.warn('Reverse geocoding échoué, utilisation des coordonnées:', reverseError);
      }
    } catch (error) {
      setErrors({
        ...errors,
        location: 'Impossible d\'obtenir votre localisation GPS',
      });
    }
    setGettingLocation(false);
  };

  // Géocoder l'adresse saisie (convertir en coordonnées)
  const handleGeocodeAddress = async () => {
    if (!formData.address || formData.address.trim().length === 0) {
      setErrors({ ...errors, address: 'Veuillez saisir une adresse' });
      return;
    }

    setGeocodingAddress(true);
    try {
      const geocodedLocation = await geocodeAddress(formData.address);
      setLocation(geocodedLocation);
      setFormData({
        ...formData,
        location: geocodedLocation,
        address: geocodedLocation.address // Mettre à jour avec l'adresse formatée
      });
      setErrors({ ...errors, location: '', address: '' });
    } catch (error) {
      setErrors({
        ...errors,
        location: error.message || 'Impossible de géocoder l\'adresse',
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

  const validate = () => {
    const newErrors = {};
    
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!validateRequired(formData.address)) {
      newErrors.address = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Si pas de localisation, essayer de géocoder l'adresse
    if (!location && formData.address) {
      setGeocodingAddress(true);
      try {
        const geocodedLocation = await geocodeAddress(formData.address);
        setLocation(geocodedLocation);
        setFormData({
          ...formData,
          location: geocodedLocation,
          address: geocodedLocation.address
        });
      } catch (error) {
        setErrors({
          general: error.message || 'Impossible de géocoder l\'adresse. Veuillez utiliser le bouton de géocodage ou la géolocalisation GPS.',
        });
        setGeocodingAddress(false);
        return;
      }
      setGeocodingAddress(false);
    }
    
    if (!location) {
      setErrors({
        general: 'Veuillez géolocaliser votre adresse en cliquant sur le bouton 📍 ou 🔍',
      });
      return;
    }
    
    setLoading(true);
    
    const result = await register(
      formData.email,
      formData.phone,
      formData.name,
      formData.password,
      location
    );
    
    if (!result.success) {
      // Afficher l'erreur générale
      const errorMessage = result.error || 'Erreur lors de l\'inscription';
      const errorLower = errorMessage.toLowerCase();
      
      // Si l'erreur concerne l'email ou le téléphone, mettre en évidence les champs concernés
      const newErrors = { general: errorMessage };
      
      if (errorLower.includes('email') || errorLower.includes('existe déjà')) {
        newErrors.email = errorMessage;
      }
      if (errorLower.includes('téléphone') || errorLower.includes('telephone') || errorLower.includes('existe déjà')) {
        newErrors.phone = errorMessage;
      }
      
      setErrors(newErrors);
    } else {
      // Réinitialiser les erreurs en cas de succès
      setErrors({});
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-image-section">
        <div className="auth-image-content">
          <h1>RSocial</h1>
          <h2>Commencez votre aventure</h2>
          <p>Créez votre compte et découvrez votre quartier sous un nouvel angle</p>
          <div className="auth-image-visual">
            <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Carte du quartier */}
              <rect x="100" y="150" width="300" height="200" rx="15" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
              
              {/* Rues */}
              <line x1="250" y1="150" x2="250" y2="350" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              <line x1="100" y1="250" x2="400" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              
              {/* Points d'intérêt */}
              <circle cx="175" cy="200" r="12" fill="rgba(255,255,255,0.5)"/>
              <circle cx="325" cy="200" r="12" fill="rgba(255,255,255,0.5)"/>
              <circle cx="175" cy="300" r="12" fill="rgba(255,255,255,0.5)"/>
              <circle cx="325" cy="300" r="12" fill="rgba(255,255,255,0.5)"/>
              
              {/* Point central (vous) */}
              <circle cx="250" cy="250" r="18" fill="rgba(255,255,255,0.6)"/>
              <circle cx="250" cy="250" r="25" fill="rgba(255,255,255,0.2)"/>
              <circle cx="250" cy="250" r="35" fill="rgba(255,255,255,0.1)"/>
              
              {/* Icônes de maisons */}
              <rect x="160" y="185" width="30" height="30" rx="3" fill="rgba(255,255,255,0.3)"/>
              <path d="M160 185 L175 170 L190 185 Z" fill="rgba(255,255,255,0.4)"/>
              
              <rect x="310" y="185" width="30" height="30" rx="3" fill="rgba(255,255,255,0.3)"/>
              <path d="M310 185 L325 170 L340 185 Z" fill="rgba(255,255,255,0.4)"/>
              
              <rect x="160" y="285" width="30" height="30" rx="3" fill="rgba(255,255,255,0.3)"/>
              <path d="M160 285 L175 270 L190 285 Z" fill="rgba(255,255,255,0.4)"/>
              
              <rect x="310" y="285" width="30" height="30" rx="3" fill="rgba(255,255,255,0.3)"/>
              <path d="M310 285 L325 270 L340 285 Z" fill="rgba(255,255,255,0.4)"/>
              
              {/* Lignes de connexion */}
              <path d="M187 203 Q250 220 313 203" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
              <path d="M187 303 Q250 280 313 303" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
              <path d="M175 250 Q250 240 325 250" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
              
              {/* Éléments décoratifs */}
              <circle cx="80" cy="100" r="4" fill="rgba(255,255,255,0.5)"/>
              <circle cx="420" cy="120" r="3" fill="rgba(255,255,255,0.4)"/>
              <circle cx="450" cy="180" r="3.5" fill="rgba(255,255,255,0.45)"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h1>RSocial</h1>
            <h2>Inscription</h2>
            <p>Rejoignez votre communauté locale</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <span>{errors.general}</span>
                {errors.general.toLowerCase().includes('existe déjà') && (
                  <button 
                    type="button"
                    onClick={onToggleMode}
                    className="error-link"
                  >
                    Se connecter à la place
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Nom complet *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jean Dupont"
              autoComplete="name"
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              autoComplete="email"
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
              autoComplete="tel"
              disabled={loading}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe * (min 6 caractères)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse *</label>
            <div className="input-with-buttons">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleAddressBlur}
                placeholder="15 Rue de la Paix, Paris"
                autoComplete="street-address"
                disabled={loading || geocodingAddress}
              />
              <div className="location-buttons">
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  className="btn-secondary btn-geocode"
                  disabled={loading || geocodingAddress || gettingLocation}
                  title="Géocoder l'adresse"
                >
                  {geocodingAddress ? '⏳' : '🔍'}
                </button>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="btn-secondary btn-gps"
                  disabled={loading || gettingLocation || geocodingAddress}
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ?{' '}
            <button onClick={onToggleMode} className="link-button">
              Se connecter
            </button>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

