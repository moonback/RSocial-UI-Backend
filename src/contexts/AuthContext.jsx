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
      const { data } = await api.post('/auth/login', {
        email,
        phone,
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      socketService.connect(data.token);

      return { success: true };
    } catch (error) {
      console.error('Erreur login:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Identifiants invalides'
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

