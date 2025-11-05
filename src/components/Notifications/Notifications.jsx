import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Notifications.css';

const Notifications = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const getNotificationIcon = (type) => {
    const icons = {
      new_post: '📢',
      new_event: '📅',
      new_message: '💬',
      report_submitted: '⚠️',
      default: '🔔',
    };
    return icons[type] || icons.default;
  };

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h2>Notifications</h2>
          <p>Restez informé de l'activité dans votre quartier</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            className="mark-all-read-btn"
            onClick={markAllNotificationsAsRead}
          >
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>Aucune notification</h3>
            <p>Vous serez notifié des nouvelles activités dans votre quartier</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'notification-read' : 'notification-unread'}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
              {!notification.read && <div className="notification-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;

