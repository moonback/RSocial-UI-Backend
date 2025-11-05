import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatEventDate } from '../../utils/dateUtils';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import './Events.css';

const EventCard = ({ event }) => {
  const { user } = useAuth();
  const { rsvpEvent } = useApp();

  const distance = calculateDistance(
    user.location.lat,
    user.location.lng,
    event.location.lat,
    event.location.lng
  );

  const isAttending = event.attendees.includes(user.id);
  const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;

  const handleRSVP = () => {
    if (!isFull || isAttending) {
      rsvpEvent(event.id, user.id);
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
              {event.attendees.length}
              {event.maxAttendees && ` / ${event.maxAttendees}`} participants
            </span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">🏠</span>
            <span>{event.location.address}</span>
          </div>
        </div>

        <div className="event-organizer">
          <img src={event.creatorAvatar} alt={event.creatorName} className="organizer-avatar" />
          <div>
            <div className="organizer-label">Organisé par</div>
            <div className="organizer-name">{event.creatorName}</div>
          </div>
        </div>

        <button
          className={`event-rsvp-btn ${isAttending ? 'btn-attending' : 'btn-primary'} ${isFull && !isAttending ? 'btn-disabled' : ''}`}
          onClick={handleRSVP}
          disabled={isFull && !isAttending}
        >
          {isFull && !isAttending
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

