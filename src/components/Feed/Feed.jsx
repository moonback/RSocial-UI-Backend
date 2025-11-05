import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/postService';
import { filterByDistance } from '../../utils/geolocation';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import AdvancedFilters from './AdvancedFilters';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
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
  }, [posts, user.location, customRadius, filter, selectedAuthor, sortBy, dateFilter]);

  const filterOptions = [
    { value: 'all', label: 'Tout voir', icon: '📋' },
    { value: 'Annonce', label: 'Annonces', icon: '📢' },
    { value: 'Événement', label: 'Événements', icon: '📅' },
    { value: 'Aide', label: 'Aide', icon: '🤝' },
    { value: 'Perdu/Trouvé', label: 'Perdu/Trouvé', icon: '🔍' },
  ];

  return (
    <div className="feed-container">
      <div className="feed-header">
        <div className="feed-header-content">
          <div className="feed-header-text">
            <h2>Fil d'actualités local</h2>
            <p>
              {filteredPosts.length > 0 ? (
                <>
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'publication' : 'publications'} 
                  {customRadius !== user.radius && ` dans un rayon de ${customRadius} km`}
                  {customRadius === user.radius && ` dans un rayon de ${user.radius} km`}
                </>
              ) : (
                `Aucune publication dans un rayon de ${customRadius} km`
              )}
            </p>
          </div>
          <button 
            className="create-post-button"
            onClick={() => setShowCreatePost(true)}
          >
            ✏️ Créer une publication
          </button>
        </div>
      </div>

      <div className="feed-filters-container">
        <div className="feed-filters">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-chip ${filter === option.value ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
        
        <button 
          className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''}`}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          🔍 Filtres avancés {showAdvancedFilters ? '▼' : '▶'}
        </button>
      </div>

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
            <div className="spinner"></div>
            <p className="loading-text">Chargement des publications...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Aucune publication</h3>
            <p>Soyez le premier à publier dans votre quartier !</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onPostDeleted={loadPosts} />
          ))
        )}
      </div>

      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} onPostCreated={handlePostCreated} />
      )}
    </div>
  );
};

export default Feed;

