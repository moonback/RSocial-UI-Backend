import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';
import { getUserLocation } from '../../utils/geolocation';
import './Auth.css';

const Register = ({ onToggleMode }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getUserLocation();
      setFormData({
        ...formData,
        location,
      });
      setErrors({ ...errors, location: '' });
    } catch (error) {
      setErrors({
        ...errors,
        location: 'Impossible d\'obtenir votre localisation',
      });
    }
    setGettingLocation(false);
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
    
    if (!validateRequired(formData.address)) {
      newErrors.address = 'L\'adresse est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    // Simuler l'obtention de coordonnées depuis l'adresse
    const location = formData.location || {
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
      address: formData.address,
    };
    
    const result = await register(
      formData.email,
      formData.phone,
      formData.name,
      location
    );
    
    if (!result.success) {
      setErrors({ general: result.error });
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
            <div className="error-message">{errors.general}</div>
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
              disabled={loading}
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
              disabled={loading}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse *</label>
            <div className="input-with-button">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="15 Rue de la Paix, Paris"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="btn-secondary"
                disabled={loading || gettingLocation}
              >
                📍
              </button>
            </div>
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

