import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { filterByDistance } from '../../utils/geolocation';
import ClassifiedCard from './ClassifiedCard';
import CreateClassified from './CreateClassified';
import './Classifieds.css';

const Classifieds = () => {
  const { user } = useAuth();
  const { classifieds } = useApp();
  const [showCreateClassified, setShowCreateClassified] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredClassifieds = useMemo(() => {
    let filtered = filterByDistance(classifieds, user.location, user.radius);

    if (filter !== 'all') {
      filtered = filtered.filter(classified => classified.category === filter);
    }

    // Trier par date (plus récent en premier)
    return filtered.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [classifieds, user.location, user.radius, filter]);

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
        {filteredClassifieds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <h3>Aucune annonce trouvée</h3>
            <p>Soyez le premier à publier une annonce dans votre quartier !</p>
          </div>
        ) : (
          filteredClassifieds.map(classified => (
            <ClassifiedCard key={classified.id} classified={classified} />
          ))
        )}
      </div>

      {showCreateClassified && (
        <CreateClassified onClose={() => setShowCreateClassified(false)} />
      )}
    </div>
  );
};

export default Classifieds;

