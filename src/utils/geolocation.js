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

