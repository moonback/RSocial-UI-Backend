# 🏗️ Architecture - RSocial

Ce document décrit l'architecture complète du système RSocial, incluant le frontend, le backend et la base de données.

## 📊 Vue d'Ensemble

RSocial suit une architecture **client-serveur** avec une séparation claire entre le frontend (React) et le backend (Node.js/Express), communiquant via une API REST et WebSocket (Socket.io).

```
┌─────────────────┐
│   Frontend       │
│   (React/Vite)   │
│   Port: 5173     │
└────────┬─────────┘
         │
         │ HTTP REST API
         │ WebSocket (Socket.io)
         │
┌────────▼─────────┐
│   Backend        │
│   (Express)      │
│   Port: 3001     │
└────────┬─────────┘
         │
         │ Supabase Client
         │
┌────────▼─────────┐
│   Supabase       │
│   - PostgreSQL   │
│   - PostGIS      │
│   - Storage      │
└──────────────────┘
```

## 🎨 Frontend (React)

### Structure

Le frontend est organisé en **composants réutilisables**, **contextes**, **services** et **utilitaires**.

```
src/
├── components/          # Composants UI réutilisables
│   ├── Auth/           # Authentification (Login, Register)
│   ├── Feed/           # Fil d'actualités
│   ├── Map/            # Carte interactive (Leaflet)
│   ├── Groups/         # Groupes et communautés
│   ├── Events/         # Événements locaux
│   ├── Classifieds/    # Petites annonces
│   ├── Messages/       # Messagerie privée
│   ├── Notifications/  # Notifications
│   ├── Profile/        # Profil utilisateur
│   ├── Moderation/     # Modération
│   ├── Neighbors/      # Voisins
│   ├── Stories/        # Stories 24h
│   └── Layout/          # Header, Sidebar
│
├── contexts/           # Contextes React (état global)
│   ├── AuthContext.jsx # Authentification et session
│   └── AppContext.jsx  # Données globales (posts, events, etc.)
│
├── services/           # Services API (couche d'abstraction)
│   ├── postService.js
│   ├── messageService.js
│   ├── eventService.js
│   ├── groupService.js
│   ├── classifiedService.js
│   ├── storyService.js
│   ├── neighborService.js
│   ├── uploadService.js
│   └── socketService.js
│
├── config/             # Configuration
│   └── api.js          # Client Axios configuré
│
└── utils/              # Utilitaires
    ├── geolocation.js  # Calculs de distance (Haversine)
    ├── dateUtils.js    # Formatage des dates (date-fns)
    └── validation.js   # Validation de formulaires
```

### Patterns Architecturaux

#### 1. **Context API** pour l'état global
- `AuthContext` : Gestion de l'authentification et de la session
- `AppContext` : Données globales (posts, events, groupes, etc.)

#### 2. **Services** pour l'abstraction API
Chaque service encapsule les appels API pour une ressource spécifique :
- Centralise la logique API
- Facilite la maintenance
- Permet le mock pour les tests

#### 3. **Composants fonctionnels** avec hooks
- Utilisation de `useState`, `useEffect`, `useMemo`, `useCallback`
- Pas de classes, uniquement des composants fonctionnels

#### 4. **Routing** avec React Router
- Navigation SPA sans rechargement de page
- Routes protégées via `AuthContext`

### Flux de Données

```
User Action
    ↓
Component (UI)
    ↓
Service (API call)
    ↓
Axios Client
    ↓
Backend API
    ↓
Response
    ↓
Context Update
    ↓
Component Re-render
```

### Gestion d'État

- **État local** : `useState` pour les formulaires et états UI
- **État global** : `Context API` pour l'authentification et les données partagées
- **Pas de Redux** : Le Context API suffit pour cette application

### Communication Temps Réel

- **Socket.io Client** pour la messagerie en temps réel
- Connexion automatique au serveur WebSocket
- Écoute des événements (`new_message`, `notification`, etc.)

