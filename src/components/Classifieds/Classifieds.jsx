import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import classifiedService from '../../services/classifiedService';
import ClassifiedCard from './ClassifiedCard';
import CreateClassified from './CreateClassified';
import './Classifieds.css';

const Classifieds = () => {
  const { user } = useAuth();
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClassified, setShowCreateClassified] = useState(false);
  const [filter, setFilter] = useState('all');

  // Charger les annonces depuis l'API
  useEffect(() => {
    loadClassifieds();
  }, [user.location, user.radius, filter]);

  const loadClassifieds = async () => {
    try {
      setLoading(true);
      const fetchedClassifieds = await classifiedService.getClassifieds(
        user.location.lat,
        user.location.lng,
        user.radius,
        filter
      );
      setClassifieds(fetchedClassifieds);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassifiedCreated = () => {
    loadClassifieds();
    setShowCreateClassified(false);
  };

  const filteredClassifieds = useMemo(() => {
    // Trier par date (plus récent en premier)
    return classifieds.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }, [classifieds]);

  const categories = [
    { value: 'all', label: 'Toutes', icon: '📋' },
    { value: 'Vente', label: 'Vente', icon: '💰' },
    { value: 'Don', label: 'Don', icon: '🎁' },
    { value: 'Service', label: 'Service', icon: '🔧' },
    { value: 'Recherche', label: 'Recherche', icon: '🔍' },
  ];

  return (
    <div className="classifieds-container">
      <div className="classifieds-header">
        <h2>Petites Annonces</h2>
        <p>Achetez, vendez et échangez dans votre quartier</p>
      </div>

      <button
        className="create-classified-button"
        onClick={() => setShowCreateClassified(true)}
      >
        🏷️ Créer une annonce
      </button>

      <div className="classifieds-filters">
        {categories.map(category => (
          <button
            key={category.value}
            className={`filter-chip ${filter === category.value ? 'filter-chip-active' : ''}`}
            onClick={() => setFilter(category.value)}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>

      <div className="classifieds-grid">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Chargement des annonces...</p>
          </div>
        ) : filteredClassifieds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <h3>Aucune annonce trouvée</h3>
            <p>Soyez le premier à publier une annonce dans votre quartier !</p>
          </div>
        ) : (
          filteredClassifieds.map(classified => (
            <ClassifiedCard key={classified.id} classified={classified} onClassifiedUpdated={loadClassifieds} />
          ))
        )}
      </div>

      {showCreateClassified && (
        <CreateClassified onClose={() => setShowCreateClassified(false)} onClassifiedCreated={handleClassifiedCreated} />
      )}
    </div>
  );
};

export default Classifieds;

