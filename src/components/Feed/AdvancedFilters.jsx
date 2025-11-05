import React, { useState } from 'react';
import './Feed.css';

const AdvancedFilters = ({
  customRadius,
  setCustomRadius,
  selectedAuthor,
  setSelectedAuthor,
  authors,
  sortBy,
  setSortBy,
  dateFilter,
  setDateFilter,
  defaultRadius
}) => {
  const [authorSearch, setAuthorSearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filtrer les auteurs selon la recherche
  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(authorSearch.toLowerCase())
  );

  // Options de tri rapide
  const quickDateOptions = [
    { label: 'Aujourd\'hui', days: 0 },
    { label: 'Cette semaine', days: 7 },
    { label: 'Ce mois', days: 30 },
    { label: 'Ces 3 mois', days: 90 },
  ];

  const handleQuickDate = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    setDateFilter({ start: startDate, end: endDate });
  };

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  const clearAllFilters = () => {
    setCustomRadius(defaultRadius);
    setSelectedAuthor(null);
    setSortBy('date');
    setDateFilter(null);
    setAuthorSearch('');
  };

  const hasActiveFilters = 
    customRadius !== defaultRadius ||
    selectedAuthor !== null ||
    sortBy !== 'date' ||
    dateFilter !== null;

  return (
    <div className="advanced-filters-panel">
      <div className="advanced-filters-header">
        <h3>🔍 Filtres avancés</h3>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Réinitialiser
          </button>
        )}
      </div>

      <div className="advanced-filters-grid">
        {/* Filtre par distance personnalisée */}
        <div className="filter-group">
          <label className="filter-label">
            📍 Distance (km)
            <span className="filter-value">{customRadius} km</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={customRadius}
            onChange={(e) => setCustomRadius(Number(e.target.value))}
            className="radius-slider"
          />
          <div className="slider-labels">
            <span>1 km</span>
            <span>10 km</span>
          </div>
        </div>

        {/* Filtre par auteur */}
        <div className="filter-group filter-group-author">
          <label className="filter-label">
            👤 Auteur
          </label>
          <div className="author-search-container">
            <input
              type="text"
              placeholder="Rechercher un auteur..."
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              className="author-search-input"
              onFocus={() => {
                if (authors.length > 0 && !selectedAuthor) {
                  setAuthorSearch('');
                }
              }}
            />
            {selectedAuthor && (
              <button 
                className="clear-author-btn"
                onClick={() => {
                  setSelectedAuthor(null);
                  setAuthorSearch('');
                }}
                title="Effacer"
              >
                ✕
              </button>
            )}
          </div>
          {authorSearch && filteredAuthors.length > 0 && (
            <div className="author-dropdown">
              {filteredAuthors.map(author => (
                <div
                  key={author.id}
                  className={`author-option ${selectedAuthor === author.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAuthor(author.id);
                    setAuthorSearch(author.name);
                  }}
                >
                  <img src={author.avatar} alt={author.name} className="author-avatar-small" />
                  <span>{author.name}</span>
                </div>
              ))}
            </div>
          )}
          {selectedAuthor && !authorSearch && (
            <div className="selected-author">
              {authors.find(a => a.id === selectedAuthor)?.name}
            </div>
          )}
        </div>

        {/* Tri par popularité */}
        <div className="filter-group">
          <label className="filter-label">
            📊 Trier par
          </label>
          <div className="sort-options">
            <button
              className={`sort-option ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => setSortBy('date')}
            >
              📅 Date (récent)
            </button>
            <button
              className={`sort-option ${sortBy === 'popularity' ? 'active' : ''}`}
              onClick={() => setSortBy('popularity')}
            >
              🔥 Popularité
            </button>
          </div>
        </div>

        {/* Filtre par date */}
        <div className="filter-group">
          <label className="filter-label">
            📅 Période
          </label>
          <div className="date-quick-options">
            {quickDateOptions.map(option => (
              <button
                key={option.label}
                className="date-quick-btn"
                onClick={() => handleQuickDate(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="date-custom-range">
            <div className="date-input-group">
              <label>Du :</label>
              <input
                type="date"
                value={dateFilter?.start ? dateFilter.start.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const start = e.target.value ? new Date(e.target.value) : null;
                  setDateFilter(prev => ({
                    start,
                    end: prev?.end || null
                  }));
                }}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>Au :</label>
              <input
                type="date"
                value={dateFilter?.end ? dateFilter.end.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const end = e.target.value ? new Date(e.target.value) : null;
                  setDateFilter(prev => ({
                    start: prev?.start || null,
                    end
                  }));
                }}
                className="date-input"
              />
            </div>
          </div>
          {dateFilter && (
            <button className="clear-date-btn" onClick={clearDateFilter}>
              ✕ Effacer la période
            </button>
          )}
        </div>
      </div>

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && (
        <div className="active-filters-summary">
          <strong>Filtres actifs :</strong>
          {customRadius !== defaultRadius && (
            <span className="active-filter-tag">Distance: {customRadius}km</span>
          )}
          {selectedAuthor && (
            <span className="active-filter-tag">
              Auteur: {authors.find(a => a.id === selectedAuthor)?.name}
            </span>
          )}
          {sortBy !== 'date' && (
            <span className="active-filter-tag">Tri: Popularité</span>
          )}
          {dateFilter && (
            <span className="active-filter-tag">
              Période: {dateFilter.start?.toLocaleDateString()} - {dateFilter.end?.toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;

