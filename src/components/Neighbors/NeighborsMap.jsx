import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistance } from '../../utils/geolocation';
import 'leaflet/dist/leaflet.css';
import './Neighbors.css';

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

// Icône personnalisée pour les voisins
const createNeighborIcon = (avatar) => {
  return L.divIcon({
    className: 'neighbor-marker',
    html: `<div class="neighbor-marker-content">
      <img src="${avatar}" alt="Neighbor" />
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const NeighborsMap = ({ neighbors, userLocation, radius }) => {
  const mapCenter = [userLocation.lat, userLocation.lng];
  const radiusInMeters = radius * 1000;

  const markers = useMemo(() => {
    return neighbors.map(neighbor => ({
      id: neighbor.id,
      position: [
        neighbor.location?.lat || userLocation.lat,
        neighbor.location?.lng || userLocation.lng
      ],
      name: neighbor.name,
      avatar: neighbor.avatar,
      distance: neighbor.distance,
      bio: neighbor.bio
    }));
  }, [neighbors, userLocation]);

  return (
    <div className="neighbors-map-wrapper">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '600px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Cercle du rayon */}
        <Circle
          center={mapCenter}
          radius={radiusInMeters}
          pathOptions={{
            color: '#667eea',
            fillColor: '#667eea',
            fillOpacity: 0.1,
            weight: 2
          }}
        />

        {/* Marqueur de l'utilisateur */}
        <Marker position={mapCenter}>
          <Popup>
            <div className="map-popup">
              <strong>📍 Votre position</strong>
              <p>Rayon: {radius} km</p>
            </div>
          </Popup>
        </Marker>

        {/* Marqueurs des voisins */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createNeighborIcon(marker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(marker.name)}&background=667eea&color=fff`)}
          >
            <Popup>
              <div className="map-popup">
                <div className="popup-header">
                  <img 
                    src={marker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(marker.name)}&background=667eea&color=fff`} 
                    alt={marker.name}
                    className="popup-avatar"
                  />
                  <strong>{marker.name}</strong>
                </div>
                {marker.distance !== undefined && (
                  <p>📍 {formatDistance(marker.distance)}</p>
                )}
                {marker.bio && (
                  <p className="popup-bio">{marker.bio}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker user"></div>
          <span>Votre position</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker neighbor"></div>
          <span>Voisins ({neighbors.length})</span>
        </div>
        <div className="legend-item">
          <div className="legend-circle"></div>
          <span>Rayon de {radius} km</span>
        </div>
      </div>
    </div>
  );
};

export default NeighborsMap;

