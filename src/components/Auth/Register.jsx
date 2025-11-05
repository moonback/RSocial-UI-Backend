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
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏘️ RSocial</h1>
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
  );
};

export default Register;

