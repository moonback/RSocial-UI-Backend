import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePhone } from '../../utils/validation';
import './Auth.css';

const Login = ({ onToggleMode }) => {
  const { login } = useAuth();
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
    
    if (!formData.email && !formData.phone) {
      newErrors.general = 'Veuillez fournir un email ou un téléphone';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
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
      const result = await login(formData.email, formData.phone, formData.password);
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
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏘️ RSocial</h1>
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

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-divider">
            <span>OU</span>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
              autoComplete="tel"
              disabled={loading}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

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
  );
};

export default Login;

