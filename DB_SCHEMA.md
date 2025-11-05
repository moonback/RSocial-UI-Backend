# 🗄️ Schéma de Base de Données - RSocial

Documentation complète du schéma de base de données PostgreSQL (Supabase) de RSocial.

## 📊 Vue d'Ensemble

La base de données utilise **PostgreSQL** avec l'extension **PostGIS** pour les données géographiques. Elle est hébergée sur **Supabase**.

### Tables Principales

- **users** : Utilisateurs
- **posts** : Publications
- **post_likes** / **post_dislikes** : Likes/dislikes
- **comments** : Commentaires
- **groups** : Groupes
- **group_members** : Membres des groupes
- **events** : Événements
- **event_attendees** : Participants aux événements
- **classifieds** : Petites annonces
- **messages** : Messages privés
- **stories** : Stories 24h
- **story_views** : Vues des stories
- **reports** : Signalements
- **blocked_users** : Utilisateurs bloqués
- **user_follows** : Suivi d'utilisateurs

## 📋 Tables Détaillées

### 👤 users

Table principale des utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de l'utilisateur |
| `phone` | VARCHAR(50) | UNIQUE, NOT NULL | Téléphone de l'utilisateur |
| `password` | VARCHAR(255) | NOT NULL | Mot de passe hashé (bcrypt) |
| `name` | VARCHAR(255) | NOT NULL | Nom de l'utilisateur |
| `avatar` | TEXT | NULL | URL de l'avatar |
| `bio` | TEXT | DEFAULT '' | Bio de l'utilisateur |
| `location` | JSONB | NOT NULL | Localisation `{lat, lng, address}` |
| `radius` | INTEGER | DEFAULT 3 | Rayon de recherche en km (1-5) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |

**Index** :
- `idx_users_email` sur `email`
- `idx_users_phone` sur `phone`

**Relations** :
- `posts` (1:N) - Posts créés par l'utilisateur
- `comments` (1:N) - Commentaires créés par l'utilisateur
- `messages` (1:N) - Messages envoyés/reçus
- `groups` (1:N) - Groupes créés par l'utilisateur
- `events` (1:N) - Événements créés par l'utilisateur
- `classifieds` (1:N) - Petites annonces créées par l'utilisateur
- `stories` (1:N) - Stories créées par l'utilisateur

---

### 📰 posts

