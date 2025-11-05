import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = '📭', 
  title = 'Aucun résultat', 
  message = 'Il n\'y a rien à afficher pour le moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-content">
        <h3>{title}</h3>
        <p>{message}</p>
        {actionLabel && onAction && (
          <button className="empty-state-button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

