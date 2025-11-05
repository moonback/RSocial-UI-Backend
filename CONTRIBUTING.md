# 🤝 Guide de Contribution - RSocial

Merci de votre intérêt pour contribuer à RSocial ! Ce document décrit les bonnes pratiques pour contribuer au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)

## 📜 Code de Conduite

### Nos Valeurs

- **Respect** : Respect mutuel entre tous les contributeurs
- **Bienveillance** : Accueil bienveillant des nouveaux contributeurs
- **Collaboration** : Collaboration constructive et ouverte
- **Qualité** : Code de qualité et bien documenté

### Comportement Attendu

- ✅ Utiliser un langage accueillant et inclusif
- ✅ Respecter les différents points de vue et expériences
- ✅ Accepter les critiques constructives
- ✅ Se concentrer sur ce qui est le mieux pour la communauté
- ✅ Faire preuve d'empathie envers les autres membres

### Comportement Inacceptable

- ❌ Langage ou images sexualisés
- ❌ Trolling, commentaires insultants/désobligeants
- ❌ Harcèlement public ou privé
- ❌ Publication d'informations privées sans permission
- ❌ Autre comportement jugé inapproprié dans un contexte professionnel

## 🚀 Comment Contribuer

### Types de Contributions

- 🐛 **Rapporter un bug** : Ouvrir une issue avec une description détaillée
- 💡 **Suggérer une fonctionnalité** : Proposer une nouvelle fonctionnalité via une issue
- 📝 **Améliorer la documentation** : Corriger ou améliorer la documentation
- 🧪 **Ajouter des tests** : Améliorer la couverture de tests
- 🔧 **Corriger un bug** : Corriger un bug existant
- ✨ **Implémenter une fonctionnalité** : Ajouter une nouvelle fonctionnalité

## 🔄 Processus de Développement

### 1. Fork le Projet

```bash
# Fork le projet sur GitHub
# Cloner votre fork
git clone https://github.com/votre-username/RSocial.git
cd RSocial
```

### 2. Créer une Branche

```bash
# Créer une branche pour votre travail
git checkout -b feature/ma-fonctionnalite
# OU
git checkout -b fix/mon-bug
```

### 3. Configurer l'Environnement

```bash
# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd backend
npm install
cd ..

# Configurer les variables d'environnement
cp env.local.example .env.local
cp backend/env.example backend/.env
```

### 4. Développer

- Écrire du code clair et bien documenté
- Suivre les standards de code (voir ci-dessous)
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire

### 5. Tester

```bash
# Tests frontend (à implémenter)
npm test

# Tests backend (à implémenter)
cd backend
npm test
cd ..
```

### 6. Commit

```bash
# Ajouter les fichiers modifiés
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter la fonctionnalité X"
# OU
git commit -m "fix: corriger le bug Y"
```

### 7. Push

```bash
# Push vers votre fork
git push origin feature/ma-fonctionnalite
```

### 8. Ouvrir une Pull Request

- Ouvrir une Pull Request sur GitHub
- Décrire clairement les changements
- Référencer les issues liées (ex: `Fixes #123`)

## 📝 Standards de Code

### Formatage

- **Indentation** : 2 espaces (pas de tabs)
- **Guillemets** : Simple quotes (`'`) pour JavaScript
- **Point-virgule** : Oui (semicolons)
- **Ligne max** : 100 caractères (souhaitable)

### Naming Conventions

#### JavaScript/React

- **Variables** : `camelCase`
  ```javascript
  const userName = "John";
  const isActive = true;
  ```

- **Fonctions** : `camelCase`
  ```javascript
  function getUserProfile() { }
  const calculateDistance = () => { };
  ```

- **Composants React** : `PascalCase`
  ```javascript
  function UserProfile() { }
  const PostCard = () => { };
  ```

- **Constantes** : `UPPER_SNAKE_CASE`
  ```javascript
  const API_URL = "https://api.example.com";
  const MAX_RADIUS = 5;
  ```

- **Fichiers** : `camelCase` pour services/utils, `PascalCase` pour composants
  ```
  postService.js
  UserProfile.jsx
  geolocation.js
  ```

### Structure des Composants React

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Component.css';

// 2. Composant
const Component = ({ prop1, prop2 }) => {
  // 3. Hooks
  const { user } = useAuth();
  const [state, setState] = useState(null);

  // 4. Effects
  useEffect(() => {
    // Effet
  }, []);

  // 5. Handlers
  const handleClick = () => {
    // Handler
  };

  // 6. Render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
};

// 7. Export
export default Component;
```

### Structure des Services

```javascript
// services/postService.js
import api from '../config/api';

// Fonctions exportées
export const getPosts = async (params) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};
```

### Structure des Contrôleurs

```javascript
// controllers/postController.js
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

