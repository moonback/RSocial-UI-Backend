# 🏘️ RSocial - Réseau Social Hyper-Local

RSocial est une application de réseau social hyper-local qui connecte les personnes, les commerces et les événements dans une zone géographique restreinte (quartier/ville).

## 📋 Vue d'ensemble

RSocial permet aux résidents locaux, aux commerces et aux associations de :
- **Découvrir** les événements et services du quartier
- **Communiquer** avec les voisins via un fil d'actualités local
- **S'entraider** avec des demandes d'aide et des signalements
- **Échanger** via les petites annonces locales
- **Participer** aux événements de la communauté

## ✨ Fonctionnalités MVP

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
- Node.js 16+ 
- npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt** (ou décompresser l'archive)
```bash
cd RSocial
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application en mode développement**
```bash
npm run dev
```

4. **Ouvrir votre navigateur**
```
http://localhost:5173
```

## 📦 Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **React Context API** - Gestion d'état
- **React Leaflet** - Cartes interactives
- **date-fns** - Manipulation des dates
- **CSS Modules** - Styling

## 🏗️ Structure du projet

```
RSocial/
├── src/
│   ├── components/           # Composants React
│   │   ├── Auth/            # Connexion/Inscription
│   │   ├── Feed/            # Fil d'actualités
│   │   ├── Map/             # Carte interactive
│   │   ├── Groups/          # Groupes
│   │   ├── Events/          # Événements
│   │   ├── Classifieds/     # Petites annonces
│   │   ├── Messages/        # Messagerie
│   │   ├── Notifications/   # Notifications
│   │   ├── Profile/         # Profil utilisateur
│   │   ├── Moderation/      # Modération
│   │   └── Layout/          # Header, Sidebar
│   │
│   ├── contexts/            # Contextes React
│   │   ├── AuthContext.jsx  # Authentification
│   │   └── AppContext.jsx   # État global
│   │
│   ├── data/                # Données mockées
│   │   └── mockData.js
│   │
│   ├── utils/               # Utilitaires
│   │   ├── geolocation.js   # Calculs de distance
│   │   ├── dateUtils.js     # Formatage des dates
│   │   └── validation.js    # Validation de formulaires
│   │
│   ├── App.jsx              # Composant principal
│   ├── App.css              # Styles globaux
│   └── main.jsx             # Point d'entrée
│
├── public/                  # Fichiers publics
├── index.html              # HTML de base
├── package.json            # Dépendances
├── vite.config.js          # Configuration Vite
└── README.md               # Ce fichier
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

- Données stockées localement (localStorage)
- Pas de backend réel dans cette démo
- Signalement et blocage d'utilisateurs
- Modération manuelle des contenus

## 🧪 Données de test

L'application inclut des données mockées pour la démonstration :
- 3 utilisateurs fictifs
- 3 posts d'exemple
- 3 groupes
- 2 événements
- 3 petites annonces

Vous pouvez vous connecter avec n'importe quel email pour tester.

## 🚧 Améliorations futures

- [ ] Backend réel avec API REST
- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Authentification JWT
- [ ] Upload d'images réel
- [ ] Notifications push réelles
- [ ] Chat en temps réel (WebSocket)
- [ ] Application mobile (React Native)
- [ ] Système de réputation
- [ ] Badges et récompenses
- [ ] Intégration avec Google Maps
- [ ] Mode sombre
- [ ] Multilingue (i18n)
- [ ] Tests unitaires et E2E
- [ ] PWA (Progressive Web App)

## 📝 Scripts disponibles

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

## 🤝 Contribution

Ce projet est une démo MVP. Pour contribuer :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ pour connecter les communautés locales.

## 🙏 Remerciements

- React.js team
- Leaflet & React-Leaflet
- Unsplash pour les images de démo
- UI Avatars pour les avatars générés

---

**Note**: Cette application est une démo MVP avec des données mockées. Pour une utilisation en production, il faudrait implémenter un backend sécurisé, une vraie base de données et des fonctionnalités de sécurité avancées.

