import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import neighborService from '../../services/neighborService';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import NeighborsMap from './NeighborsMap';
import NeighborCard from './NeighborCard';
import NeighborStats from './NeighborStats';
import './Neighbors.css';

const Neighbors = () => {
  const { user } = useAuth();
  const [neighbors, setNeighbors] = useState([]);
  const [suggestedNeighbors, setSuggestedNeighbors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('neighbors'); // 'neighbors', 'suggestions', 'map', 'stats'
  const [radius, setRadius] = useState(user.radius);
  const [following, setFollowing] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'name'

  useEffect(() => {
    loadNeighborsData();
  }, [user.location, radius]);

  const loadNeighborsData = async () => {
    try {
      setLoading(true);
      
      // Charger les voisins, suggestions et stats en parallèle
      const [neighborsData, suggestionsData, statsData] = await Promise.all([
        neighborService.getNeighbors(user.location.lat, user.location.lng, radius),
        neighborService.getSuggestedNeighbors(user.location.lat, user.location.lng, radius),
        neighborService.getNeighborhoodStats(user.location.lat, user.location.lng, radius)
      ]);

      // Enrichir avec les distances
      const enrichedNeighbors = neighborsData.map(neighbor => ({
        ...neighbor,
        distance: calculateDistance(
          user.location.lat,
          user.location.lng,
          neighbor.location?.lat || 0,
          neighbor.location?.lng || 0
        )
      })).sort((a, b) => a.distance - b.distance);

      const enrichedSuggestions = suggestionsData.map(neighbor => ({
        ...neighbor,
        distance: calculateDistance(
          user.location.lat,
          user.location.lng,
          neighbor.location?.lat || 0,
          neighbor.location?.lng || 0
        )
      })).sort((a, b) => a.distance - b.distance);

      setNeighbors(enrichedNeighbors);
      setSuggestedNeighbors(enrichedSuggestions);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement voisins:', error);
      // En cas d'erreur, utiliser des données mockées pour la démo
      setNeighbors([]);
      setSuggestedNeighbors([]);
      setStats({
        totalNeighbors: 0,
        activeNeighbors: 0,
        newNeighbors: 0,
        averageDistance: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const processedNeighbors = useMemo(() => {
    let result = [...neighbors];

    // Filtrage
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.bio?.toLowerCase().includes(query)
      );
    }

    // Tri
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else { // 'distance' par défaut
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [neighbors, searchQuery, sortBy]);

  const processedSuggestions = useMemo(() => {
    let result = [...suggestedNeighbors];

    // Filtrage
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.bio?.toLowerCase().includes(query)
      );
    }
    
    // Tri
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else { // 'distance' par défaut
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [suggestedNeighbors, searchQuery, sortBy]);

  const handleFollow = async (userId) => {
    try {
      await neighborService.followNeighbor(userId);
      setFollowing(prev => new Set(prev).add(userId));
      // Recharger les suggestions
      loadNeighborsData();
    } catch (error) {
      console.error('Erreur follow:', error);
      alert('Erreur lors de l\'ajout au suivi');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await neighborService.unfollowNeighbor(userId);
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Erreur unfollow:', error);
      alert('Erreur lors de la suppression du suivi');
    }
  };

  const tabs = [
    { id: 'neighbors', label: '👥 Voisins', icon: '👥' },
    { id: 'suggestions', label: '✨ Suggestions', icon: '✨' },
    { id: 'map', label: '🗺️ Carte', icon: '🗺️' },
    { id: 'stats', label: '📊 Statistiques', icon: '📊' }
  ];

  return (
    <div className="neighbors-container">
      <div className="neighbors-header">
        <h1>🏘️ Mon Voisinage</h1>
        <p className="subtitle">Découvrez et connectez-vous avec les personnes qui vivent autour de vous.</p>
      </div>

      {/* Contrôles */}
      <div className="neighbors-controls">
        <div className="control-group">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom ou bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="sort-options">
            <span>Trier par :</span>
            <button className={`sort-btn ${sortBy === 'distance' ? 'active' : ''}`} onClick={() => setSortBy('distance')}>
              📍 Proximité
            </button>
            <button className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`} onClick={() => setSortBy('name')}>
              🔤 Nom
            </button>
          </div>
        </div>
        
        <div className="control-group">
          <label className="radius-control">
            <span>Rayon :</span>
            <input
              type="range"
              min="1"
              max="10"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="radius-slider"
            />
            <span className="radius-value">{radius} km</span>
          </label>
        </div>
      </div>

      {/* Onglets */}
      <div className="neighbors-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`neighbor-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* <span className="tab-icon">{tab.icon}</span> */}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="neighbors-content">
        {loading ? (
          <div className="loading-container">
            <div className="neighbors-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="neighbor-card-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar" />
                    <div className="skeleton-info">
                      <div className="skeleton-line" />
                      <div className="skeleton-line short" />
                    </div>
                  </div>
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-footer">
                    <div className="skeleton-button" />
                    <div className="skeleton-button" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'neighbors' && (
              <div className="neighbors-list-section">
                <h3>Voisins les plus proches ({processedNeighbors.length})</h3>
                {processedNeighbors.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>Aucun voisin trouvé</h3>
                    <p>Augmentez votre rayon de recherche ou essayez un autre filtre.</p>
                  </div>
                ) : (
                  <div className="neighbors-grid">
                    {processedNeighbors.map(neighbor => (
                      <NeighborCard
                        key={neighbor.id}
                        neighbor={neighbor}
                        isFollowing={following.has(neighbor.id)}
                        onFollow={() => handleFollow(neighbor.id)}
                        onUnfollow={() => handleUnfollow(neighbor.id)}
                        showDistance={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="suggestions-section">
                <h3>Suggestions de voisins à suivre ({processedSuggestions.length})</h3>
                {processedSuggestions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <h3>Aucune suggestion</h3>
                    <p>Nous vous suggérerons des voisins actifs dans votre quartier !</p>
                  </div>
                ) : (
                  <div className="neighbors-grid">
                    {processedSuggestions.map(neighbor => (
                      <NeighborCard
                        key={neighbor.id}
                        neighbor={neighbor}
                        isFollowing={following.has(neighbor.id)}
                        onFollow={() => handleFollow(neighbor.id)}
                        onUnfollow={() => handleUnfollow(neighbor.id)}
                        showDistance={true}
                        isSuggestion={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'map' && (
              <div className="neighbors-map-section">
                <h3>Carte des voisins actifs</h3>
                <NeighborsMap
                  neighbors={neighbors}
                  userLocation={user.location}
                  radius={radius}
                />
              </div>
            )}

            {activeTab === 'stats' && (
              <NeighborStats stats={stats} radius={radius} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Neighbors;

