# 🏘️ RSocial - Réseau Social Hyper-Local

**RSocial est une plateforme complète de réseau social hyper-local qui connecte les communautés de quartier, les commerces et les événements locaux dans une zone géographique restreinte.**

## 📋 Présentation

RSocial permet aux résidents locaux, aux commerces et aux associations de :
- **Découvrir** les événements et services du quartier
- **Communiquer** avec les voisins via un fil d'actualités local
- **S'entraider** avec des demandes d'aide et des signalements
- **Échanger** via les petites annonces locales
- **Participer** aux événements de la communauté

## 🚀 Technologies Utilisées

### Frontend
- **React 19** - Framework UI moderne
- **Vite 7** - Build tool rapide et optimisé
- **React Router DOM 7** - Navigation SPA
- **React Context API** - Gestion d'état globale
- **Axios** - Client HTTP pour les appels API
- **React Leaflet** - Cartes interactives basées sur OpenStreetMap
- **Socket.io Client** - WebSocket pour la messagerie en temps réel
- **date-fns** - Manipulation et formatage des dates

### Backend
- **Node.js** - Runtime JavaScript
- **Express 4** - Framework web minimaliste
- **Supabase** - Base de données PostgreSQL + PostGIS + Storage
- **JWT (jsonwebtoken)** - Authentification sécurisée
- **Socket.io** - Serveur WebSocket pour le temps réel
- **Multer** - Gestion de l'upload de fichiers
- **bcryptjs** - Hashage sécurisé des mots de passe
- **express-validator** - Validation des données d'entrée

### Base de Données
- **PostgreSQL** (via Supabase)
- **PostGIS** - Extension pour les données géographiques
- **Supabase Storage** - Stockage des fichiers (images, vidéos)

## ✨ Fonctionnalités Principales (MVP)

### 🔐 Authentification
- Inscription avec email/téléphone et géolocalisation
- Connexion sécurisée avec JWT
- Gestion de session persistante
- Profil utilisateur personnalisable

### 📍 Géolocalisation
- Rayon de recherche configurable (1-5 km)
- Filtrage automatique du contenu par distance
- Carte interactive avec marqueurs et cercle de rayon
- Calculs de distance en temps réel

### 📰 Fil d'Actualités
- Publications texte + photos avec géolocalisation
- Types de posts : Annonce, Événement, Aide, Perdu/Trouvé
- Système de likes/dislikes et commentaires
- Filtres par type de publication
- Affichage des distances et dates relatives

### 🗺️ Carte Interactive
- Visualisation des posts, événements et groupes
- Cercle de rayon personnalisé visible
- Popups avec informations détaillées
- Filtres par type de contenu

### 👥 Groupes & Communautés
- Types : Rue, Immeuble, Hobby, Autre
- Rejoindre/quitter des groupes
- Gestion des membres et affichage des statistiques

### 📅 Événements
- Création d'événements locaux avec date/heure
- RSVP / Participation avec limite de participants
- Image d'événement personnalisée
- Filtres : Tous, À venir, Mes événements

### 🏷️ Petites Annonces
- Catégories : Vente, Don, Service, Recherche
- Prix et descriptions détaillées
- Images multiples
- Contact direct via messagerie

### 💬 Messagerie Privée
- Conversations 1:1 en temps réel via WebSocket
- Historique des messages
- Notifications de nouveaux messages
- Signalement et blocage d'utilisateurs

### 🔔 Notifications
- Notifications push (simulation)
- Nouveaux posts dans le rayon
- Nouveaux messages
- Événements à venir
- Système de marquage lu/non lu

### 👤 Profil Utilisateur
- Bio personnalisable
- Avatar automatique ou personnalisé
- Statistiques (posts, voisins, followers)
- Gestion du rayon de recherche
- Historique des publications

### ⚠️ Modération
- Signalement de contenu (posts, utilisateurs, commentaires)
- Blocage d'utilisateurs
- Gestion des signalements (pending/resolved/dismissed)
- Liste des utilisateurs bloqués

### 📸 Stories (24h)
- Création de stories avec images/vidéos
- Expiration automatique après 24h
- Suivi des vues
- Géolocalisation optionnelle

