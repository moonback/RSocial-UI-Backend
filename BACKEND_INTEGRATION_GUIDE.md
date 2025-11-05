# 🔗 Guide d'Intégration Backend - RSocial

Guide pour connecter le frontend React avec le backend API

## 📦 Installation des dépendances frontend

Ajoutez ces packages au frontend :

```bash
cd .  # Retour à la racine
npm install axios socket.io-client
```

## 🔧 Configuration

### 1. Créer le fichier de configuration API

Créez `src/config/api.js` :

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Créer le service Socket.io

Créez `src/services/socketService.js` :

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

class SocketService {
  socket = null;

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      this.socket.emit('online');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
```

## 🔄 Mise à jour du AuthContext

Remplacez `src/contexts/AuthContext.jsx` :

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';
import socketService from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
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
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'inscription'
      };
    }
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
      return {
        success: false,
        error: error.response?.data?.error || 'Identifiants invalides'
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
      console.error('Erreur mise à jour profil:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📡 Services API

### Service Posts

Créez `src/services/postService.js` :

```javascript
import api from '../config/api';

export const postService = {
  // Récupérer les posts
  getPosts: async (lat, lng, radius, type = 'all') => {
    const { data } = await api.get('/posts', {
      params: { lat, lng, radius, type }
    });
    return data.posts;
  },

  // Créer un post
  createPost: async (postData) => {
    const { data } = await api.post('/posts', postData);
    return data.post;
  },

  // Liker un post
  likePost: async (postId) => {
    const { data } = await api.post(`/posts/${postId}/like`);
    return data;
  },

  // Commenter un post
  addComment: async (postId, content) => {
    const { data } = await api.post(`/posts/${postId}/comments`, { content });
    return data.comment;
  },

  // Supprimer un post
  deletePost: async (postId) => {
    await api.delete(`/posts/${postId}`);
  }
};
```

### Service Upload

Créez `src/services/uploadService.js` :

```javascript
import api from '../config/api';

export const uploadService = {
  // Upload une image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data.url;
  },

  // Upload plusieurs images
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const { data } = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data.images.map(img => img.url);
  }
};
```

### Service Messages

Créez `src/services/messageService.js` :

```javascript
import api from '../config/api';
import socketService from './socketService';

export const messageService = {
  // Récupérer les conversations
  getConversations: async () => {
    const { data } = await api.get('/messages/conversations');
    return data.conversations;
  },

  // Envoyer un message
  sendMessage: async (receiverId, content) => {
    const { data } = await api.post('/messages', {
      receiverId,
      content
    });
    return data.message;
  },

  // Marquer comme lu
  markAsRead: async (messageId) => {
    await api.put(`/messages/${messageId}/read`);
  },

  // Écouter les nouveaux messages
  onNewMessage: (callback) => {
    socketService.on('new_message', callback);
  },

  // Utilisateur en train d'écrire
  typing: (receiverId) => {
    socketService.emit('typing', { receiverId });
  },

  stopTyping: (receiverId) => {
    socketService.emit('stop_typing', { receiverId });
  }
};
```

## 🌍 Variables d'environnement

Créez `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3001/api
```

Pour la production :

```env
VITE_API_URL=https://your-api.com/api
```

## 📝 Mise à jour du Register.jsx

Exemple d'intégration pour l'inscription :

```javascript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';
import { getUserLocation } from '../../utils/geolocation';

const Register = ({ onToggleMode }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
  });
  // ... reste du code

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    const location = formData.location || {
      lat: 48.8566 + (Math.random() - 0.5) * 0.1,
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
      address: formData.address,
    };
    
    const result = await register(
      formData.email,
      formData.phone,
      formData.name,
      formData.password,  // Ajout du mot de passe
      location
    );
    
    if (!result.success) {
      setErrors({ general: result.error });
    }
    
    setLoading(false);
  };

  // ... reste du code avec champ password
};
```

## 🧪 Test de l'intégration

### 1. Démarrer le backend

```bash
cd backend
npm run dev
```

### 2. Démarrer le frontend

```bash
npm run dev
```

### 3. Tester

1. Créez un compte
2. Vérifiez dans Supabase que l'utilisateur est créé
3. Testez la création de posts
4. Testez le chat en temps réel (ouvrez 2 onglets)

## 🐛 Debugging

### Vérifier les appels API

Dans la console navigateur (F12), onglet Network, filtrez par "XHR" pour voir les requêtes.

### Vérifier WebSocket

```javascript
// Dans la console navigateur
socketService.socket.connected // doit être true
```

### Logs serveur

Le backend affiche tous les appels :
```
✅ POST /api/auth/register - 201 (45ms)
✅ GET /api/posts?lat=48.85&lng=2.35&radius=3 - 200 (12ms)
```

## 🚀 Prochaines étapes

1. ✅ Remplacer tous les appels mockData par les services API
2. ✅ Implémenter l'upload d'images réel
3. ✅ Tester le WebSocket pour le chat
4. ✅ Gérer les états de chargement
5. ✅ Gérer les erreurs réseau

## 📚 Ressources

- [Documentation Axios](https://axios-http.com/)
- [Documentation Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Documentation Supabase](https://supabase.com/docs)

---

🎉 **Votre backend est prêt et intégré !**

