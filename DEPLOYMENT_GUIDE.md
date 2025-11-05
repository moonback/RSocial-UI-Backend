# 🚀 Guide de Déploiement RSocial

Guide complet pour déployer RSocial (Frontend + Backend) en production

---

## 📋 Prérequis

- Compte [Supabase](https://supabase.com/) (gratuit)
- Compte [Vercel](https://vercel.com/) ou [Netlify](https://netlify.com/) pour le frontend (gratuit)
- Compte [Railway](https://railway.app/) ou [Render](https://render.com/) pour le backend (gratuit)

---

## 🗄️ Étape 1 : Configurer Supabase

### 1.1 Créer un projet

1. Allez sur https://app.supabase.com
2. Cliquez sur "New Project"
3. Choisissez un nom, mot de passe et région
4. Attendez que le projet soit créé (~2 minutes)

### 1.2 Initialiser la base de données

1. Allez dans "SQL Editor"
2. Cliquez sur "New query"
3. Copiez-collez le contenu du fichier `backend/src/scripts/initDatabase.js` (le SQL à l'intérieur)
4. Cliquez sur "Run"
5. Vérifiez que toutes les tables sont créées (onglet "Database")

### 1.3 Créer le bucket de storage

1. Allez dans "Storage"
2. Cliquez sur "Create a new bucket"
3. Nom : `rsocial-uploads`
4. Cochez "Public bucket"
5. Cliquez sur "Create bucket"

### 1.4 Récupérer les clés API

1. Allez dans "Settings" → "API"
2. Notez :
   - Project URL
   - anon public key
   - service_role key (gardez-la secrète !)

---

## 🔧 Étape 2 : Déployer le Backend

### Option A : Railway (recommandé)

#### 2.1 Préparer le backend

```bash
cd backend
# Créer un fichier .env avec vos vraies clés
```

#### 2.2 Déployer sur Railway

1. Allez sur https://railway.app
2. Connectez votre compte GitHub
3. Cliquez sur "New Project" → "Deploy from GitHub repo"
4. Sélectionnez votre repo
5. Railway détecte automatiquement Node.js
6. Configurez les variables d'environnement :

```
PORT=3001
NODE_ENV=production

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

JWT_SECRET=your_super_secret_production_key_change_this
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://your-frontend-domain.vercel.app

MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

7. Dans "Settings" → "Networking", copiez l'URL publique (ex: `rsocial-backend.up.railway.app`)

#### 2.3 Tester le backend

```bash
curl https://your-backend-url.railway.app/
# Devrait retourner : {"message":"🏘️ RSocial API","version":"1.0.0","status":"running"}
```

### Option B : Render

1. Allez sur https://render.com
2. Créez un "Web Service"
3. Connectez votre repo GitHub
4. Build Command: `cd backend && npm install`
5. Start Command: `cd backend && npm start`
6. Ajoutez les mêmes variables d'environnement

### Option C : Heroku

```bash
cd backend
heroku create rsocial-backend
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...
# ... autres variables
git push heroku main
```

---

## 🎨 Étape 3 : Déployer le Frontend

### Option A : Vercel (recommandé)

#### 3.1 Préparer le frontend

Créez un fichier `.env.production` à la racine :

```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

#### 3.2 Déployer sur Vercel

**Via Dashboard:**

1. Allez sur https://vercel.com
2. Cliquez sur "Add New" → "Project"
3. Importez votre repo GitHub
4. Framework Preset : Vite
5. Root Directory : `./` (racine)
6. Build Command : `npm run build`
7. Output Directory : `dist`
8. Ajoutez la variable d'environnement :
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app/api`
9. Cliquez sur "Deploy"

**Via CLI:**

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### 3.3 Mettre à jour CORS

Retournez dans Railway/Render et mettez à jour :

```
CORS_ORIGIN=https://your-frontend.vercel.app
```

Redéployez le backend.

### Option B : Netlify

1. Allez sur https://netlify.com
2. Drag & drop votre dossier ou connectez GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Ajoutez la variable d'environnement `VITE_API_URL`

---

## ✅ Étape 4 : Vérification

### 4.1 Tester le backend

```bash
# Test API
curl https://your-backend.railway.app/

# Test inscription
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+33612345678",
    "name": "Test User",
    "password": "password123",
    "location": {"lat": 48.8566, "lng": 2.3522, "address": "Paris"}
  }'
```

### 4.2 Tester le frontend

1. Ouvrez `https://your-frontend.vercel.app`
2. Créez un compte
3. Vérifiez que l'utilisateur apparaît dans Supabase
4. Testez de créer un post
5. Ouvrez 2 onglets et testez le chat

### 4.3 Checklist finale

- [ ] Backend accessible et retourne `{"status":"running"}`
- [ ] Frontend s'affiche correctement
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Les posts se créent et apparaissent
- [ ] Les images s'uploadent
- [ ] Le chat temps réel fonctionne
- [ ] Pas d'erreurs CORS dans la console

---

## 🔧 Configuration Avancée

### Domaine personnalisé

#### Frontend (Vercel)

1. Allez dans "Settings" → "Domains"
2. Ajoutez votre domaine (ex: `rsocial.com`)
3. Suivez les instructions DNS

#### Backend (Railway)

1. Allez dans "Settings" → "Networking"
2. Cliquez sur "Custom Domain"
3. Ajoutez `api.rsocial.com`
4. Configurez le CNAME chez votre registrar

### HTTPS

- Vercel et Railway configurent automatiquement HTTPS ✅
- Aucune action requise !

### Performance

#### Frontend

Ajoutez dans `vite.config.js` :

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet', 'react-leaflet']
        }
      }
    }
  }
});
```

#### Backend

Ajoutez compression :

```bash
cd backend
npm install compression
```

Dans `server.js` :

```javascript
import compression from 'compression';
app.use(compression());
```

---

## 📊 Monitoring

### Supabase

- Dashboard → Logs : Voir les requêtes SQL
- Dashboard → Database : Voir les données en temps réel
- Dashboard → Storage : Voir les fichiers uploadés

### Backend

#### Railway

- Onglet "Metrics" : CPU, RAM, Requêtes
- Onglet "Logs" : Logs en temps réel

#### Render

- Onglet "Metrics" : Performance
- Onglet "Logs" : Logs serveur

### Frontend

#### Vercel

- Onglet "Analytics" : Visiteurs, performance
- Onglet "Speed Insights" : Vitesse de chargement

---

## 🐛 Troubleshooting

### Erreur CORS

**Symptôme :** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution :**
1. Vérifiez que `CORS_ORIGIN` dans le backend correspond exactement à l'URL frontend
2. Redéployez le backend
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Images ne s'affichent pas

**Symptôme :** Les images uploadées ne se chargent pas

**Solution :**
1. Vérifiez que le bucket `rsocial-uploads` est public
2. Dans Supabase Storage → Bucket settings → Make public
3. Réuploadez une image de test

### WebSocket ne se connecte pas

**Symptôme :** Chat ne fonctionne pas en temps réel

**Solution :**
1. Vérifiez que Socket.io utilise la bonne URL (sans `/api`)
2. Dans `socketService.js`, ajustez :

```javascript
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
```

### Base de données vide

**Symptôme :** Pas de tables dans Supabase

**Solution :**
1. Allez dans Supabase → SQL Editor
2. Réexécutez le script SQL complet
3. Vérifiez dans "Database" → "Tables" que tout est créé

### Backend crashe

**Symptôme :** "Application error" sur Railway/Render

**Solution :**
1. Vérifiez les logs
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `SUPABASE_SERVICE_KEY` est correct

---

## 🔒 Sécurité en Production

### Variables sensibles

❌ Ne commitez JAMAIS :
- `.env`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`

✅ Utilisez :
- Variables d'environnement sur Vercel/Railway
- Clés différentes pour dev et prod

### Rate limiting

Ajoutez dans le backend :

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requêtes max
});

app.use('/api/', limiter);
```

### Helmet.js

```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

## 📈 Coûts

### Gratuit (Tier Free)

- **Supabase** : 500 MB stockage, 2 GB transfert/mois
- **Vercel** : 100 GB bande passante/mois
- **Railway** : $5 de crédit gratuit/mois
- **Render** : 750h gratuites/mois

### À anticiper

Si vous dépassez les limites gratuites :

- **Supabase Pro** : $25/mois (500 GB transfert)
- **Vercel Pro** : $20/mois (1 TB bande passante)
- **Railway** : $0.000231/GB-hour (~$5/mois)

---

## 🎉 C'est Déployé !

Votre application RSocial est maintenant **en ligne** et accessible au monde entier !

### URLs finales

- 🌐 **Frontend** : https://your-app.vercel.app
- 🔌 **Backend** : https://your-api.railway.app
- 🗄️ **Database** : Supabase Dashboard

### Partagez !

- Partagez l'URL avec des testeurs
- Collectez les retours
- Itérez et améliorez !

---

**Bon déploiement ! 🚀**

