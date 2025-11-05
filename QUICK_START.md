# 🚀 Guide de Démarrage Rapide - RSocial

## Installation Express

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer l'application
npm run dev

# 3. Ouvrir votre navigateur
# L'application sera disponible sur http://localhost:5173
```

## 🎯 Premiers Pas

### 1. Inscription
- Cliquez sur "S'inscrire"
- Remplissez le formulaire (vous pouvez utiliser n'importe quel email pour la démo)
- Exemple : `jean.dupont@email.com`

### 2. Exploration
Une fois connecté, vous verrez :
- **Fil d'actualités** : Publications locales (par défaut)
- **Sidebar gauche** : Navigation principale
- **Header** : Profil et notifications

### 3. Fonctionnalités à Tester

#### 📰 Créer une publication
1. Cliquez sur "Créer une publication"
2. Choisissez un type (Annonce, Événement, Aide, Perdu/Trouvé)
3. Écrivez votre message
4. (Optionnel) Ajoutez une image via URL
5. Publiez !

#### 🗺️ Explorer la Carte
1. Cliquez sur "Carte" dans le menu
2. Visualisez les posts, événements et groupes sur la carte
3. Cliquez sur les marqueurs pour voir les détails

#### 👥 Rejoindre un Groupe
1. Allez dans "Groupes"
2. Parcourez les groupes disponibles
3. Cliquez sur "Rejoindre"

#### 📅 Participer à un Événement
1. Allez dans "Événements"
2. Consultez les événements à venir
3. Cliquez sur "Participer"

#### 🏷️ Publier une Annonce
1. Allez dans "Petites annonces"
2. Cliquez sur "Créer une annonce"
3. Remplissez les détails (titre, prix, description)
4. Publiez !

#### 💬 Envoyer un Message
1. Sur une annonce, cliquez sur "Contacter"
2. Écrivez votre message
3. Le message apparaîtra dans "Messages"

#### 👤 Modifier votre Profil
1. Allez dans "Mon profil"
2. Cliquez sur "Modifier le profil"
3. Changez votre bio et votre rayon de recherche
4. Enregistrez

## 💡 Astuces

### Rayon de Recherche
- Par défaut : **3 km**
- Modifiable dans votre profil (1-5 km)
- Affecte le contenu visible dans toute l'application

### Données de Démo
L'application inclut :
- 3 utilisateurs fictifs
- 3 publications d'exemple
- 3 groupes
- 2 événements
- 3 petites annonces

### Navigation
- **Desktop** : Sidebar toujours visible
- **Mobile** : Menu burger (☰) en haut à gauche

### Interactions
- **❤️ J'aime** : Sur les publications
- **💬 Commenter** : Répondre aux posts
- **⋮ Menu** : Signaler ou supprimer (vos posts)
- **🚫 Bloquer** : Dans les messages

## 🎨 Personnalisation

### Modifier le Rayon
1. Profil → Modifier le profil
2. Sélectionnez 1-5 km
3. Enregistrez

### Types de Publications
- **📢 Annonce** : Informations générales
- **📅 Événement** : Événements futurs
- **🤝 Aide** : Demandes d'assistance
- **🔍 Perdu/Trouvé** : Objets ou animaux perdus

### Catégories d'Annonces
- **💰 Vente** : Articles à vendre
- **🎁 Don** : Articles gratuits
- **🔧 Service** : Services proposés
- **🔍 Recherche** : Articles recherchés

## 🔧 Dépannage

### L'application ne démarre pas
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port déjà utilisé
Si le port 5173 est occupé, Vite utilisera automatiquement le port suivant (5174, etc.)

### Problème avec la carte
Assurez-vous que Leaflet CSS est chargé. Les styles sont importés dans MapView.jsx.

## 📱 Test sur Mobile

### Méthode 1 : DevTools
1. F12 ou Cmd+Option+I
2. Toggle device toolbar
3. Sélectionnez un appareil mobile

### Méthode 2 : Réseau Local
1. Trouvez votre IP locale
2. Accédez à `http://[VOTRE_IP]:5173`
3. Depuis votre téléphone sur le même réseau

## 🚀 Build de Production

```bash
# Créer le build
npm run build

# Tester le build
npm run preview
```

Le build sera dans le dossier `dist/` et prêt à être déployé.

## 📚 Documentation Complète

Pour plus de détails, consultez le [README.md](README.md) principal.

## 🆘 Besoin d'Aide ?

- Vérifiez la console du navigateur (F12)
- Assurez-vous que Node.js 16+ est installé
- Vérifiez que toutes les dépendances sont installées

## ✨ Bon Développement !

Amusez-vous à explorer RSocial et n'hésitez pas à personnaliser l'application selon vos besoins ! 🎉