## 📋 Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **npm** ou **yarn** (inclus avec Node.js)
- Un compte **Supabase** (gratuit) - [Créer un compte](https://app.supabase.com)
- Un terminal/shell (Git Bash, PowerShell, Terminal)

## 🛠️ Installation et Configuration

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd RSocial
```

### 2. Installation des dépendances Frontend

```bash
# À la racine du projet
npm install
```

### 3. Installation des dépendances Backend

```bash
# Aller dans le dossier backend
cd backend
npm install
cd ..
```

### 4. Configuration Supabase

#### a. Créer un projet Supabase

1. Allez sur [Supabase](https://app.supabase.com)
2. Créez un nouveau projet
3. Notez votre :
   - **URL du projet** (ex: `https://xxxxx.supabase.co`)
   - **Anon Key** (Settings → API → anon/public key)
   - **Service Role Key** (Settings → API → service_role key)

#### b. Configurer le backend

```bash
# Dans le dossier backend
cd backend
cp env.example .env
```

Éditez le fichier `.env` :

```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

#### c. Initialiser la base de données

```bash
# Dans le dossier backend
npm run init-db
```

Le script affichera le SQL à exécuter. Copiez-le et :

1. Allez sur Supabase Dashboard → **SQL Editor**
2. Créez une nouvelle query
3. Collez le SQL généré
4. Exécutez la query

#### d. Configurer le Storage

1. Dans Supabase Dashboard → **Storage** → **Create bucket**
2. Nom : `rsocial-uploads`
3. Public : ✅ **Oui** (pour permettre l'accès public aux images)
4. Exécutez le SQL dans `backend/SUPABASE_STORAGE_SETUP.sql` (si disponible)

### 5. Configuration du Frontend

```bash
# À la racine du projet
cp env.local.example .env.local
```

Éditez `.env.local` :

```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Exécution du Projet

### Mode Développement

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

### Mode Production

**Backend :**
```bash
cd backend
npm start
```

**Frontend :**
```bash
npm run build
npm run preview
```

## 📁 Structure du Projet

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
│   │   ├── Neighbors/           # Voisins
│   │   ├── Stories/             # Stories 24h
│   │   └── Layout/              # Header, Sidebar
│   ├── contexts/                # Contextes React
│   │   ├── AuthContext.jsx      # Authentification
│   │   └── AppContext.jsx       # État global
│   ├── services/                # Services API
│   │   ├── postService.js
│   │   ├── messageService.js
│   │   ├── eventService.js
│   │   ├── groupService.js
│   │   ├── classifiedService.js
│   │   ├── storyService.js
│   │   ├── neighborService.js
│   │   ├── uploadService.js
│   │   └── socketService.js
│   ├── config/                  # Configuration
│   │   └── api.js               # Client Axios
│   ├── utils/                   # Utilitaires
│   │   ├── geolocation.js       # Calculs de distance
│   │   ├── dateUtils.js         # Formatage des dates
│   │   └── validation.js        # Validation de formulaires
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
│   │   │   ├── classifiedController.js
│   │   │   ├── storyController.js
│   │   │   └── ...
│   │   ├── routes/              # Routes API
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── messages.js
│   │   │   ├── events.js
│   │   │   ├── groups.js
│   │   │   ├── classifieds.js
│   │   │   ├── stories.js
│   │   │   ├── upload.js
│   │   │   └── users.js
│   │   ├── middleware/          # Middleware
│   │   │   ├── auth.js          # Authentification JWT
│   │   │   ├── errorHandler.js  # Gestion d'erreurs
│   │   │   └── logger.js        # Logging
│   │   ├── services/            # Services backend
│   │   │   └── socket.js        # WebSocket serveur
│   │   ├── config/              # Configuration
│   │   │   └── supabase.js      # Client Supabase
│   │   ├── utils/               # Utilitaires
│   │   │   └── geolocation.js   # Calculs géographiques
│   │   ├── scripts/             # Scripts utilitaires
│   │   │   └── initDatabase.js  # Initialisation BDD
│   │   └── server.js            # Serveur Express
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
├── LICENSE                      # Licence MIT
├── FEATURES.md                  # Liste complète des fonctionnalités
└── README.md                    # Ce fichier
```

## 🔧 Variables d'Environnement

### Backend (`.env` dans `backend/`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur backend | `3001` |
| `NODE_ENV` | Environnement | `development` ou `production` |
| `SUPABASE_URL` | URL de votre projet Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_KEY` | Clé service role Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | Secret pour signer les JWT | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | Durée de validité des tokens | `7d` |
| `CORS_ORIGIN` | Origine autorisée pour CORS | `http://localhost:5173` |
| `MAX_FILE_SIZE` | Taille max des fichiers (bytes) | `5242880` (5MB) |
| `ALLOWED_FILE_TYPES` | Types de fichiers autorisés | `image/jpeg,image/png,...` |

### Frontend (`.env.local` à la racine)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3001/api` |

## 📝 Scripts Disponibles

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

### Backend (dossier `backend/`)

```bash
# Développement avec rechargement auto
npm run dev

# Production
npm start

# Initialiser la base de données
npm run init-db
```

## 🧪 Test de l'Application

1. **Créer un compte** via l'interface d'inscription
2. **Se connecter** avec vos identifiants
3. **Explorer les fonctionnalités** :
   - Créer des posts avec images
   - Rejoindre des groupes
   - Créer des événements
   - Publier des petites annonces
   - Envoyer des messages
   - Utiliser la carte interactive
   - Créer des stories

## 🔒 Sécurité & Confidentialité

- **Authentification JWT** sécurisée avec tokens expirables
- **Mots de passe hashés** avec bcryptjs (10 rounds)
- **Base de données PostgreSQL** avec Supabase (sécurisée)
- **Row Level Security (RLS)** activé sur Supabase
- **CORS** configuré pour limiter les origines autorisées
- **Validation des entrées** côté serveur avec express-validator
- **Protection contre les injections SQL** (Supabase gère cela)
- **Signalement et blocage** d'utilisateurs
- **Modération** des contenus

## 📚 Documentation Supplémentaire

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture système détaillée
- [API_DOCS.md](./API_DOCS.md) - Documentation complète de l'API
- [DB_SCHEMA.md](./DB_SCHEMA.md) - Schéma de base de données
- [ROADMAP.md](./ROADMAP.md) - Feuille de route et évolution
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution
- [FEATURES.md](./FEATURES.md) - Liste complète des fonctionnalités

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus de détails.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

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

**Note**: Cette application est complète avec backend, base de données et toutes les fonctionnalités principales. Elle est prête pour le déploiement en production.
