import React from 'react';
import './Neighbors.css';

const NeighborStats = ({ stats, radius }) => {
  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>Aucune statistique disponible</h3>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Voisins totaux',
      value: stats.totalNeighbors || 0,
      icon: '👥',
      color: '#667eea'
    },
    {
      label: 'Voisins actifs',
      value: stats.activeNeighbors || 0,
      icon: '✨',
      color: '#10b981'
    },
    {
      label: 'Nouveaux ce mois',
      value: stats.newNeighbors || 0,
      icon: '🆕',
      color: '#f59e0b'
    },
    {
      label: 'Distance moyenne',
      value: stats.averageDistance ? `${stats.averageDistance.toFixed(1)} km` : '0 km',
      icon: '📍',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="neighbor-stats-container">
      <div className="stats-header">
        <h3>Statistiques du voisinage</h3>
        <p>Dans un rayon de {radius} km</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}20` }}>
              <span className="stat-icon-large">{stat.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.topCategories && stats.topCategories.length > 0 && (
        <div className="stats-categories">
          <h4>Catégories populaires</h4>
          <div className="categories-list">
            {stats.topCategories.map((category, index) => (
              <div key={index} className="category-item">
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count} posts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.activityHours && (
        <div className="stats-activity">
          <h4>Heures d'activité</h4>
          <div className="activity-chart">
            {stats.activityHours.map((hour, index) => (
              <div key={index} className="activity-bar-container">
                <div 
                  className="activity-bar"
                  style={{ 
                    height: `${(hour.activity / (stats.maxActivity || 1)) * 100}%`,
                    backgroundColor: hour.activity > 0 ? '#667eea' : '#e5e7eb'
                  }}
                />
                <span className="activity-label">{hour.hour}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeighborStats;

