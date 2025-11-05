import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import eventService from '../../services/eventService';
import EventCard from './EventCard';
import CreateEvent from './CreateEvent';
import './Events.css';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [filter, setFilter] = useState('all');

  // Charger les événements depuis l'API
  useEffect(() => {
    loadEvents();
  }, [user.location, user.radius, filter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await eventService.getEvents(
        user.location.lat,
        user.location.lng,
        user.radius,
        filter
      );
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    loadEvents();
    setShowCreateEvent(false);
  };

  const filteredEvents = useMemo(() => {
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

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
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Chargement des événements...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
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
            <EventCard key={event.id} event={event} onEventUpdated={loadEvents} />
          ))
        )}
      </div>

      {showCreateEvent && (
        <CreateEvent onClose={() => setShowCreateEvent(false)} onEventCreated={handleEventCreated} />
      )}
    </div>
  );
};

export default Events;

