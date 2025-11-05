# 📡 Documentation API - RSocial

Documentation complète de l'API REST de RSocial.

**Base URL** : `http://localhost:3001/api` (développement)  
**Content-Type** : `application/json`

## 🔐 Authentification

La plupart des endpoints nécessitent une authentification via **JWT**.  
Incluez le token dans le header `Authorization` :

```
Authorization: Bearer <token>
```

### Endpoints

#### POST `/api/auth/register`

Inscription d'un nouvel utilisateur.

**Body** :
```json
{
  "email": "user@example.com",
  "phone": "+33612345678",
  "name": "John Doe",
  "password": "password123",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  }
}
```

**Response** (201) :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "location": { ... }
  }
}
```

**Errors** :
- `400` : Validation échouée (email invalide, mot de passe trop court, etc.)
- `409` : Email ou téléphone déjà utilisé

---

#### POST `/api/auth/login`

Connexion d'un utilisateur.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**OU** :
```json
{
  "phone": "+33612345678",
  "password": "password123"
}
```

**Response** (200) :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "location": { ... }
  }
}
```

**Errors** :
- `401` : Identifiants invalides
- `400` : Champs manquants

---

#### GET `/api/auth/me`

Récupère le profil de l'utilisateur connecté.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "bio": "Ma bio",
    "location": { ... },
    "radius": 3,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Errors** :
- `401` : Token invalide ou expiré

---

#### PUT `/api/auth/profile`

Met à jour le profil de l'utilisateur.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "name": "John Updated",
  "bio": "Nouvelle bio",
  "radius": 5
}
```

**Response** (200) :
```json
{
  "user": {
    "id": "uuid",
    "name": "John Updated",
    "bio": "Nouvelle bio",
    "radius": 5,
    ...
  }
}
```

---

## 📰 Posts

### GET `/api/posts`

Récupère la liste des posts dans le rayon de l'utilisateur.

**Query Parameters** :
- `lat` (number) : Latitude de l'utilisateur
- `lng` (number) : Longitude de l'utilisateur
- `radius` (number, optional) : Rayon en km (défaut: 3)
- `type` (string, optional) : Filtrer par type (`annonce`, `evenement`, `aide`, `perdu`)

**Headers** : `Authorization: Bearer <token>` (optionnel)

**Response** (200) :
```json
{
  "posts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "content": "Contenu du post",
      "type": "annonce",
      "images": ["https://..."],
      "location": {
        "lat": 48.8566,
        "lng": 2.3522,
        "address": "Paris, France"
      },
      "likes": 5,
      "dislikes": 0,
      "created_at": "2025-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "comments": [
        {
          "id": "uuid",
          "content": "Commentaire",
          "created_at": "2025-01-01T00:00:00Z",
          "user": {
            "id": "uuid",
            "name": "Jane Doe",
            "avatar": "https://..."
          }
        }
      ],
      "distance": 0.5
    }
  ]
}
```

---

### POST `/api/posts`

Crée un nouveau post.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "content": "Contenu du post",
  "type": "annonce",
  "images": ["https://..."],
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  }
}
```

**Response** (201) :
```json
{
  "post": {
    "id": "uuid",
    "content": "Contenu du post",
    "type": "annonce",
    "images": ["https://..."],
    "location": { ... },
    "likes": 0,
    "dislikes": 0,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### POST `/api/posts/:postId/like`

Like un post.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Post liké",
  "post": {
    "id": "uuid",
    "likes": 6,
    ...
  }
}
```

---

### POST `/api/posts/:postId/dislike`

Dislike un post.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Post disliké",
  "post": {
    "id": "uuid",
    "dislikes": 1,
    ...
  }
}
```

---

### POST `/api/posts/:postId/comments`

Ajoute un commentaire à un post.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "content": "Mon commentaire"
}
```

**Response** (201) :
```json
{
  "comment": {
    "id": "uuid",
    "content": "Mon commentaire",
    "created_at": "2025-01-01T00:00:00Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "avatar": "https://..."
    }
  }
}
```

---

### DELETE `/api/posts/:postId`

Supprime un post (seul le créateur peut supprimer).

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Post supprimé"
}
```

---

## 📅 Événements

### GET `/api/events`

Récupère la liste des événements.

**Query Parameters** :
- `lat` (number) : Latitude
- `lng` (number) : Longitude
- `radius` (number, optional) : Rayon en km
- `filter` (string, optional) : `upcoming`, `my_events`, `all`

**Headers** : `Authorization: Bearer <token>` (optionnel)

**Response** (200) :
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Fête de quartier",
      "description": "Description",
      "date": "2025-01-15T18:00:00Z",
      "end_date": "2025-01-15T22:00:00Z",
      "max_attendees": 50,
      "image": "https://...",
      "location": { ... },
      "created_by": "uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "attendees": [
        {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://..."
        }
      ],
      "attendees_count": 10,
      "distance": 0.5
    }
  ]
}
```

---

### POST `/api/events`

