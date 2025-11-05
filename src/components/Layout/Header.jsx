import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import './Layout.css';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-button" onClick={onMenuClick} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="header-title">RSocial</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <img src={user.avatar} alt={user.name} className="user-avatar-small" />
            <span className="user-name">{user.name}</span>
          </div>
          
          {unreadCount > 0 && (
            <div className="notification-badge-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <div className="notification-badge">{unreadCount}</div>
            </div>
          )}
          
          <button onClick={logout} className="logout-button">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

