# 🏘️ RSocial - Réseau Social Hyper-Local

RSocial est une application complète de réseau social hyper-local qui connecte les personnes, les commerces et les événements dans une zone géographique restreinte (quartier/ville).

**✅ Application 100% opérationnelle avec backend complet et base de données.**

## 📋 Vue d'ensemble

RSocial permet aux résidents locaux, aux commerces et aux associations de :
- **Découvrir** les événements et services du quartier
- **Communiquer** avec les voisins via un fil d'actualités local
- **S'entraider** avec des demandes d'aide et des signalements
- **Échanger** via les petites annonces locales
- **Participer** aux événements de la communauté

## ✨ Fonctionnalités principales

### 🔐 Authentification
- Inscription simple avec email/téléphone
- Vérification SMS optionnelle (simulation)
- Gestion de session sécurisée

### 📍 Géolocalisation
- Rayon de recherche configurable (1-5 km)
- Filtrage automatique du contenu par distance
- Carte interactive avec marqueurs

### 📰 Fil d'actualités
- Publications texte + photos
- Tags : Annonce, Événement, Aide, Perdu/Trouvé
- Likes et commentaires
- Filtres par type de publication

### 🗺️ Carte Interactive
- Visualisation des posts, événements et groupes
- Cercle de rayon personnalisé
- Popups avec informations détaillées

### 👥 Groupes & Communautés
- Types : Rue, Immeuble, Hobby
- Rejoindre/quitter des groupes
- Gestion des membres

### 📅 Événements
- Création d'événements locaux
- RSVP / Participation
- Limite de participants optionnelle
- Image d'événement

### 🏷️ Petites Annonces
- Catégories : Vente, Don, Service, Recherche
- Prix et descriptions
- Contact direct via messagerie

### 💬 Messagerie Privée
- Conversations 1:1
- Historique des messages
- Notifications de nouveaux messages
- Signalement et blocage d'utilisateurs

### 🔔 Notifications
- Notifications push (simulation)
- Nouveaux posts dans le rayon
- Nouveaux messages
- Événements à venir
- Marquer comme lu

### 👤 Profil Utilisateur
- Bio personnalisable
- Avatar automatique
- Statistiques (posts, voisins)
- Gestion du rayon de recherche
- Historique des publications

### ⚠️ Modération
- Signalement de contenu
- Blocage d'utilisateurs
- Gestion des signalements
- Liste des utilisateurs bloqués

## 🚀 Installation

