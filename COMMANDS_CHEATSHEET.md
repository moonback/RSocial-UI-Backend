# 🚀 Aide-mémoire des Commandes - RSocial

Guide rapide des commandes les plus utilisées

---

## 🎬 Démarrage rapide

### Tout démarrer (2 terminaux)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

**URLs :**
- Frontend : http://localhost:5173
- Backend : http://localhost:3001

---

## 📦 Installation

### Première installation

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### Installer une nouvelle dépendance

```bash
# Frontend
npm install nom-du-package

# Backend
cd backend
npm install nom-du-package
cd ..
```

### Réinstaller tout

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

## 🔧 Développement

### Lancer le frontend

```bash
npm run dev
```

**Raccourcis :**
- `o` + Enter : Ouvrir dans le navigateur
- `r` + Enter : Redémarrer le serveur
- `q` + Enter : Quitter

### Lancer le backend

```bash
cd backend
npm run dev
```

**Logs affichés :**
```
✅ Serveur démarré sur le port 3001
📡 WebSocket prêt
🌍 CORS activé
```

### Lancer les deux en même temps (Windows)

Créer `start.bat` :
```batch
start cmd /k "cd backend && npm run dev"
start cmd /k "npm run dev"
```

Exécuter :
```bash
.\start.bat
```

---

## 🏗️ Build & Production

### Build frontend

```bash
npm run build
```

Sortie : `dist/`

### Prévisualiser le build

```bash
npm run preview
```

### Lancer backend en prod

```bash
cd backend
npm start
```

---

## 🗄️ Base de données

### Initialiser la DB

```bash
cd backend
npm run init-db
```

Copier le SQL et l'exécuter dans Supabase SQL Editor.

### Réinitialiser la DB

1. Aller sur Supabase Dashboard
2. SQL Editor → Nouvelle query
3. Copier le SQL de `backend/src/scripts/initDatabase.js`
4. Exécuter

---

## 🧹 Nettoyage

### Nettoyer les builds

```bash
# Frontend
rm -rf dist

# Backend
rm -rf backend/dist
```

### Nettoyer les node_modules

```bash
# Frontend
rm -rf node_modules

# Backend
rm -rf backend/node_modules
```

### Nettoyer le cache

```bash
# Frontend
rm -rf .vite
npm cache clean --force

# Backend
cd backend
npm cache clean --force
cd ..
```

---

## 🐛 Debugging

### Logs backend

```bash
cd backend
npm run dev
```

Les logs affichent :
- ✅ Requêtes API
- ✅ WebSocket events
- ✅ Erreurs

### Console frontend

Ouvrir dans le navigateur :
- **F12** ou **Ctrl+Shift+I**
- Onglet **Console**

### Vérifier les erreurs

```bash
# Frontend
npm run lint

# Backend (si configuré)
cd backend
npm run lint
```

---

## 📊 Tests

### Tester l'API backend

```bash
# Vérifier le serveur
curl http://localhost:3001

# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+33612345678",
    "name": "Test User",
    "password": "test123",
    "location": {"lat": 48.8566, "lng": 2.3522, "address": "Paris"}
  }'

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## 🔐 Configuration

### Créer .env frontend

```bash
# Créer le fichier
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

### Créer .env backend

```bash
cd backend

# Copier l'example
cp env.example .env

# Éditer
notepad .env  # Windows
nano .env     # Linux/Mac
```

### Variables essentielles

**Frontend (.env) :**
```env
VITE_API_URL=http://localhost:3001/api
```

**Backend (backend/.env) :**
```env
PORT=3001
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:5173
```

---

## 📝 Git

### Commandes de base

```bash
# Statut
git status

# Ajouter les changements
git add .

# Commit
git commit -m "Description des changements"

# Push
git push origin main

# Pull
git pull origin main
```

### Branches

```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Changer de branche
git checkout main

# Fusionner une branche
git merge feature/nouvelle-fonctionnalite

# Supprimer une branche
git branch -d feature/nouvelle-fonctionnalite
```

---

## 🔄 Mise à jour des dépendances

### Vérifier les mises à jour

```bash
# Frontend
npm outdated

# Backend
cd backend
npm outdated
```

### Mettre à jour

```bash
# Frontend
npm update

# Backend
cd backend
npm update
```

### Mettre à jour une dépendance spécifique

