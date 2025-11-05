import React from 'react';
import { useApp } from '../../contexts/AppContext';
import './Layout.css';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { notifications, posts, messages } = useApp();
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;
  const myPosts = posts.length;

  const menuItems = [
    { id: 'feed', icon: '🏠', label: 'Fil d\'actualités', badge: null },
    { id: 'map', icon: '🗺️', label: 'Carte', badge: null },
    { id: 'groups', icon: '👥', label: 'Groupes', badge: null },
    { id: 'events', icon: '📅', label: 'Événements', badge: null },
    { id: 'classifieds', icon: '🏷️', label: 'Petites annonces', badge: null },
    { id: 'messages', icon: '💬', label: 'Messages', badge: unreadMessages },
    { id: 'notifications', icon: '🔔', label: 'Notifications', badge: unreadNotifications },
    { id: 'profile', icon: '👤', label: 'Mon profil', badge: null },
    { id: 'moderation', icon: '⚠️', label: 'Modération', badge: null },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? 'sidebar-item-active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                onClose();
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

