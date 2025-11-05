import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePhone } from '../../utils/validation';
import './Auth.css';

const Login = ({ onToggleMode }) => {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' ou 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Effacer l'erreur lors de la saisie
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email requis';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Téléphone requis';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Numéro de téléphone invalide';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('[Login] Début de la soumission du formulaire');
    console.log('[Login] Données du formulaire:', {
      email: formData.email,
      phone: formData.phone,
      passwordLength: formData.password.length,
      hasPassword: !!formData.password
    });
    
    if (!validate()) {
      console.log('[Login] Validation échouée');
      return;
    }
    
    console.log('[Login] Validation réussie, tentative de connexion...');
    setLoading(true);
    
    try {
      const email = loginMethod === 'email' ? formData.email : '';
      const phone = loginMethod === 'phone' ? formData.phone : '';
      const result = await login(email, phone, formData.password);
      console.log('[Login] Résultat de la connexion:', result);
      
      if (!result.success) {
        console.error('[Login] Échec de la connexion:', result.error);
        setErrors({ general: result.error });
      } else {
        console.log('[Login] Connexion réussie!');
      }
    } catch (error) {
      console.error('[Login] Erreur lors de la connexion:', error);
      setErrors({ general: 'Erreur lors de la connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-section">
        <div className="auth-image-content">
          <h1>RSocial</h1>
          <h2>Bienvenue !</h2>
          <p>Rejoignez votre communauté locale et connectez-vous avec vos voisins</p>
          <div className="auth-image-visual">
            <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Maison principale */}
              <rect x="150" y="200" width="200" height="150" rx="10" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
              <path d="M150 200 L250 120 L350 200 Z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
              <rect x="200" y="250" width="100" height="100" rx="5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="220" cy="290" r="8" fill="rgba(255,255,255,0.6)"/>
              <circle cx="280" cy="290" r="8" fill="rgba(255,255,255,0.6)"/>
              
              {/* Maisons secondaires */}
              <rect x="80" y="240" width="60" height="80" rx="5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M80 240 L110 200 L140 240 Z" fill="rgba(255,255,255,0.25)"/>
              
              <rect x="360" y="240" width="60" height="80" rx="5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M360 240 L390 200 L420 240 Z" fill="rgba(255,255,255,0.25)"/>
              
              {/* Personnes connectées */}
              <circle cx="120" cy="150" r="20" fill="rgba(255,255,255,0.4)"/>
              <path d="M120 170 L120 200 L110 210 L130 210 L120 200 Z" fill="rgba(255,255,255,0.3)"/>
              
              <circle cx="380" cy="150" r="20" fill="rgba(255,255,255,0.4)"/>
              <path d="M380 170 L380 200 L370 210 L390 210 L380 200 Z" fill="rgba(255,255,255,0.3)"/>
              
              {/* Lignes de connexion */}
              <path d="M140 160 Q250 140 360 160" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
              
              {/* Étoiles */}
              <circle cx="100" cy="100" r="3" fill="rgba(255,255,255,0.6)"/>
              <circle cx="400" cy="90" r="2.5" fill="rgba(255,255,255,0.5)"/>
              <circle cx="450" cy="130" r="2" fill="rgba(255,255,255,0.4)"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h1>RSocial</h1>
            <h2>Connexion</h2>
            <p>Connectez-vous pour rejoindre votre communauté locale</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <div className="login-method-toggle">
            <button
              type="button"
              className={`toggle-button ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => {
                setLoginMethod('email');
                setErrors({});
                setFormData({ ...formData, phone: '' });
              }}
              disabled={loading}
            >
              📧 Email
            </button>
            <button
              type="button"
              className={`toggle-button ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setLoginMethod('phone');
                setErrors({});
                setFormData({ ...formData, email: '' });
              }}
              disabled={loading}
            >
              📱 Téléphone
            </button>
          </div>

          {loginMethod === 'email' ? (
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
          ) : (
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
          )}

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <button onClick={onToggleMode} className="link-button">
              S'inscrire
            </button>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