Table des publications (fil d'actualités).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Auteur du post |
| `content` | TEXT | NOT NULL | Contenu du post |
| `type` | VARCHAR(50) | NOT NULL | Type : `annonce`, `evenement`, `aide`, `perdu` |
| `images` | TEXT[] | DEFAULT '{}' | Tableau d'URLs d'images |
| `location` | JSONB | NOT NULL | Localisation `{lat, lng, address}` |
| `likes` | INTEGER | DEFAULT 0 | Nombre de likes |
| `dislikes` | INTEGER | DEFAULT 0 | Nombre de dislikes |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |

**Index** :
- `idx_posts_user_id` sur `user_id`
- `idx_posts_created_at` sur `created_at` (DESC)
- `idx_posts_type` sur `type`

**Relations** :
- `post_likes` (1:N) - Likes du post
- `post_dislikes` (1:N) - Dislikes du post
- `comments` (1:N) - Commentaires du post

---

### ❤️ post_likes

Table des likes sur les posts.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `post_id` | UUID | FOREIGN KEY → posts(id), ON DELETE CASCADE | Post liké |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur qui like |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date du like |
| UNIQUE(`post_id`, `user_id`) | | | Un utilisateur ne peut liker qu'une fois |

**Index** :
- `idx_post_likes_post_id` sur `post_id`
- `idx_post_likes_user_id` sur `user_id`

---

### 👎 post_dislikes

Table des dislikes sur les posts.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `post_id` | UUID | FOREIGN KEY → posts(id), ON DELETE CASCADE | Post disliké |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur qui dislike |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date du dislike |
| UNIQUE(`post_id`, `user_id`) | | | Un utilisateur ne peut disliker qu'une fois |

**Index** :
- `idx_post_dislikes_post_id` sur `post_id`
- `idx_post_dislikes_user_id` sur `user_id`

---

### 💬 comments

Table des commentaires sur les posts.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `post_id` | UUID | FOREIGN KEY → posts(id), ON DELETE CASCADE | Post commenté |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Auteur du commentaire |
| `content` | TEXT | NOT NULL | Contenu du commentaire |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date du commentaire |

**Index** :
- `idx_comments_post_id` sur `post_id`
- `idx_comments_user_id` sur `user_id`
- `idx_comments_created_at` sur `created_at` (DESC)

---

### 👥 groups

Table des groupes/communautés.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `name` | VARCHAR(255) | NOT NULL | Nom du groupe |
| `description` | TEXT | NULL | Description du groupe |
| `type` | VARCHAR(50) | NOT NULL | Type : `rue`, `immeuble`, `hobby`, `autre` |
| `avatar` | TEXT | NULL | URL de l'avatar du groupe |
| `location` | JSONB | NOT NULL | Localisation `{lat, lng, address}` |
| `created_by` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Créateur du groupe |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |

**Index** :
- `idx_groups_created_by` sur `created_by`
- `idx_groups_type` sur `type`

**Relations** :
- `group_members` (1:N) - Membres du groupe

---

### 👥 group_members

Table des membres des groupes.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `group_id` | UUID | FOREIGN KEY → groups(id), ON DELETE CASCADE | Groupe |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Membre |
| `joined_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date d'adhésion |
| UNIQUE(`group_id`, `user_id`) | | | Un utilisateur ne peut être membre qu'une fois |

**Index** :
- `idx_group_members_group_id` sur `group_id`
- `idx_group_members_user_id` sur `user_id`

---

### 📅 events

Table des événements.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `title` | VARCHAR(255) | NOT NULL | Titre de l'événement |
| `description` | TEXT | NULL | Description de l'événement |
| `date` | TIMESTAMP WITH TIME ZONE | NOT NULL | Date et heure de début |
| `end_date` | TIMESTAMP WITH TIME ZONE | NULL | Date et heure de fin |
| `max_attendees` | INTEGER | NULL | Limite de participants (optionnel) |
| `image` | TEXT | NULL | URL de l'image de l'événement |
| `location` | JSONB | NOT NULL | Localisation `{lat, lng, address}` |
| `created_by` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Créateur de l'événement |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |

**Index** :
- `idx_events_created_by` sur `created_by`
- `idx_events_date` sur `date`
- `idx_events_created_at` sur `created_at` (DESC)

**Relations** :
- `event_attendees` (1:N) - Participants à l'événement

---

### ✅ event_attendees

Table des participants aux événements.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `event_id` | UUID | FOREIGN KEY → events(id), ON DELETE CASCADE | Événement |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Participant |
| `joined_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date d'inscription |
| UNIQUE(`event_id`, `user_id`) | | | Un utilisateur ne peut participer qu'une fois |

**Index** :
- `idx_event_attendees_event_id` sur `event_id`
- `idx_event_attendees_user_id` sur `user_id`

---

### 🏷️ classifieds

Table des petites annonces.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Auteur de l'annonce |
| `title` | VARCHAR(255) | NOT NULL | Titre de l'annonce |
| `description` | TEXT | NULL | Description détaillée |
| `price` | DECIMAL(10, 2) | NOT NULL | Prix (0 = gratuit) |
| `category` | VARCHAR(50) | NOT NULL | Catégorie : `vente`, `don`, `service`, `recherche` |
| `images` | TEXT[] | DEFAULT '{}' | Tableau d'URLs d'images |
| `location` | JSONB | NOT NULL | Localisation `{lat, lng, address}` |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |

**Index** :
- `idx_classifieds_user_id` sur `user_id`
- `idx_classifieds_category` sur `category`
- `idx_classifieds_created_at` sur `created_at` (DESC)

---

### 💬 messages

Table des messages privés.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `sender_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Expéditeur |
| `receiver_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Destinataire |
| `content` | TEXT | NOT NULL | Contenu du message |
| `read` | BOOLEAN | DEFAULT FALSE | Message lu ou non |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date d'envoi |

**Index** :
- `idx_messages_sender` sur `sender_id`
- `idx_messages_receiver` sur `receiver_id`
- `idx_messages_created_at` sur `created_at` (DESC)

---

### 📸 stories

Table des stories (24h).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Créateur de la story |
| `media_url` | TEXT | NOT NULL | URL du média (image/vidéo) |
| `media_type` | VARCHAR(20) | NOT NULL, CHECK IN ('image', 'video') | Type de média |
| `location` | JSONB | NULL | Localisation optionnelle `{lat, lng, address}` |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de création |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Date d'expiration (24h après création) |

**Index** :
- `idx_stories_user_id` sur `user_id`
- `idx_stories_expires_at` sur `expires_at`
- `idx_stories_created_at` sur `created_at` (DESC)

**Relations** :
- `story_views` (1:N) - Vues de la story

---

### 👁️ story_views

Table des vues des stories.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `story_id` | UUID | FOREIGN KEY → stories(id), ON DELETE CASCADE | Story vue |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur qui a vu |
| `viewed_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date de la vue |
| UNIQUE(`story_id`, `user_id`) | | | Un utilisateur ne peut voir qu'une fois |

**Index** :
- `idx_story_views_story_id` sur `story_id`
- `idx_story_views_user_id` sur `user_id`

---

### ⚠️ reports

Table des signalements.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `type` | VARCHAR(50) | NOT NULL | Type : `post`, `user`, `comment` |
| `content_id` | UUID | NOT NULL | ID du contenu signalé |
| `reason` | TEXT | NOT NULL | Raison du signalement |
| `reported_by` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Auteur du signalement |
| `status` | VARCHAR(50) | DEFAULT 'pending' | Statut : `pending`, `resolved`, `dismissed` |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date du signalement |

**Index** :
- `idx_reports_type` sur `type`
- `idx_reports_status` sur `status`
- `idx_reports_created_at` sur `created_at` (DESC)

---

### 🚫 blocked_users

Table des utilisateurs bloqués.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur qui bloque |
| `blocked_user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur bloqué |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date du blocage |
| UNIQUE(`user_id`, `blocked_user_id`) | | | Un utilisateur ne peut bloquer qu'une fois |

**Index** :
- `idx_blocked_users_user_id` sur `user_id`
- `idx_blocked_users_blocked_user_id` sur `blocked_user_id`

---

### 👤 user_follows

Table du suivi d'utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur qui suit |
| `following_id` | UUID | FOREIGN KEY → users(id), ON DELETE CASCADE | Utilisateur suivi |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Date du suivi |
| UNIQUE(`user_id`, `following_id`) | | | Un utilisateur ne peut suivre qu'une fois |
| CHECK (`user_id` != `following_id`) | | | Un utilisateur ne peut pas se suivre lui-même |

**Index** :
- `idx_user_follows_user_id` sur `user_id`
- `idx_user_follows_following_id` sur `following_id`

---

## 🔗 Relations

### Diagramme ER Simplifié

```
users
  ├── posts (1:N)
  ├── comments (1:N)
  ├── messages (1:N, sender/receiver)
  ├── stories (1:N)
  ├── groups (1:N, created_by)
  ├── events (1:N, created_by)
  ├── classifieds (1:N)
  ├── post_likes (1:N)
  ├── post_dislikes (1:N)
  ├── event_attendees (1:N)
  ├── group_members (1:N)
  ├── story_views (1:N)
  ├── reports (1:N, reported_by)
  ├── blocked_users (1:N, user/blocked_user)
  └── user_follows (1:N, user/following)

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

---

## 🔧 Fonctions PostgreSQL

### Increment/Decrement Likes/Dislikes

```sql
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_dislikes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET dislikes = dislikes + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_dislikes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET dislikes = GREATEST(dislikes - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

### PostGIS (Optionnel)

Si PostGIS est activé, une fonction pour récupérer les voisins dans un rayon peut être créée :

```sql
CREATE OR REPLACE FUNCTION get_neighbors_within_radius(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT,
  exclude_user_id UUID
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  avatar TEXT,
  bio TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  distance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.avatar,
    u.bio,
    u.location,
    u.created_at,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint((u.location->>'lng')::FLOAT, (u.location->>'lat')::FLOAT), 4326)::geography
    ) / 1000 AS distance
  FROM users u
  WHERE u.id != exclude_user_id
    AND ST_Distance(
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint((u.location->>'lng')::FLOAT, (u.location->>'lat')::FLOAT), 4326)::geography
    ) / 1000 <= radius_km
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Index

### Index de Performance

- `idx_posts_user_id` : Recherche rapide des posts par utilisateur
- `idx_posts_created_at` : Tri chronologique des posts
- `idx_messages_sender` / `idx_messages_receiver` : Recherche rapide des messages
- `idx_stories_expires_at` : Nettoyage des stories expirées
- `idx_user_follows_user_id` / `idx_user_follows_following_id` : Suivi d'utilisateurs

---

## 🔒 Sécurité (Row Level Security)

Supabase utilise **Row Level Security (RLS)** pour sécuriser les données. Les politiques RLS doivent être définies dans Supabase Dashboard.

**Exemple de politique** :
- Les utilisateurs peuvent lire leurs propres données
- Les utilisateurs peuvent modifier leurs propres données
- Les utilisateurs peuvent lire les posts publics dans leur rayon

---

## 📈 Statistiques

### Requêtes Utiles

**Nombre de posts par utilisateur** :
```sql
SELECT u.name, COUNT(p.id) as posts_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name
ORDER BY posts_count DESC;
```

**Utilisateurs les plus actifs** :
```sql
SELECT 
  u.name,
  COUNT(DISTINCT p.id) as posts,
  COUNT(DISTINCT c.id) as comments,
  COUNT(DISTINCT m.id) as messages
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
LEFT JOIN comments c ON c.user_id = u.id
LEFT JOIN messages m ON m.sender_id = u.id
GROUP BY u.id, u.name
ORDER BY posts DESC, comments DESC;
```

---

Pour plus de détails sur l'architecture, voir [ARCHITECTURE.md](./ARCHITECTURE.md).

Pour plus de détails sur l'API, voir [API_DOCS.md](./API_DOCS.md).

