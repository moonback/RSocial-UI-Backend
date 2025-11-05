import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import groupService from '../../services/groupService';
import GroupCard from './GroupCard';
import CreateGroup from './CreateGroup';
import './Groups.css';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [filter, setFilter] = useState('all');

  // Charger les groupes depuis l'API
  useEffect(() => {
    loadGroups();
  }, [user.location, user.radius]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await groupService.getGroups(
        user.location.lat,
        user.location.lng,
        user.radius
      );
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = () => {
    loadGroups();
    setShowCreateGroup(false);
  };

  const filteredGroups = useMemo(() => {
    let filtered = groups;
    
    if (filter === 'my-groups') {
      filtered = filtered.filter(group => group.isMember);
    }
    
    return filtered;
  }, [groups, filter]);

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
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Chargement des groupes...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
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
            <GroupCard key={group.id} group={group} onGroupUpdated={loadGroups} />
          ))
        )}
      </div>

      {showCreateGroup && (
        <CreateGroup onClose={() => setShowCreateGroup(false)} onGroupCreated={handleGroupCreated} />
      )}
    </div>
  );
};

export default Groups;