Crée un nouvel événement.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "title": "Fête de quartier",
  "description": "Description",
  "date": "2025-01-15T18:00:00Z",
  "end_date": "2025-01-15T22:00:00Z",
  "max_attendees": 50,
  "image": "https://...",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  }
}
```

**Response** (201) :
```json
{
  "event": {
    "id": "uuid",
    "title": "Fête de quartier",
    ...
  }
}
```

---

### POST `/api/events/:eventId/rsvp`

Participe à un événement.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "RSVP confirmé",
  "event": {
    "id": "uuid",
    "attendees_count": 11,
    ...
  }
}
```

---

### DELETE `/api/events/:eventId/rsvp`

Annule la participation à un événement.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "RSVP annulé"
}
```

---

### DELETE `/api/events/:eventId`

Supprime un événement (seul le créateur peut supprimer).

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Événement supprimé"
}
```

---

## 👥 Groupes

### GET `/api/groups`

Récupère la liste des groupes.

**Query Parameters** :
- `lat` (number) : Latitude
- `lng` (number) : Longitude
- `radius` (number, optional) : Rayon en km
- `type` (string, optional) : Filtrer par type (`rue`, `immeuble`, `hobby`, `autre`)
- `my_groups` (boolean, optional) : Mes groupes uniquement

**Headers** : `Authorization: Bearer <token>` (optionnel)

**Response** (200) :
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Rue de la Paix",
      "description": "Description",
      "type": "rue",
      "avatar": "https://...",
      "location": { ... },
      "created_by": "uuid",
      "created_at": "2025-01-01T00:00:00Z",
      "members": [
        {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://..."
        }
      ],
      "members_count": 15,
      "is_member": true,
      "distance": 0.5
    }
  ]
}
```

---

### POST `/api/groups`

Crée un nouveau groupe.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "name": "Rue de la Paix",
  "description": "Description",
  "type": "rue",
  "avatar": "https://...",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  }
}
```

**Response** (201) :
```json
{
  "group": {
    "id": "uuid",
    "name": "Rue de la Paix",
    ...
  }
}
```

---

### POST `/api/groups/:groupId/join`

Rejoint un groupe.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Groupe rejoint",
  "group": {
    "id": "uuid",
    "members_count": 16,
    "is_member": true
  }
}
```

---

### POST `/api/groups/:groupId/leave`

Quitte un groupe.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Groupe quitté"
}
```

---

### DELETE `/api/groups/:groupId`

Supprime un groupe (seul le créateur peut supprimer).

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Groupe supprimé"
}
```

---

## 🏷️ Petites Annonces

### GET `/api/classifieds`

Récupère la liste des petites annonces.

**Query Parameters** :
- `lat` (number) : Latitude
- `lng` (number) : Longitude
- `radius` (number, optional) : Rayon en km
- `category` (string, optional) : Filtrer par catégorie (`vente`, `don`, `service`, `recherche`)

**Headers** : `Authorization: Bearer <token>` (optionnel)

**Response** (200) :
```json
{
  "classifieds": [
    {
      "id": "uuid",
      "title": "Vente vélo",
      "description": "Vélo en bon état",
      "price": 150.00,
      "category": "vente",
      "images": ["https://..."],
      "location": { ... },
      "created_at": "2025-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "distance": 0.5
    }
  ]
}
```

---

### GET `/api/classifieds/:classifiedId`

Récupère les détails d'une petite annonce.

**Headers** : `Authorization: Bearer <token>` (optionnel)

**Response** (200) :
```json
{
  "classified": {
    "id": "uuid",
    "title": "Vente vélo",
    "description": "Vélo en bon état",
    "price": 150.00,
    "category": "vente",
    "images": ["https://..."],
    "location": { ... },
    "created_at": "2025-01-01T00:00:00Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "avatar": "https://..."
    }
  }
}
```

---

### POST `/api/classifieds`

Crée une nouvelle petite annonce.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "title": "Vente vélo",
  "description": "Vélo en bon état",
  "price": 150.00,
  "category": "vente",
  "images": ["https://..."],
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  }
}
```

**Response** (201) :
```json
{
  "classified": {
    "id": "uuid",
    "title": "Vente vélo",
    ...
  }
}
```

---

### DELETE `/api/classifieds/:classifiedId`

Supprime une petite annonce (seul le créateur peut supprimer).

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Annonce supprimée"
}
```

---

### PUT `/api/classifieds/:classifiedId/sold`

Marque une annonce comme vendue.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Annonce marquée comme vendue"
}
```

---

## 💬 Messages

### GET `/api/messages/conversations`

Récupère la liste des conversations.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "conversations": [
    {
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "avatar": "https://..."
      },
      "lastMessage": {
        "id": "uuid",
        "content": "Dernier message",
        "created_at": "2025-01-01T00:00:00Z",
        "read": false
      },
      "unreadCount": 2
    }
  ]
}
```

---

### POST `/api/messages`

Envoie un message.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "receiverId": "uuid",
  "content": "Message texte"
}
```

**Response** (201) :
```json
{
  "message": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "content": "Message texte",
    "read": false,
    "created_at": "2025-01-01T00:00:00Z",
    "sender": {
      "id": "uuid",
      "name": "John Doe",
      "avatar": "https://..."
    },
    "receiver": {
      "id": "uuid",
      "name": "Jane Doe",
      "avatar": "https://..."
    }
  }
}
```

