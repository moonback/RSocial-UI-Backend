import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Vérifier si un utilisateur est déjà connecté (localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, phone) => {
    setLoading(true);
    try {
      // Simulation d'une connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now().toString(),
        email,
        phone,
        name: email.split('@')[0],
        bio: '',
        location: { lat: 48.8566, lng: 2.3522, address: 'Paris, France' },
        radius: 3, // km
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
        createdAt: new Date().toISOString(),
        neighbors: [],
        posts: [],
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, phone, name, location) => {
    setLoading(true);
    try {
      // Simulation d'une inscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now().toString(),
        email,
        phone,
        name: name || email.split('@')[0],
        bio: '',
        location: location || { lat: 48.8566, lng: 2.3522, address: 'Paris, France' },
        radius: 3,
        avatar: `https://ui-avatars.com/api/?name=${name || email.split('@')[0]}&background=random`,
        createdAt: new Date().toISOString(),
        neighbors: [],
        posts: [],
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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

