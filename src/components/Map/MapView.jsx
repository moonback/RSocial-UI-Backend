import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { filterByDistance } from '../../utils/geolocation';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix pour les icônes Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
  const { user } = useAuth();
  const { posts, events, groups } = useApp();
  const [filter, setFilter] = useState('all');

  const mapCenter = [user.location.lat, user.location.lng];
  const radiusInMeters = user.radius * 1000;

  const markers = useMemo(() => {
    const allMarkers = [];

    if (filter === 'all' || filter === 'posts') {
      const nearbyPosts = filterByDistance(posts, user.location, user.radius);
      nearbyPosts.forEach(post => {
        allMarkers.push({
          type: 'post',
          id: post.id,
          position: [post.location.lat, post.location.lng],
          title: post.type,
          description: post.content.substring(0, 100) + '...',
          data: post,
        });
      });
    }

    if (filter === 'all' || filter === 'events') {
      const nearbyEvents = filterByDistance(events, user.location, user.radius);
      nearbyEvents.forEach(event => {
        allMarkers.push({
          type: 'event',
          id: event.id,
          position: [event.location.lat, event.location.lng],
          title: event.title,
          description: event.description.substring(0, 100) + '...',
          data: event,
        });
      });
    }

    if (filter === 'all' || filter === 'groups') {
      const nearbyGroups = filterByDistance(groups, user.location, user.radius);
      nearbyGroups.forEach(group => {
        allMarkers.push({
          type: 'group',
          id: group.id,
          position: [group.location.lat, group.location.lng],
          title: group.name,
          description: group.description,
          data: group,
        });
      });
    }

    return allMarkers;
  }, [posts, events, groups, user.location, user.radius, filter]);

  const getMarkerIcon = (type) => {
    const icons = {
      post: '📍',
      event: '📅',
      group: '👥',
    };
    
    return L.divIcon({
      html: `<div class="custom-marker ${type}">${icons[type]}</div>`,
      className: 'custom-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Carte Interactive</h2>
        <p>Explorez votre quartier</p>
      </div>

      <div className="map-filters">
        <button
          className={`filter-chip ${filter === 'all' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          📋 Tout
        </button>
        <button
          className={`filter-chip ${filter === 'posts' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('posts')}
        >
          📍 Publications
        </button>
        <button
          className={`filter-chip ${filter === 'events' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('events')}
        >
          📅 Événements
        </button>
        <button
          className={`filter-chip ${filter === 'groups' ? 'filter-chip-active' : ''}`}
          onClick={() => setFilter('groups')}
        >
          👥 Groupes
        </button>
      </div>

      <div className="map-wrapper">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          className="leaflet-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Cercle de rayon de l'utilisateur */}
          <Circle
            center={mapCenter}
            radius={radiusInMeters}
            pathOptions={{
              color: '#667eea',
              fillColor: '#667eea',
              fillOpacity: 0.1,
            }}
          />

          {/* Marqueur de l'utilisateur */}
          <Marker 
            position={mapCenter}
            icon={L.divIcon({
              html: '<div class="custom-marker user">📍</div>',
              className: 'custom-marker-container',
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            })}
          >
            <Popup>
              <div className="map-popup">
                <strong>Vous êtes ici</strong>
                <p>{user.location.address}</p>
              </div>
            </Popup>
          </Marker>

          {/* Marqueurs dynamiques */}
          {markers.map(marker => (
            <Marker
              key={`${marker.type}-${marker.id}`}
              position={marker.position}
              icon={getMarkerIcon(marker.type)}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{marker.title}</strong>
                  <p>{marker.description}</p>
                  {marker.type === 'event' && (
                    <div className="popup-attendees">
                      👥 {marker.data.attendees.length} participants
                    </div>
                  )}
                  {marker.type === 'group' && (
                    <div className="popup-members">
                      👥 {marker.data.members.length} membres
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon user">📍</span>
          <span>Votre position</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon post">📍</span>
          <span>Publications</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon event">📅</span>
          <span>Événements</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon group">👥</span>
          <span>Groupes</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;