## 🔧 Backend (Node.js/Express)

### Structure

Le backend suit une architecture **MVC** (Model-View-Controller) avec des routes, contrôleurs, middleware et services.

```
backend/src/
├── server.js            # Point d'entrée (Express + Socket.io)
│
├── routes/              # Définition des routes API
│   ├── auth.js
│   ├── posts.js
│   ├── messages.js
│   ├── events.js
│   ├── groups.js
│   ├── classifieds.js
│   ├── stories.js
│   ├── upload.js
│   └── users.js
│
├── controllers/         # Logique métier
│   ├── authController.js
│   ├── postController.js
│   ├── eventController.js
│   ├── groupController.js
│   ├── classifiedController.js
│   ├── storyController.js
│   └── ...
│
├── middleware/          # Middleware Express
│   ├── auth.js         # Authentification JWT
│   ├── errorHandler.js # Gestion centralisée des erreurs
│   └── logger.js       # Logging des requêtes
│
├── services/           # Services backend
│   └── socket.js       # WebSocket serveur (Socket.io)
│
├── config/             # Configuration
│   └── supabase.js     # Client Supabase (anon + admin)
│
├── utils/               # Utilitaires
│   └── geolocation.js   # Calculs géographiques
│
└── scripts/            # Scripts utilitaires
    └── initDatabase.js  # Initialisation de la base de données
```

### Flux de Requête

```
HTTP Request
    ↓
Express Middleware (CORS, JSON parser, logger)
    ↓
Route Handler
    ↓
Middleware (auth, validation)
    ↓
Controller (logique métier)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
Response JSON
```

### Authentification JWT

1. **Inscription/Connexion** → Génération d'un JWT
2. **Requêtes protégées** → Vérification du JWT via middleware `authenticate`
3. **Token expirable** → Durée de validité configurable (7 jours par défaut)

### WebSocket (Socket.io)

- **Serveur** : `src/services/socket.js`
- **Événements** :
  - `connection` : Nouvelle connexion client
  - `disconnect` : Déconnexion client
  - `join_room` : Rejoindre une salle (user_xxx)
  - `new_message` : Nouveau message
  - `notification` : Nouvelle notification

### Gestion d'Erreurs

- **Middleware centralisé** : `errorHandler.js`
- **Format standardisé** : `{ error: "message", status: 500 }`
- **Logging** : Toutes les erreurs sont loggées

## 🗄️ Base de Données (Supabase/PostgreSQL)

### Architecture

Supabase fournit :
- **PostgreSQL** : Base de données relationnelle
- **PostGIS** : Extension pour les données géographiques
- **Storage** : Stockage des fichiers (images, vidéos)
- **Row Level Security (RLS)** : Sécurité au niveau des lignes

### Schéma Principal

#### Tables Principales

1. **users** : Utilisateurs
2. **posts** : Publications
3. **post_likes** / **post_dislikes** : Likes/dislikes
4. **comments** : Commentaires
5. **groups** : Groupes
6. **group_members** : Membres des groupes
7. **events** : Événements
8. **event_attendees** : Participants aux événements
9. **classifieds** : Petites annonces
10. **messages** : Messages privés
11. **stories** : Stories 24h
12. **story_views** : Vues des stories
13. **reports** : Signalements
14. **blocked_users** : Utilisateurs bloqués
15. **user_follows** : Suivi d'utilisateurs

### Relations

```
users
  ├── posts (1:N)
  ├── comments (1:N)
  ├── messages (1:N, sender/receiver)
  ├── stories (1:N)
  ├── groups (1:N, created_by)
  ├── events (1:N, created_by)
  ├── classifieds (1:N)
  └── user_follows (1:N, follower/following)

posts
  ├── post_likes (1:N)
  ├── post_dislikes (1:N)
  └── comments (1:N)

groups
  └── group_members (1:N)

events
  └── event_attendees (1:N)

stories
  └── story_views (1:N)
```