```bash
# Frontend
npm install package-name@latest

# Backend
cd backend
npm install package-name@latest
```

---

## 🌐 Réseau

### Trouver le port occupé

**Windows :**
```bash
# Trouver le processus
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Tuer le processus
taskkill /PID <PID> /F
```

**Linux/Mac :**
```bash
# Trouver le processus
lsof -ti:3001
lsof -ti:5173

# Tuer le processus
kill -9 $(lsof -ti:3001)
kill -9 $(lsof -ti:5173)
```

### Accès réseau local

```bash
# Trouver votre IP locale
ipconfig  # Windows
ifconfig  # Linux/Mac

# Démarrer avec accès réseau
npm run dev -- --host
```

Accéder depuis un autre appareil :
```
http://votre-ip:5173
```

---

## 📱 Mobile

### Tester sur mobile

1. Démarrer avec `--host`
2. Trouver l'IP locale
3. Ouvrir sur mobile : `http://votre-ip:5173`

### Simuler mobile (DevTools)

1. Ouvrir DevTools (F12)
2. Cliquer sur l'icône mobile
3. Choisir un appareil

---

## 🔍 Recherche

### Trouver dans le code

**Windows :**
```bash
findstr /s /i "texte" *.js
findstr /s /i "texte" *.jsx
```

**Linux/Mac :**
```bash
grep -r "texte" src/
```

---

## 📊 Monitoring

### Logs temps réel

**Backend :**
```bash
cd backend
npm run dev | tee logs.txt
```

**Frontend :**
Les logs sont dans la console navigateur (F12)

### Statistiques du projet

```bash
# Nombre de lignes de code
find src -name "*.js" -o -name "*.jsx" | xargs wc -l

# Nombre de fichiers
find src -type f | wc -l

# Taille du projet
du -sh .
```

---

## 🚀 Déploiement

### Préparer pour la production

```bash
# 1. Build frontend
npm run build

# 2. Tester le build
npm run preview

# 3. Vérifier backend/.env
cd backend
cat .env  # Vérifier les variables
```

### Déployer sur Vercel (Frontend)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Déployer sur Railway (Backend)

1. Push sur GitHub
2. Connecter Railway
3. Configurer les variables d'environnement
4. Déployer

---

## 🛠️ Utilitaires

### Générer un secret JWT

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Formater le code

```bash
# Si Prettier est installé
npx prettier --write "src/**/*.{js,jsx}"
```

### Analyser le bundle

```bash
npm run build -- --analyze
```

---

## 📚 Documentation

### Générer la doc

```bash
# Si JSDoc est configuré
npx jsdoc src -r -d docs
```

### Lire la doc locale

```bash
# Ouvrir README
start README.md  # Windows
open README.md   # Mac
xdg-open README.md  # Linux
```

---

## ⚡ Raccourcis utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le dev server |
| `npm run build` | Build de production |
| `npm install` | Installer les dépendances |
| `npm update` | Mettre à jour les packages |
| `npm outdated` | Vérifier les mises à jour |
| `npm cache clean --force` | Nettoyer le cache |

---

## 🎯 Workflows courants

### Ajouter une nouvelle feature

```bash
1. git checkout -b feature/ma-feature
2. # Développer
3. npm run build  # Vérifier que ça build
4. git add .
5. git commit -m "Add: nouvelle feature"
6. git push origin feature/ma-feature
```

### Corriger un bug

```bash
1. git checkout -b fix/nom-du-bug
2. # Corriger
3. git add .
4. git commit -m "Fix: description du bug"
5. git push origin fix/nom-du-bug
```

### Mettre à jour depuis main

```bash
git checkout main
git pull origin main
git checkout votre-branche
git merge main
```

---

## 🆘 En cas de problème

### Le serveur ne démarre pas

```bash
1. Vérifier les variables .env
2. rm -rf node_modules && npm install
3. Vérifier le port n'est pas occupé
4. Redémarrer le terminal
```

### Les changements ne s'affichent pas

```bash
1. Ctrl+Shift+R (hard reload)
2. Vider le cache navigateur
3. Redémarrer le dev server
4. rm -rf .vite
```

### Erreur de dépendances

```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Gardez ce fichier à portée de main ! 📌**

---

**Version** : 1.0.0  
**Date** : Novembre 2025  

