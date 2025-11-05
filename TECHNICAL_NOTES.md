# 📐 Notes Techniques - RSocial

## Architecture

### Pattern : Context API + Hooks

L'application utilise React Context pour la gestion d'état globale :

```
AuthContext    → Authentification & Session utilisateur
AppContext     → Données de l'application (posts, events, etc.)
```

### Structure des Composants

```
App
├── AuthProvider
│   └── AppProvider
│       ├── Header (Navigation)
│       ├── Sidebar (Menu)
│       └── Views (Feed, Map, etc.)
```

## Gestion d'État

### AuthContext
- **User** : Données utilisateur connecté
- **Login/Register** : Authentification
- **UpdateUser** : Mise à jour du profil
- **Storage** : localStorage pour la persistance

### AppContext
- **Posts** : Publications locales
- **Events** : Événements
- **Groups** : Groupes/Communautés
- **Classifieds** : Petites annonces
- **Messages** : Messagerie privée
- **Notifications** : Alertes
- **Reports** : Signalements
- **BlockedUsers** : Utilisateurs bloqués

## Utilitaires

### geolocation.js
```javascript
calculateDistance(lat1, lon1, lat2, lon2)  // Haversine
filterByDistance(items, location, radius)  // Filtrage
getUserLocation()                          // Géolocalisation
formatDistance(distance)                   // Formatage
```

### dateUtils.js
```javascript
formatRelativeTime(date)    // "il y a 2 heures"
formatFullDate(date)        // "15 janvier 2024 à 14:30"
formatEventDate(date)       // "Aujourd'hui à 14:30"
```

### validation.js
```javascript
validateEmail(email)
validatePhone(phone)
validateRequired(value)
validatePrice(price)
```

## Données Mockées

Structure type d'un post :
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
  type: 'Annonce' | 'Événement' | 'Aide' | 'Perdu/Trouvé',
  location: { lat, lng, address },
  images: string[],
  createdAt: ISO string,
  likes: number,
  comments: Comment[],
  likedBy: string[]
}
```

## Formule de Distance

Haversine Formula :
```javascript
const R = 6371; // Rayon de la Terre en km
const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);
const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
return R * c;
```

## Cartes (Leaflet)

### Configuration
```javascript
<MapContainer 
  center={[lat, lng]} 
  zoom={14}
>
  <TileLayer url="https://.../tile.openstreetmap.org/..." />
  <Marker position={[lat, lng]}>
    <Popup>...</Popup>
  </Marker>
</MapContainer>
```

### Cercle de Rayon
```javascript
<Circle
  center={[lat, lng]}
  radius={radiusInMeters}
  pathOptions={{ color: '#667eea', fillOpacity: 0.1 }}
