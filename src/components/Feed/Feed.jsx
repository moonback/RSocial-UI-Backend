import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { filterByDistance } from '../../utils/geolocation';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const { posts } = useApp();
  const [filter, setFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const filteredPosts = useMemo(() => {
    // Filtrer par distance
    let filtered = filterByDistance(posts, user.location, user.radius);
    
    // Filtrer par type si nécessaire
    if (filter !== 'all') {
      filtered = filtered.filter(post => post.type === filter);
    }
    
    // Trier par date (plus récent en premier)
    return filtered.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [posts, user.location, user.radius, filter]);

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
        <h2>Fil d'actualités local</h2>
        <p>Publications dans un rayon de {user.radius} km</p>
      </div>

      <button 
        className="create-post-button"
        onClick={() => setShowCreatePost(true)}
      >
        ✏️ Créer une publication
      </button>

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

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Aucune publication</h3>
            <p>Soyez le premier à publier dans votre quartier !</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};

export default Feed;

