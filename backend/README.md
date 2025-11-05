# 🏘️ RSocial Backend API

Backend API pour RSocial - Réseau social hyper-local

## 🚀 Technologies

- **Node.js** + **Express** - Serveur API REST
- **Supabase** - Base de données PostgreSQL + PostGIS
- **Socket.io** - WebSocket pour chat temps réel
- **JWT** - Authentification
- **Multer** - Upload de fichiers

## 📋 Prérequis

- Node.js 18+ 
- Un compte Supabase (gratuit)

## ⚙️ Installation

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configuration Supabase**

   a. Créez un projet sur [Supabase](https://app.supabase.com)
   
   b. Récupérez vos clés API (Settings → API)
   
   c. Créez le fichier `.env` :
```bash
cp env.example .env
```

   d. Remplissez les variables :
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

3. **Initialiser la base de données**

```bash
npm run init-db
```

Copiez le SQL généré et exécutez-le dans le SQL Editor de Supabase.

4. **Créer le bucket de storage**

Dans Supabase Dashboard → Storage → Create bucket:
- Nom: `rsocial-uploads`
- Public: ✅ Oui

## 🎯 Démarrage

```bash
# Mode développement (avec rechargement auto)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3001`

## 📡 API Endpoints

### Authentification

```
POST   /api/auth/register   - Inscription
POST   /api/auth/login      - Connexion
GET    /api/auth/me         - Profil utilisateur (protégé)
PUT    /api/auth/profile    - Modifier profil (protégé)
```

### Posts

```
GET    /api/posts           - Liste des posts (avec filtres géo)
POST   /api/posts           - Créer un post (protégé)
POST   /api/posts/:id/like  - Liker un post (protégé)
POST   /api/posts/:id/comments - Commenter (protégé)
DELETE /api/posts/:id       - Supprimer un post (protégé)
```

### Messages

```
GET    /api/messages/conversations - Liste des conversations (protégé)
POST   /api/messages               - Envoyer un message (protégé)
PUT    /api/messages/:id/read      - Marquer comme lu (protégé)
```

### Upload

```
POST   /api/upload/image    - Upload une image (protégé)
POST   /api/upload/images   - Upload plusieurs images (protégé)
```

### Utilisateurs

```
GET    /api/users           - Rechercher des utilisateurs (protégé)
GET    /api/users/:id       - Récupérer un utilisateur (protégé)
```

## 🔌 WebSocket Events

### Client → Serveur

```javascript
// Connexion
socket.connect({
  auth: { token: 'your_jwt_token' }
});

// Utilisateur en train d'écrire
socket.emit('typing', { receiverId: 'user_id' });

// Utilisateur a arrêté d'écrire
socket.emit('stop_typing', { receiverId: 'user_id' });

// Statut en ligne
socket.emit('online');
```

### Serveur → Client

```javascript
// Nouveau message reçu
socket.on('new_message', (message) => {
  console.log('Nouveau message:', message);
});

// Utilisateur en train d'écrire
socket.on('user_typing', ({ userId, isTyping }) => {
  console.log(`${userId} est en train d'écrire:`, isTyping);
});

// Utilisateur en ligne
socket.on('user_online', ({ userId }) => {
  console.log(`${userId} est en ligne`);
});

// Utilisateur hors ligne
socket.on('user_offline', ({ userId }) => {
  console.log(`${userId} est hors ligne`);
});
```

## 🔐 Authentification

Toutes les routes protégées nécessitent un header Authorization:

```
Authorization: Bearer your_jwt_token
```

## 📊 Structure de la base de données

### Tables principales

- `users` - Utilisateurs
- `posts` - Publications
- `post_likes` - Likes sur les posts
- `comments` - Commentaires
- `groups` - Groupes/Communautés
- `group_members` - Membres des groupes
- `events` - Événements
- `event_attendees` - Participants aux événements
- `classifieds` - Petites annonces
- `messages` - Messages privés
- `reports` - Signalements
- `blocked_users` - Utilisateurs bloqués

## 🧪 Exemple de requête

### Inscription

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+33612345678",
    "name": "Jean Dupont",
    "password": "password123",
    "location": {
      "lat": 48.8566,
      "lng": 2.3522,
      "address": "Paris, France"
    }
  }'
```

### Créer un post

```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Bonjour le quartier !",
    "type": "Annonce",
    "images": [],
    "location": {
      "lat": 48.8566,
      "lng": 2.3522,
      "address": "Paris, France"
    }
  }'
```

## 📝 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| PORT | Port du serveur | 3001 |
| NODE_ENV | Environnement | development |
| SUPABASE_URL | URL Supabase | - |
| SUPABASE_ANON_KEY | Clé anonyme Supabase | - |
| SUPABASE_SERVICE_KEY | Clé service Supabase | - |
| JWT_SECRET | Secret JWT | - |
| JWT_EXPIRES_IN | Durée validité token | 7d |
| CORS_ORIGIN | Origine CORS autorisée | http://localhost:5173 |
| MAX_FILE_SIZE | Taille max fichier (bytes) | 5242880 |
| ALLOWED_FILE_TYPES | Types de fichiers autorisés | image/jpeg,image/png,... |

## 🐛 Debugging

Activer les logs détaillés :

```bash
NODE_ENV=development npm run dev
```

## 📦 Déploiement

### Sur Heroku

```bash
heroku create rsocial-api
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...
# ... autres variables
git push heroku main
```

### Sur Railway/Render

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Déployez !

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt
- ✅ JWT pour l'authentification
- ✅ CORS configuré
- ✅ Validation des entrées
- ✅ Protection contre les injections SQL (Supabase)
- ✅ Rate limiting (à implémenter en production)

## 📄 Licence

MIT

## 🙏 Support

Pour toute question, consultez la documentation complète ou ouvrez une issue.