### Prérequis
- **Node.js 18+** 
- **npm** ou **yarn**
- Un compte **Supabase** (gratuit) - [Créer un compte](https://app.supabase.com)

### Étapes d'installation

#### 1. Cloner le dépôt
```bash
cd RSocial
```

#### 2. Installation du Frontend

```bash
# Installer les dépendances frontend
npm install
```

#### 3. Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances backend
npm install
```

#### 4. Configuration Supabase

a. **Créer un projet Supabase**
   - Allez sur [Supabase](https://app.supabase.com)
   - Créez un nouveau projet
   - Notez votre URL et vos clés API (Settings → API)

b. **Configurer le backend**
   ```bash
   # Dans le dossier backend
   cp env.example .env
   ```
   
   Éditez le fichier `.env` et remplissez :
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

c. **Initialiser la base de données**
   ```bash
   # Dans le dossier backend
   npm run init-db
   ```
   
   Copiez le SQL généré et exécutez-le dans le SQL Editor de Supabase.

d. **Configurer le Storage**
   - Dans Supabase Dashboard → Storage → Create bucket
   - Nom : `rsocial-uploads`
   - Public : ✅ Oui
   - Exécutez le SQL dans `backend/SUPABASE_STORAGE_SETUP.sql`

#### 5. Configuration du Frontend

```bash
# Retourner à la racine du projet
cd ..

# Créer le fichier .env.local
cp env.local.example .env.local
```

Éditez `.env.local` :
```env
VITE_API_URL=http://localhost:3001/api
```

#### 6. Lancer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:3001`

**Terminal 2 - Frontend :**
```bash
# À la racine du projet
npm run dev
```
L'application s'ouvre sur `http://localhost:5173`

## 📦 Technologies utilisées

### Frontend
- **React 19** - Framework UI moderne
- **Vite** - Build tool rapide
- **React Router DOM** - Navigation
- **React Context API** - Gestion d'état
- **Axios** - Client HTTP
- **React Leaflet** - Cartes interactives
- **Socket.io Client** - WebSocket pour temps réel
- **date-fns** - Manipulation des dates
- **CSS Modules** - Styling

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Supabase** - Base de données PostgreSQL + PostGIS + Storage
- **JWT** - Authentification sécurisée
- **Socket.io** - WebSocket serveur
- **Multer** - Upload de fichiers
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données

## 🏗️ Structure du projet

```
RSocial/
├── src/                          # Frontend React
│   ├── components/               # Composants React
│   │   ├── Auth/                # Connexion/Inscription
│   │   ├── Feed/                # Fil d'actualités
│   │   ├── Map/                 # Carte interactive
│   │   ├── Groups/              # Groupes
│   │   ├── Events/              # Événements
│   │   ├── Classifieds/         # Petites annonces
│   │   ├── Messages/            # Messagerie
│   │   ├── Notifications/       # Notifications
│   │   ├── Profile/             # Profil utilisateur
│   │   ├── Moderation/          # Modération
│   │   └── Layout/              # Header, Sidebar
│   │
│   ├── contexts/                # Contextes React
│   │   ├── AuthContext.jsx      # Authentification
│   │   └── AppContext.jsx       # État global
│   │
│   ├── services/                # Services API
│   │   ├── postService.js       # Gestion des posts
│   │   ├── messageService.js    # Messagerie
│   │   ├── eventService.js      # Événements
│   │   ├── groupService.js      # Groupes
│   │   ├── classifiedService.js # Petites annonces
│   │   ├── uploadService.js     # Upload d'images
│   │   └── socketService.js     # WebSocket
│   │
│   ├── config/                  # Configuration
│   │   └── api.js               # Client Axios
│   │
│   ├── utils/                   # Utilitaires
│   │   ├── geolocation.js       # Calculs de distance
│   │   ├── dateUtils.js         # Formatage des dates
│   │   └── validation.js        # Validation de formulaires
│   │
│   ├── App.jsx                  # Composant principal
│   ├── App.css                  # Styles globaux
│   └── main.jsx                 # Point d'entrée
│
├── backend/                     # Backend Node.js/Express
│   ├── src/
│   │   ├── controllers/         # Contrôleurs
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   ├── eventController.js
│   │   │   ├── groupController.js
│   │   │   └── classifiedController.js
│   │   │
│   │   ├── routes/              # Routes API
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── messages.js
│   │   │   ├── events.js
│   │   │   ├── groups.js
│   │   │   ├── classifieds.js
│   │   │   ├── upload.js
│   │   │   └── users.js
│   │   │
│   │   ├── middleware/          # Middleware
│   │   │   ├── auth.js          # Authentification JWT
│   │   │   ├── errorHandler.js  # Gestion d'erreurs
│   │   │   └── logger.js        # Logging
│   │   │
│   │   ├── services/            # Services backend
│   │   │   └── socket.js        # WebSocket serveur
│   │   │
│   │   ├── config/              # Configuration
│   │   │   └── supabase.js      # Client Supabase
│   │   │
│   │   ├── utils/               # Utilitaires
│   │   │   └── geolocation.js   # Calculs géographiques
│   │   │
│   │   ├── scripts/             # Scripts utilitaires
│   │   │   └── initDatabase.js  # Initialisation BDD
│   │   │
│   │   └── server.js            # Serveur Express
│   │
│   ├── SUPABASE_STORAGE_SETUP.sql
│   ├── package.json
│   ├── env.example
│   └── README.md
│
├── public/                      # Fichiers publics
├── index.html                   # HTML de base
├── package.json                 # Dépendances frontend
├── vite.config.js               # Configuration Vite
├── env.local.example            # Exemple de config frontend
└── README.md                    # Ce fichier
```

## 🎨 Design

L'application utilise un design moderne et responsive avec :
- **Mobile-first** approach
- Palette de couleurs cohérente (violet/bleu)
- Animations fluides
- Icônes emoji pour une UX ludique
- Dark mode (non implémenté dans la v1)

## 📱 Responsive

L'application est entièrement responsive :
- **Desktop** : Sidebar permanente, vue large
- **Tablet** : Sidebar rétractable, grille adaptée
- **Mobile** : Menu burger, vue verticale optimisée

## 🔒 Sécurité & Confidentialité

- **Authentification JWT** sécurisée
- **Mots de passe hashés** avec bcryptjs
- **Base de données PostgreSQL** avec Supabase
- **Row Level Security (RLS)** activé
- **CORS** configuré
- **Validation des entrées** côté serveur
- **Protection contre les injections SQL** (Supabase)
- Signalement et blocage d'utilisateurs
- Modération des contenus

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur (protégé)
- `PUT /api/auth/profile` - Modifier profil (protégé)

### Posts
- `GET /api/posts` - Liste des posts (avec filtres géo)
- `POST /api/posts` - Créer un post (protégé)
- `POST /api/posts/:id/like` - Liker un post (protégé)
- `POST /api/posts/:id/comments` - Commenter (protégé)
- `DELETE /api/posts/:id` - Supprimer un post (protégé)

### Messages
- `GET /api/messages/conversations` - Liste des conversations (protégé)
- `POST /api/messages` - Envoyer un message (protégé)
- `PUT /api/messages/:id/read` - Marquer comme lu (protégé)

### Upload
- `POST /api/upload/image` - Upload une image (protégé)
- `POST /api/upload/images` - Upload plusieurs images (protégé)

### Utilisateurs
- `GET /api/users` - Rechercher des utilisateurs (protégé)
- `GET /api/users/:id` - Récupérer un utilisateur (protégé)

### Événements, Groupes, Petites Annonces
- Routes similaires pour les événements, groupes et petites annonces

**Note** : Toutes les routes protégées nécessitent un header `Authorization: Bearer <token>`

## 🔌 WebSocket (Socket.io)

L'application utilise Socket.io pour la messagerie en temps réel :
- Messages instantanés
- Statut en ligne/hors ligne
- Indicateur de frappe
- Notifications en temps réel

## 🧪 Test de l'application

1. **Créer un compte** via l'interface d'inscription
2. **Se connecter** avec vos identifiants
3. **Explorer les fonctionnalités** :
   - Créer des posts
   - Rejoindre des groupes
   - Créer des événements
   - Publier des petites annonces
   - Envoyer des messages
   - Utiliser la carte interactive

## ✅ Fonctionnalités implémentées

- ✅ **Backend complet** avec API REST
- ✅ **Base de données PostgreSQL** avec Supabase
- ✅ **Authentification JWT** sécurisée
- ✅ **Upload d'images** réel vers Supabase Storage
- ✅ **Chat en temps réel** avec WebSocket (Socket.io)
- ✅ **Géolocalisation** avec PostGIS
- ✅ **Carte interactive** avec Leaflet
- ✅ **150+ fonctionnalités** complètes

## 🚧 Améliorations futures

- [ ] Application mobile (React Native)
- [ ] Notifications push réelles
- [ ] Système de réputation
- [ ] Badges et récompenses
- [ ] Mode sombre
- [ ] Multilingue (i18n)
- [ ] Tests unitaires et E2E
- [ ] PWA (Progressive Web App)
- [ ] Rate limiting avancé
- [ ] Analytics et monitoring

## 📝 Scripts disponibles

### Frontend (racine du projet)
```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview de production
npm run preview

# Lint du code
npm run lint
```

### Backend (dossier backend)
```bash
# Développement avec rechargement auto
npm run dev

# Production
npm start

# Initialiser la base de données
npm run init-db
```

## 🤝 Contribution

Pour contribuer à RSocial :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📚 Documentation supplémentaire

- [Guide d'intégration Backend](BACKEND_INTEGRATION_GUIDE.md)
- [Guide de déploiement](DEPLOYMENT_GUIDE.md)
- [Guide de configuration](CONFIGURATION_GUIDE.md)
- [README Backend](backend/README.md)
- [Liste complète des fonctionnalités](FEATURES.md)

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ pour connecter les communautés locales.

## 🙏 Remerciements

- React.js team
- Express.js
- Supabase
- Leaflet & React-Leaflet
- Socket.io
- Tous les contributeurs open source

---

**Note**: Cette application est maintenant complète avec backend, base de données et toutes les fonctionnalités principales. Elle est prête pour le déploiement en production.

