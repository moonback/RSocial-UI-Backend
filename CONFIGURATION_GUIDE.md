# ⚙️ Guide de Configuration - RSocial

Guide complet pour configurer et démarrer RSocial (Frontend + Backend)

---

## 📋 Prérequis

- **Node.js 18+** installé
- **npm** (inclus avec Node.js)
- Compte **Supabase** (gratuit)

---

## 🗄️ Étape 1 : Configurer Supabase

### 1.1 Créer un projet

1. Aller sur https://app.supabase.com
2. Cliquer sur "New Project"
3. Choisir un nom, mot de passe et région
4. Attendre la création (~2 minutes)

### 1.2 Initialiser la base de données

1. Aller dans "SQL Editor"
2. Cliquer sur "New query"
3. Copier le SQL depuis `backend/src/scripts/initDatabase.js`
4. Exécuter la query
5. Vérifier les tables dans "Database" → "Tables"

### 1.3 Créer le bucket de storage

1. Aller dans "Storage"
2. Cliquer sur "Create a new bucket"
3. Nom : `rsocial-uploads`
4. Cocher "Public bucket" ✅
5. Créer

### 1.4 Récupérer les clés API

1. Aller dans "Settings" → "API"
2. Noter :
   - **Project URL** (ex: https://xyz.supabase.co)
   - **anon public** key
   - **service_role** key (⚠️ gardez-la secrète !)

---

## 🔧 Étape 2 : Configurer le Backend

### 2.1 Installer les dépendances

```bash
cd backend
npm install
```

### 2.2 Configurer l'environnement

Créer le fichier `backend/.env` :

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT
JWT_SECRET=changez_ceci_en_production_avec_une_cle_super_secrete
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

**⚠️ Important :**
- Remplacez `your-project.supabase.co` par votre URL Supabase
- Remplacez `your_anon_key` par votre clé anon
- Remplacez `your_service_role_key` par votre clé service
- Changez `JWT_SECRET` en production !

### 2.3 Tester le backend

```bash
npm run dev
```

Vous devriez voir :
```
✅ Serveur démarré sur le port 3001
📡 WebSocket prêt pour le chat temps réel
🌍 CORS activé pour http://localhost:5173
```

Tester l'API :
```bash
curl http://localhost:3001
# Devrait retourner : {"message":"🏘️ RSocial API","version":"1.0.0","status":"running"}
```

---

## 🎨 Étape 3 : Configurer le Frontend

### 3.1 Retour à la racine

```bash
cd ..  # Depuis backend/
```

### 3.2 Installer les dépendances

```bash
npm install
```

### 3.3 Configurer l'environnement

Créer le fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:3001/api
```

**Pour la production :**
```env
VITE_API_URL=https://your-backend-url.com/api
```

### 3.4 Démarrer le frontend

```bash
npm run dev
```

L'application sera disponible sur : **http://localhost:5173**

---

## ✅ Étape 4 : Vérifier que tout fonctionne

### 4.1 Test d'inscription

1. Ouvrir http://localhost:5173
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire :
   ```
   Nom : Test User
   Email : test@example.com
   Téléphone : +33612345678
   Mot de passe : test123
   Adresse : Paris, France
   ```
4. Cliquer sur "S'inscrire"

### 4.2 Vérifier dans Supabase

1. Aller sur Supabase Dashboard
2. "Table Editor" → "users"
3. Vous devriez voir l'utilisateur créé ✅

### 4.3 Vérifier le WebSocket

Ouvrir la console navigateur (F12) :
```
✅ WebSocket connecté
```

### 4.4 Test de connexion

1. Se déconnecter
2. Se reconnecter avec :
   - Email : test@example.com
   - Mot de passe : test123
3. Vous devriez être connecté ✅

---

## 📁 Structure des fichiers .env

```
RSocial/
├── .env                    # Frontend (ne pas commiter !)
│   └── VITE_API_URL=...
│
└── backend/
    └── .env                # Backend (ne pas commiter !)
        ├── PORT=...
        ├── SUPABASE_URL=...
        ├── JWT_SECRET=...
        └── ...
```

---

## 🚀 Commandes utiles

### Démarrer tout en développement

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

### Build de production

**Frontend :**
```bash
npm run build
npm run preview  # Tester le build
```

**Backend :**
```bash
cd backend
npm start  # Mode production
```

---

## 🐛 Résolution de problèmes

### Backend ne démarre pas

**Erreur : "Variables d'environnement Supabase manquantes"**
- ✅ Vérifier que `backend/.env` existe
- ✅ Vérifier que toutes les variables sont renseignées
- ✅ Vérifier qu'il n'y a pas d'espaces autour du `=`

**Erreur : Port 3001 déjà utilisé**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

### Frontend ne se connecte pas

**Erreur : "Network Error"**
- ✅ Vérifier que le backend est lancé
- ✅ Vérifier `.env` contient `VITE_API_URL`
- ✅ Redémarrer le frontend

**Erreur CORS**
- ✅ Vérifier `backend/.env` : `CORS_ORIGIN=http://localhost:5173`
- ✅ Redémarrer le backend

### WebSocket ne se connecte pas

**Dans la console : "Connection refused"**
- ✅ Vérifier que le backend est lancé
- ✅ Vérifier que Socket.io est bien configuré
- ✅ Se déconnecter et se reconnecter

---

## 🔐 Sécurité

### ⚠️ Ne JAMAIS commiter

- ❌ `.env`
- ❌ `backend/.env`
- ❌ `JWT_SECRET`
- ❌ `SUPABASE_SERVICE_KEY`

### ✅ À commiter

- ✅ `env.local.example`
- ✅ `backend/env.example`
- ✅ `.gitignore` (pour ignorer .env)

---

## 📚 Variables d'environnement détaillées

### Frontend (.env)

| Variable | Description | Exemple |
|----------|-------------|---------|
| VITE_API_URL | URL de l'API backend | http://localhost:3001/api |

### Backend (backend/.env)

| Variable | Description | Défaut | Requis |
|----------|-------------|--------|--------|
| PORT | Port du serveur | 3001 | Non |
| NODE_ENV | Environnement | development | Non |
| SUPABASE_URL | URL Supabase | - | ✅ Oui |
| SUPABASE_ANON_KEY | Clé anonyme | - | ✅ Oui |
| SUPABASE_SERVICE_KEY | Clé service | - | ✅ Oui |
| JWT_SECRET | Secret JWT | - | ✅ Oui |
| JWT_EXPIRES_IN | Durée validité token | 7d | Non |
| CORS_ORIGIN | Origine CORS | http://localhost:5173 | Non |
| MAX_FILE_SIZE | Taille max fichier | 5242880 | Non |
| ALLOWED_FILE_TYPES | Types fichiers | image/jpeg,... | Non |

---

## 🎯 Checklist de configuration

### Backend
- [ ] Node.js 18+ installé
- [ ] Projet Supabase créé
- [ ] Base de données initialisée
- [ ] Bucket storage créé
- [ ] `backend/.env` créé et configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Backend démarre sans erreur
- [ ] Test API fonctionne (curl)

### Frontend
- [ ] `.env` créé à la racine
- [ ] `VITE_API_URL` configuré
- [ ] Dépendances installées
- [ ] Frontend démarre sans erreur
- [ ] Peut créer un compte
- [ ] Peut se connecter
- [ ] WebSocket connecté

---

## 🎉 Tout est prêt !

Si vous avez suivi toutes les étapes, vous devriez avoir :

✅ Backend qui tourne sur http://localhost:3001  
✅ Frontend qui tourne sur http://localhost:5173  
✅ Base de données Supabase configurée  
✅ Authentification fonctionnelle  
✅ WebSocket temps réel opérationnel  

**Vous pouvez maintenant développer les fonctionnalités restantes ! 🚀**

---

## 📞 Support

En cas de problème :
1. Vérifier les logs backend
2. Vérifier la console navigateur (F12)
3. Consulter FRONTEND_BACKEND_INTEGRATION.md
4. Consulter backend/README.md

---

**Bon développement ! 🎨**

