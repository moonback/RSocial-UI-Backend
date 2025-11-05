import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { filterByDistance } from '../../utils/geolocation';
import EventCard from './EventCard';
import CreateEvent from './CreateEvent';
import './Events.css';

const Events = () => {
  const { user } = useAuth();
  const { events } = useApp();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    let filtered = filterByDistance(events, user.location, user.radius);

    if (filter === 'my-events') {
      filtered = filtered.filter(
        event => event.createdBy === user.id || event.attendees.includes(user.id)
      );
    } else if (filter === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(event => new Date(event.date) > now);
    }

    // Trier par date
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, user.location, user.radius, user.id, filter]);

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Événements Locaux</h2>
        <p>Découvrez et participez aux événements de votre quartier</p>
      </div>

      <button
        className="create-event-button"
        onClick={() => setShowCreateEvent(true)}
      >
        📅 Créer un événement
      </button>

      <div className="events-filters">
        <button
          className={`filter-chip ${filter === 'all' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous les événements
        </button>
        <button
          className={`filter-chip ${filter === 'upcoming' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          À venir
        </button>
        <button
          className={`filter-chip ${filter === 'my-events' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('my-events')}
        >
          Mes événements
        </button>
      </div>

      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>Aucun événement trouvé</h3>
            <p>
              {filter === 'my-events'
                ? "Vous n'avez pas encore d'événement"
                : 'Aucun événement dans votre zone'}
            </p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>

      {showCreateEvent && (
        <CreateEvent onClose={() => setShowCreateEvent(false)} />
      )}
    </div>
  );
};

export default Events;

