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
          <button className="menu-button" onClick={onMenuClick}>
            ☰
          </button>
          <h1 className="header-title">🏘️ RSocial</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <img src={user.avatar} alt={user.name} className="user-avatar-small" />
            <span className="user-name">{user.name}</span>
          </div>
          
          {unreadCount > 0 && (
            <div className="notification-badge">{unreadCount}</div>
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