export const getPosts = async (req, res) => {
  try {
    // Logique
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*');

    if (error) throw error;

    res.json({ posts: data });
  } catch (error) {
    console.error('Erreur getPosts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
```

### Commentaires

- **Commenter le "pourquoi"**, pas le "quoi"
- Utiliser des commentaires clairs et concis
- Éviter les commentaires redondants

```javascript
// ❌ Mauvais
const userName = "John"; // Définit le nom d'utilisateur

// ✅ Bon
// Calcul de la distance avec la formule de Haversine
const distance = calculateDistance(lat1, lng1, lat2, lng2);
```

### Gestion d'Erreurs

```javascript
// Frontend
try {
  const data = await service.getData();
} catch (error) {
  console.error('Erreur:', error);
  // Afficher un message à l'utilisateur
}

// Backend
try {
  const { data, error } = await supabaseAdmin.from('table').select('*');
  if (error) throw error;
  res.json({ data });
} catch (error) {
  console.error('Erreur:', error);
  res.status(500).json({ error: 'Erreur serveur' });
}
```

## 🧪 Tests

### Tests Unitaires

- Tester chaque fonction/utilité individuellement
- Objectif : 80% de couverture de code

```javascript
// utils/geolocation.test.js
import { calculateDistance } from './geolocation';

describe('calculateDistance', () => {
  it('calcule correctement la distance entre deux points', () => {
    const distance = calculateDistance(48.8566, 2.3522, 48.8606, 2.3376);
    expect(distance).toBeCloseTo(1.2, 1);
  });
});
```

### Tests d'Intégration

- Tester les endpoints API
- Vérifier les interactions entre composants

```javascript
// tests/api/posts.test.js
describe('POST /api/posts', () => {
  it('crée un nouveau post', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Test post',
        type: 'annonce',
        location: { lat: 48.8566, lng: 2.3522 }
      });

    expect(response.status).toBe(201);
    expect(response.body.post).toHaveProperty('id');
  });
});
```

## 📚 Documentation

### Code Documentation

- **JSDoc** pour les fonctions complexes
- **README** pour chaque module important
- **Commentaires** pour les algorithmes complexes

```javascript
/**
 * Calcule la distance entre deux points géographiques
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lng1 - Longitude du premier point
 * @param {number} lat2 - Latitude du deuxième point
 * @param {number} lng2 - Longitude du deuxième point
 * @returns {number} Distance en kilomètres
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  // Implémentation
};
```

### Documentation des Changements

- Mettre à jour le `CHANGELOG.md` (si existant)
- Documenter les nouvelles fonctionnalités dans `README.md`
- Mettre à jour `API_DOCS.md` pour les changements d'API

## 🔀 Pull Requests

### Titre de la PR

Utiliser un préfixe descriptif :

- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, pas de changement de code
- `refactor:` : Refactoring
- `test:` : Ajout/modification de tests
- `chore:` : Tâches de maintenance

Exemples :
```
feat: ajouter le système de badges
fix: corriger le calcul de distance
docs: mettre à jour API_DOCS.md
```

### Description de la PR

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Documentation
- [ ] Refactoring

## Tests
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests d'intégration ajoutés/modifiés
- [ ] Tests manuels effectués

## Checklist
- [ ] Code suivi les standards du projet
- [ ] Commentaires ajoutés pour le code complexe
- [ ] Documentation mise à jour
- [ ] Tests passent
- [ ] Pas de nouveaux warnings
```

### Review Process

1. **Ouvrir la PR** : Créer la Pull Request sur GitHub
2. **CI/CD** : Attendre que les tests passent
3. **Review** : Attendre la review d'au moins un mainteneur
4. **Corrections** : Appliquer les corrections demandées
5. **Merge** : Une fois approuvé, la PR sera mergée

## 🐛 Rapporter un Bug

### Template d'Issue

```markdown
## Description
Description claire du bug

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement attendu
Ce qui devrait se passer

## Comportement actuel
Ce qui se passe réellement

## Screenshots
Si applicable, ajouter des screenshots

## Environnement
- OS: [ex: Windows 10]
- Navigateur: [ex: Chrome 120]
- Version: [ex: 1.0.0]

## Informations supplémentaires
Toute autre information pertinente
```

## 💡 Proposer une Fonctionnalité

### Template d'Issue

```markdown
## Description
Description claire de la fonctionnalité proposée

## Problème résolu
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Comment cette fonctionnalité devrait-elle fonctionner ?

## Alternatives considérées
Autres solutions envisagées

## Informations supplémentaires
Toute autre information pertinente
```

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à :
- Ouvrir une issue sur GitHub
- Contacter les mainteneurs du projet

---

**Merci de contribuer à RSocial ! 🎉**