### Données Géographiques

- **PostGIS** : Extension PostgreSQL pour les données géographiques
- **Location JSONB** : Format `{ lat: number, lng: number, address: string }`
- **Calculs de distance** : Fonction PostGIS ou Haversine côté serveur

### Index

- Index sur `user_id`, `post_id`, `created_at` pour optimiser les requêtes
- Index sur les clés étrangères pour améliorer les JOINs

Voir [DB_SCHEMA.md](./DB_SCHEMA.md) pour plus de détails.

## 🔄 Flux de Communication

### REST API

```
Frontend (Axios)
    ↓
POST /api/auth/login
    ↓
Backend (Express)
    ↓
authController.login()
    ↓
Supabase (PostgreSQL)
    ↓
JWT Token
    ↓
Response JSON
```

### WebSocket

```
Frontend (Socket.io Client)
    ↓
socket.emit('join_room', 'user_123')
    ↓
Backend (Socket.io Server)
    ↓
socket.on('join_room')
    ↓
io.to('user_123').emit('new_message', data)
    ↓
Frontend reçoit en temps réel
```

## 📦 Stockage (Supabase Storage)

### Bucket : `rsocial-uploads`

- **Images** : `/images/{uuid}.{ext}`
- **Vidéos** : `/videos/{uuid}.{ext}`

### Upload Flow

```
Frontend (FormData)
    ↓
POST /api/upload/image
    ↓
Backend (Multer)
    ↓
Supabase Storage
    ↓
Public URL
    ↓
Response JSON { url: "..." }
```

## 🔒 Sécurité

### Frontend

- **Validation** : Validation des formulaires avant envoi
- **Sanitization** : Échappement du HTML
- **Tokens** : Stockage JWT dans localStorage (à sécuriser en production)

### Backend

- **JWT** : Authentification sécurisée
- **bcryptjs** : Hashage des mots de passe (10 rounds)
- **express-validator** : Validation des entrées
- **CORS** : Origines autorisées uniquement
- **Rate Limiting** : À implémenter en production

### Base de Données

- **Row Level Security (RLS)** : Politiques de sécurité Supabase
- **Service Role Key** : Utilisé uniquement côté serveur
- **Anon Key** : Utilisé côté client (limité)

## 🚀 Déploiement

### Frontend

- **Build** : `npm run build` génère un dossier `dist/`
- **Serveur statique** : Nginx, Vercel, Netlify, etc.
- **Variables d'environnement** : `VITE_API_URL` pour l'API

### Backend

- **Process Manager** : PM2, systemd, etc.
- **Variables d'environnement** : `.env` avec toutes les clés
- **Port** : Configurable via `PORT` (3001 par défaut)

### Base de Données

- **Supabase** : Géré par Supabase (hébergement cloud)
- **Migrations** : Via SQL Editor dans Supabase Dashboard

## 📈 Performance

### Optimisations

- **Index** : Index sur les colonnes fréquemment utilisées
- **Pagination** : À implémenter pour les grandes listes
- **Caching** : À implémenter (Redis) pour les données fréquentes
- **CDN** : Pour les assets statiques et images

### Monitoring

- **Logs** : Logging des requêtes et erreurs
- **Métriques** : À implémenter (Prometheus, Grafana)
- **APM** : À implémenter (Sentry, New Relic)

## 🔄 Évolutions Futures

- **Microservices** : Séparation en services (auth, posts, messages, etc.)
- **Queue System** : Pour les tâches asynchrones (Redis, Bull)
- **Cache Layer** : Redis pour les données fréquentes
- **Search Engine** : Elasticsearch pour la recherche avancée
- **CDN** : Pour les assets et images
- **Real-time Analytics** : Suivi des événements en temps réel

---

Pour plus de détails sur l'API, voir [API_DOCS.md](./API_DOCS.md).

Pour plus de détails sur la base de données, voir [DB_SCHEMA.md](./DB_SCHEMA.md).

