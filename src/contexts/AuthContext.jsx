import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import socketService from '../services/socketService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        socketService.connect(token);
      } catch (error) {
        console.error('Erreur checkAuth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email, phone, password) => {
    try {
      console.log('[AuthContext] Début de la fonction login');
      console.log('[AuthContext] Paramètres reçus:', {
        email: email || '(vide)',
        phone: phone || '(vide)',
        passwordLength: password?.length || 0,
        hasPassword: !!password
      });
      
      const requestData = {
        email,
        phone,
        password
      };
      console.log('[AuthContext] Données de la requête:', {
        ...requestData,
        password: password ? `[${password.length} caractères]` : '(vide)'
      });
      
      console.log('[AuthContext] URL de l\'API:', api.defaults.baseURL);
      console.log('[AuthContext] Envoi de la requête POST /auth/login...');
      
      const response = await api.post('/auth/login', requestData);
      
      console.log('[AuthContext] Réponse reçue:', {
        status: response.status,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        userId: response.data?.user?.id,
        userName: response.data?.user?.name
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      socketService.connect(response.data.token);

      console.log('[AuthContext] Connexion réussie, utilisateur stocké');
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Erreur lors de la connexion:');
      console.error('[AuthContext] Type d\'erreur:', error.constructor.name);
      console.error('[AuthContext] Message:', error.message);
      console.error('[AuthContext] Réponse de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      console.error('[AuthContext] Erreur complète:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Identifiants invalides'
      };
    }
  };

  const register = async (email, phone, name, password, location) => {
    try {
      const { data } = await api.post('/auth/register', {
        email,
        phone,
        name,
        password,
        location
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      socketService.connect(data.token);

      return { success: true };
    } catch (error) {
      console.error('Erreur register:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'inscription'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    setUser(null);
  };

  const updateUser = async (updates) => {
    try {
      const { data } = await api.put('/auth/profile', updates);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Erreur updateUser:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

