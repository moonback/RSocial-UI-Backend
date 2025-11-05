import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { filterByDistance } from '../../utils/geolocation';
import GroupCard from './GroupCard';
import CreateGroup from './CreateGroup';
import './Groups.css';

const Groups = () => {
  const { user } = useAuth();
  const { groups } = useApp();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredGroups = useMemo(() => {
    let filtered = filterByDistance(groups, user.location, user.radius);
    
    if (filter === 'my-groups') {
      filtered = filtered.filter(group => group.members.includes(user.id));
    }
    
    return filtered;
  }, [groups, user.location, user.radius, user.id, filter]);

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h2>Groupes & Communautés</h2>
        <p>Rejoignez ou créez des communautés locales</p>
      </div>

      <button
        className="create-group-button"
        onClick={() => setShowCreateGroup(true)}
      >
        ➕ Créer un groupe
      </button>

      <div className="groups-filters">
        <button
          className={`filter-chip ${filter === 'all' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous les groupes
        </button>
        <button
          className={`filter-chip ${filter === 'my-groups' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('my-groups')}
        >
          Mes groupes
        </button>
      </div>

      <div className="groups-grid">
        {filteredGroups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>Aucun groupe trouvé</h3>
            <p>
              {filter === 'my-groups'
                ? "Vous n'avez pas encore rejoint de groupe"
                : 'Aucun groupe dans votre zone'}
            </p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))
        )}
      </div>

      {showCreateGroup && (
        <CreateGroup onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
};

export default Groups;

