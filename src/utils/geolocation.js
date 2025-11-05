// Utilitaires pour la géolocalisation

/**
 * Calcule la distance entre deux points géographiques en km
 * Utilise la formule de Haversine
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

/**
 * Filtre les éléments en fonction de la distance par rapport à l'utilisateur
 */
export const filterByDistance = (items, userLocation, radius) => {
  if (!userLocation) return items;
  
  return items.filter((item) => {
    if (!item.location) return false;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      item.location.lat,
      item.location.lng
    );
    return distance <= radius;
  });
};

/**
 * Obtient la position géographique de l'utilisateur
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Formatte la distance pour l'affichage
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

// Dernière requête pour respecter le rate limiting de Nominatim (1 req/s)
let lastGeocodeRequest = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 seconde

/**
 * Convertit des coordonnées en adresse (géocodage inverse)
 * Utilise l'API Nominatim d'OpenStreetMap (gratuite)
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    // Utiliser l'API Nominatim pour le reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RSocial App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors du géocodage inverse');
    }

    const data = await response.json();

    if (!data || !data.display_name) {
      throw new Error('Adresse introuvable pour cette position');
    }

    return {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      address: data.display_name
    };
  } catch (error) {
    console.error('Erreur reverse geocoding:', error);
    throw new Error('Impossible de récupérer l\'adresse de cette position. Vérifiez votre connexion internet.');
  }
};

/**
 * Convertit une adresse en coordonnées géographiques (géocodage)
 * Utilise l'API Nominatim d'OpenStreetMap (gratuite)
 */
export const geocodeAddress = async (address) => {
  if (!address || address.trim().length === 0) {
    throw new Error('Adresse vide');
  }

  // Respecter le rate limiting de Nominatim (1 requête par seconde)
  const now = Date.now();
  const timeSinceLastRequest = now - lastGeocodeRequest;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastGeocodeRequest = Date.now();

  try {
    // Utiliser l'API Nominatim d'OpenStreetMap
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RSocial App' // Nominatim nécessite un User-Agent
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la géocodage. Veuillez réessayer dans quelques instants.');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Adresse introuvable. Vérifiez l\'orthographe et essayez une adresse plus complète (ville, pays).');
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name || address
    };
  } catch (error) {
    console.error('Erreur géocodage:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Impossible de géocoder l\'adresse. Vérifiez que l\'adresse est correcte et votre connexion internet.');
  }
};

