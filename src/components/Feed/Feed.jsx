import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/postService';
import { filterByDistance } from '../../utils/geolocation';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import AdvancedFilters from './AdvancedFilters';
import Stories from '../Stories/Stories';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);

  // États pour les stories
  const [showStories, setShowStories] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  
  // Filtres avancés
  const [customRadius, setCustomRadius] = useState(user.radius);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'popularity'
  const [dateFilter, setDateFilter] = useState(null); // { start: Date, end: Date }

  // Charger les posts depuis l'API
  useEffect(() => {
    loadPosts();
  }, [user.location, user.radius, filter]);

  // Mettre à jour customRadius quand user.radius change
  useEffect(() => {
    setCustomRadius(user.radius);
  }, [user.radius]);

  // Gestion du scroll pour afficher/masquer les stories
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const atTop = scrollTop < 50; // Considérer "en haut" si scroll < 50px

    setIsAtTop(atTop);

    // Masquer automatiquement les stories si on scroll vers le bas
    if (!atTop && showStories) {
      setShowStories(false);
    }
  }, [showStories]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fonction pour afficher les stories
  const handleShowStories = () => {
    setShowStories(true);
    // Scroll vers le haut pour voir les stories
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await postService.getPosts(
        user.location.lat,
        user.location.lng,
        user.radius,
        filter
      );
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    // Recharger les posts après création
    loadPosts();
    setShowCreatePost(false);
  };

  // Extraire la liste des auteurs uniques
  const authors = useMemo(() => {
    const authorMap = new Map();
    posts.forEach(post => {
      const authorId = post.user_id || post.userId;
      const authorName = post.users?.name || post.userName || 'Utilisateur inconnu';
      if (authorId && !authorMap.has(authorId)) {
        authorMap.set(authorId, {
          id: authorId,
          name: authorName,
          avatar: post.users?.avatar || post.userAvatar
        });
      }
    });
    return Array.from(authorMap.values());
  }, [posts]);

  const filteredPosts = useMemo(() => {
    // Filtrer par distance personnalisée
    let filtered = filterByDistance(posts, user.location, customRadius);

    // Filtrer par type si nécessaire
    if (filter !== 'all') {
      filtered = filtered.filter(post => post.type === filter);
    }

    // Filtrer par auteur
    if (selectedAuthor) {
      filtered = filtered.filter(post =>
        (post.user_id || post.userId) === selectedAuthor
      );
    }

    // Recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.content?.toLowerCase().includes(query) ||
        post.users?.name?.toLowerCase().includes(query) ||
        post.type?.toLowerCase().includes(query)
      );
    }

    // Filtrer par date
    if (dateFilter && (dateFilter.start || dateFilter.end)) {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.created_at || post.createdAt);
        if (dateFilter.start && postDate < dateFilter.start) return false;
        if (dateFilter.end) {
          const endDate = new Date(dateFilter.end);
          endDate.setHours(23, 59, 59, 999); // Fin de journée
          if (postDate > endDate) return false;
        }
        return true;
      });
    }

    // Trier selon le critère sélectionné
    if (sortBy === 'popularity') {
      // Trier par popularité (likes + commentaires)
      filtered = filtered.sort((a, b) => {
        const aScore = (a.likes || 0) + (a.comments?.length || 0);
        const bScore = (b.likes || 0) + (b.comments?.length || 0);
        return bScore - aScore;
      });
    } else {
      // Trier par date (plus récent en premier)
      filtered = filtered.sort((a, b) =>
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );
    }

    return filtered;
  }, [posts, user.location, customRadius, filter, selectedAuthor, sortBy, dateFilter, searchQuery]);

  const filterOptions = [
    { value: 'all', label: 'Tout voir', icon: '📋' },
    { value: 'Annonce', label: 'Annonces', icon: '📢' },
    { value: 'Événement', label: 'Événements', icon: '📅' },
    { value: 'Aide', label: 'Aide', icon: '🤝' },
    { value: 'Perdu/Trouvé', label: 'Perdu/Trouvé', icon: '🔍' },
  ];

  return (
    <div className="feed-container">
      {/* Stories - affichées seulement si en haut de l'écran ou si bouton appuyé */}
      {(isAtTop || showStories) && <Stories />}

      {/* Bouton pour afficher les stories si elles sont masquées */}
      {!isAtTop && !showStories && (
        <div className="stories-toggle-container">
          <button
            className="stories-toggle-button"
            onClick={handleShowStories}
            title="Voir les stories"
          >
            <span className="stories-icon">📱</span>
            <span>Stories</span>
          </button>
        </div>
      )}

      <div className="feed-header">
        <div className="feed-header-content">
          <div className="feed-header-text">
            <div className="feed-title-section">
              <h1>🏠 Fil d'actualités local</h1>
              <div className="feed-stats">
                <span className="stats-badge">
                  📍 {customRadius}km
                </span>
                <span className="stats-badge">
                  📊 {filteredPosts.length} publication{filteredPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <p className="feed-subtitle">
              Découvrez ce qui se passe dans votre quartier
            </p>
          </div>
          <div className="feed-actions">
            <button
              className="create-post-button primary-action"
              onClick={() => setShowCreatePost(true)}
            >
              <span className="action-icon">✏️</span>
              <span>Publier</span>
            </button>
          </div>
        </div>
      </div>

      <div className="feed-filters-container">
        <div className="feed-filters">
          <button
            className={`filter-chip ${filter === 'all' ? 'filter-chip-active' : ''} filter-all`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-icon">🌟</span>
            <span className="filter-text">Tout</span>
          </button>
          {filterOptions.slice(1).map(option => (
            <button
              key={option.value}
              className={`filter-chip ${filter === option.value ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              <span className="filter-icon">{option.icon}</span>
              <span className="filter-text">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="filter-actions">
          <button
            className={`search-toggle ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            <span className="search-icon">🔍</span>
            <span>Rechercher</span>
          </button>
          <button
            className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            ⚙️ Filtres
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Rechercher dans les publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results">
              <span className="search-count">
                {filteredPosts.length} résultat{filteredPosts.length !== 1 ? 's' : ''} pour "{searchQuery}"
              </span>
            </div>
          )}
        </div>
      )}

      {showAdvancedFilters && (
        <AdvancedFilters
          customRadius={customRadius}
          setCustomRadius={setCustomRadius}
          selectedAuthor={selectedAuthor}
          setSelectedAuthor={setSelectedAuthor}
          authors={authors}
          sortBy={sortBy}
          setSortBy={setSortBy}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          defaultRadius={user.radius}
        />
      )}

      <div className="posts-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="post-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text"></div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                  <div className="skeleton-actions">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="loading-text">Découverte de votre quartier...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-visual">
              <div className="empty-icon">🏘️</div>
              <div className="empty-decoration">✨</div>
            </div>
            <div className="empty-content">
              <h3>Le quartier est calme...</h3>
              <p>Soyez le premier à partager quelque chose avec vos voisins !</p>
              <button
                className="empty-cta-button"
                onClick={() => setShowCreatePost(true)}
              >
                <span className="cta-icon">💫</span>
                Créer la première publication
              </button>
            </div>
          </div>
        ) : (
          <>
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} onPostDeleted={loadPosts} />
            ))}
            <div className="feed-footer">
              <div className="feed-end-message">
                <span className="end-icon">🎉</span>
                <span>Vous êtes à jour !</span>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} onPostCreated={handlePostCreated} />
      )}
    </div>
  );
};

export default Feed;

