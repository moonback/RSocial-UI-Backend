import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import eventService from '../../services/eventService';
import { formatEventDate } from '../../utils/dateUtils';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Events.css';

const EventCard = ({ event, onEventUpdated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(event.isAttending);

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    event.location.lat,
    event.location.lng
  );

  const isFull = event.max_attendees && event.attendees >= event.max_attendees;

  const handleRSVP = async () => {
    if (isFull && !isAttending) {
      return;
    }

    try {
      setLoading(true);
      if (isAttending) {
        await eventService.cancelRsvp(event.id);
        setIsAttending(false);
      } else {
        await eventService.rsvpEvent(event.id);
        setIsAttending(true);
      }
      
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Erreur RSVP:', error);
      alert(error.response?.data?.error || 'Erreur lors du RSVP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-card">
      {event.image && (
        <div
          className="event-image"
          style={{ backgroundImage: `url(${event.image})` }}
        />
      )}

      <div className="event-content">
        <div className="event-date-badge">
          {formatEventDate(event.date)}
        </div>

        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description}</p>

        <div className="event-info">
          <div className="event-info-item">
            <span className="info-icon">📍</span>
            <span>{formatDistance(distance)}</span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">👥</span>
            <span>
              {event.attendees}
              {event.max_attendees && ` / ${event.max_attendees}`} participants
            </span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">🏠</span>
            <span>{event.location.address}</span>
          </div>
        </div>

        <div className="event-organizer">
          <img 
            src={event.organizer?.avatar || `https://ui-avatars.com/api/?name=${event.organizer?.name}&background=random`} 
            alt={event.organizer?.name} 
            className="organizer-avatar" 
          />
          <div>
            <div className="organizer-label">Organisé par</div>
            <div className="organizer-name">{event.organizer?.name}</div>
          </div>
        </div>

        <button
          className={`event-rsvp-btn ${isAttending ? 'btn-attending' : 'btn-primary'} ${isFull && !isAttending ? 'btn-disabled' : ''}`}
          onClick={handleRSVP}
          disabled={isFull && !isAttending || loading}
        >
          {loading ? '⏳' : isFull && !isAttending
            ? '❌ Complet'
            : isAttending
            ? '✓ Vous participez'
            : 'Participer'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;