/>
```

## Styling

### Approche : CSS Modules
- Fichier CSS par composant
- Classes scopées automatiquement
- Pas de conflits de noms

### Design System

#### Couleurs
```css
Primary:     #667eea (Violet)
Secondary:   #764ba2 (Violet foncé)
Success:     #10b981 (Vert)
Warning:     #f59e0b (Orange)
Error:       #ef4444 (Rouge)
Background:  #f9fafb (Gris clair)
```

#### Espacements
```css
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
```

#### Border Radius
```css
sm:  8px
md:  12px
lg:  16px
full: 50%
```

## Optimisations Possibles

### Performance
1. **React.memo** pour les composants lourds
2. **useMemo** pour les calculs de distance
3. **useCallback** pour les handlers
4. **Lazy loading** des images
5. **Virtual scrolling** pour les longues listes

### Code Splitting
```javascript
const Feed = lazy(() => import('./components/Feed/Feed'));
const MapView = lazy(() => import('./components/Map/MapView'));
```

### Debouncing
Pour les inputs de recherche :
```javascript
const debouncedSearch = useDebounce(searchTerm, 300);
```

## Sécurité

### XSS Protection
- Sanitize user inputs
- Use dangerouslySetInnerHTML avec précaution
- Validate URLs avant affichage

### CSRF (Pour implémentation backend)
- CSRF tokens
- SameSite cookies
- Origin validation

## Tests (À Implémenter)

### Unit Tests
```javascript
describe('calculateDistance', () => {
  it('should calculate distance correctly', () => {
    const result = calculateDistance(48.8566, 2.3522, 48.8606, 2.3376);
    expect(result).toBeCloseTo(1.3, 1);
  });
});
```

### Integration Tests
```javascript
describe('Feed Component', () => {
  it('should display posts within radius', () => {
    render(<Feed />);
    expect(screen.getByText(/Post title/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Cypress/Playwright)
```javascript
describe('User Journey', () => {
  it('should create and view a post', () => {
    cy.visit('/');
    cy.get('[data-testid="create-post"]').click();
    // ...
  });
});
```

## API Backend (Suggestion)

### Endpoints Recommandés
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/posts?lat=48.8566&lng=2.3522&radius=3
POST   /api/posts
GET    /api/events
POST   /api/events
GET    /api/groups
POST   /api/groups/:id/join
GET    /api/messages
POST   /api/messages
```

### Structure Response
```javascript
{
  success: boolean,
  data: any,
  error?: {
    code: string,
    message: string
  },
  meta?: {
    pagination: {
      page: number,
      limit: number,
      total: number
    }
  }
}
```

## Base de Données (Suggestion)

### Tables Principales
```sql
users
  - id, email, phone, name, bio, avatar
  - lat, lng, address, radius
  - created_at, updated_at

posts
  - id, user_id, content, type
  - lat, lng, address
  - images (JSON), likes
  - created_at

events
  - id, user_id, title, description
  - date, end_date, lat, lng, address
  - max_attendees, image
  - created_at

groups
  - id, name, description, type
  - lat, lng, address
  - created_by, created_at

messages
  - id, sender_id, receiver_id
  - content, read
  - created_at
```

### Indexes
```sql
CREATE INDEX idx_posts_location ON posts(lat, lng);
CREATE INDEX idx_users_location ON users(lat, lng);
CREATE INDEX idx_events_date ON events(date);
```

### Requête Spatiale (PostGIS)
```sql
SELECT * FROM posts
WHERE ST_DWithin(
  ST_MakePoint(lng, lat)::geography,
  ST_MakePoint(2.3522, 48.8566)::geography,
  3000  -- 3 km en mètres
);
```

## WebSocket (Temps Réel)

### Messages en Temps Réel
```javascript
socket.on('new_message', (message) => {
  addMessage(message);
  showNotification('Nouveau message');
});
```

### Notifications
```javascript
socket.on('new_post_nearby', (post) => {
  addNotification({
    type: 'new_post',
    message: `Nouveau post: ${post.content}`,
  });
});
```

## Déploiement

### Frontend (Vercel/Netlify)
```bash
npm run build
# Upload dist/
```

### Variables d'Environnement
```env
VITE_API_URL=https://api.rsocial.com
VITE_MAP_TILES_URL=https://...
VITE_WS_URL=wss://api.rsocial.com
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## Monitoring (Suggestion)

### Métriques
- Response time
- Error rate
- Active users
- Posts per day
- Distance calculations per second

### Logging
```javascript
logger.info('User created post', {
  userId,
  postId,
  location: { lat, lng },
});
```

## Conformité RGPD

### À Implémenter
- Consentement cookies
- Export des données
- Droit à l'oubli
- Minimisation des données
- Chiffrement des données sensibles

## Progressive Web App (PWA)

### Manifest.json
```json
{
  "name": "RSocial",
  "short_name": "RSocial",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [...]
}
```

### Service Worker
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## Accessibilité (A11Y)

### ARIA Labels
```jsx
<button aria-label="Créer une publication">
  ✏️
</button>
```

### Keyboard Navigation
- Tab order logique
- Focus visible
- Escape pour fermer les modals

### Screen Readers
- Alt text pour images
- Descriptions contextuelles
- Annonces dynamiques

## Internationalisation (i18n)

### Avec react-i18next
```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('feed.title')}</h1>
```

---

Ces notes sont des suggestions pour améliorer et étendre l'application. La version actuelle est un MVP fonctionnel avec des données mockées.