---

### PUT `/api/messages/:messageId/read`

Marque un message comme lu.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Message marqué comme lu"
}
```

---

## 👤 Utilisateurs

### GET `/api/users`

Recherche des utilisateurs.

**Query Parameters** :
- `search` (string, optional) : Recherche par nom

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "avatar": "https://...",
      "location": { ... }
    }
  ]
}
```

---

### GET `/api/users/:userId`

Récupère un utilisateur par ID.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://...",
    "bio": "Ma bio",
    "location": { ... },
    "radius": 3,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### GET `/api/users/neighbors`

Récupère les voisins proches.

**Query Parameters** :
- `lat` (number) : Latitude
- `lng` (number) : Longitude
- `radius` (number, optional) : Rayon en km (défaut: 5)

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "neighbors": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "avatar": "https://...",
      "bio": "Ma bio",
      "location": { ... },
      "distance": 0.5,
      "postsCount": 10,
      "followersCount": 5
    }
  ]
}
```

---

### POST `/api/users/:userId/follow`

Suit un utilisateur.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Utilisateur suivi avec succès"
}
```

---

### DELETE `/api/users/:userId/follow`

Ne plus suivre un utilisateur.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Suivi supprimé avec succès"
}
```

---

## 📤 Upload

### POST `/api/upload/image`

Upload une image.

**Headers** : `Authorization: Bearer <token`  
**Content-Type** : `multipart/form-data`

**Body** :
```
image: <file>
```

**Response** (200) :
```json
{
  "message": "Image uploadée",
  "url": "https://...",
  "path": "images/uuid.jpg"
}
```

---

### POST `/api/upload/images`

Upload plusieurs images.

**Headers** : `Authorization: Bearer <token>`  
**Content-Type** : `multipart/form-data`

**Body** :
```
images: <file1>, <file2>, ...
```

**Response** (200) :
```json
{
  "message": "Images uploadées",
  "images": [
    {
      "url": "https://...",
      "path": "images/uuid1.jpg"
    },
    {
      "url": "https://...",
      "path": "images/uuid2.jpg"
    }
  ]
}
```

---

### POST `/api/upload/video`

Upload une vidéo.

**Headers** : `Authorization: Bearer <token>`  
**Content-Type** : `multipart/form-data`

**Body** :
```
video: <file>
```

**Response** (200) :
```json
{
  "message": "Vidéo uploadée",
  "url": "https://...",
  "path": "videos/uuid.mp4"
}
```

---

## 📸 Stories

### GET `/api/stories`

Récupère la liste des stories actives (non expirées).

**Query Parameters** :
- `lat` (number) : Latitude
- `lng` (number) : Longitude
- `radius` (number, optional) : Rayon en km

**Headers** : `Authorization: Bearer <token>` (optionnel)

**Response** (200) :
```json
{
  "stories": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "media_url": "https://...",
      "media_type": "image",
      "location": { ... },
      "created_at": "2025-01-01T00:00:00Z",
      "expires_at": "2025-01-02T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "views_count": 5
    }
  ]
}
```

---

### POST `/api/stories`

Crée une nouvelle story.

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "media_url": "https://...",
  "media_type": "image",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522,
    "address": "Paris, France"
  }
}
```

**Response** (201) :
```json
{
  "story": {
    "id": "uuid",
    "media_url": "https://...",
    "media_type": "image",
    "expires_at": "2025-01-02T00:00:00Z",
    ...
  }
}
```

---

### POST `/api/stories/:storyId/view`

Marque une story comme vue.

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Story marquée comme vue"
}
```

---

### DELETE `/api/stories/:storyId`

Supprime une story (seul le créateur peut supprimer).

**Headers** : `Authorization: Bearer <token>`

**Response** (200) :
```json
{
  "message": "Story supprimée"
}
```

---

## ⚠️ Codes d'Erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Requête invalide (validation échouée) |
| `401` | Non autorisé (token manquant ou invalide) |
| `403` | Interdit (pas les permissions) |
| `404` | Ressource non trouvée |
| `409` | Conflit (email/téléphone déjà utilisé) |
| `413` | Fichier trop volumineux |
| `500` | Erreur serveur |

---

## 🔄 WebSocket (Socket.io)

L'API WebSocket est utilisée pour la messagerie en temps réel.

### Connexion

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connecté');
});
```

### Événements

#### Émettre

- `join_room` : Rejoindre une salle (ex: `user_123`)
  ```javascript
  socket.emit('join_room', 'user_123');
  ```

#### Écouter

- `new_message` : Nouveau message reçu
  ```javascript
  socket.on('new_message', (message) => {
    console.log('Nouveau message:', message);
  });
  ```

- `notification` : Nouvelle notification
  ```javascript
  socket.on('notification', (notification) => {
    console.log('Notification:', notification);
  });
  ```

---

Pour plus de détails sur l'architecture, voir [ARCHITECTURE.md](./ARCHITECTURE.md).

