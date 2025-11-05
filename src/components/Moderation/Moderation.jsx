import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Moderation.css';

const Moderation = () => {
  const { reports, blockedUsers, unblockUser } = useApp();
  const [activeTab, setActiveTab] = useState('reports');

  return (
    <div className="moderation-container">
      <div className="moderation-header">
        <h2>Modération</h2>
        <p>Gérez les signalements et les utilisateurs bloqués</p>
      </div>

      <div className="moderation-tabs">
        <button
          className={`tab-button ${activeTab === 'reports' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          ⚠️ Signalements ({reports.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'blocked' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          🚫 Utilisateurs bloqués ({blockedUsers.length})
        </button>
      </div>

      <div className="moderation-content">
        {activeTab === 'reports' && (
          <div className="reports-section">
            {reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚠️</div>
                <h3>Aucun signalement</h3>
                <p>Il n'y a aucun signalement en attente</p>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <span className="report-type-badge">
                        {report.type === 'post' && '📢'}
                        {report.type === 'user' && '👤'}
                        {report.type === 'comment' && '💬'}
                        {' '}{report.type}
                      </span>
                      <span className={`report-status-badge status-${report.status}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="report-content">
                      <h4>Raison du signalement</h4>
                      <p>{report.reason}</p>
                    </div>

                    <div className="report-footer">
                      <span className="report-time">
                        {formatRelativeTime(report.createdAt)}
                      </span>
                      <div className="report-actions">
                        <button className="btn-action btn-resolve">
                          ✓ Résoudre
                        </button>
                        <button className="btn-action btn-dismiss">
                          ✗ Ignorer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="blocked-section">
            {blockedUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🚫</div>
                <h3>Aucun utilisateur bloqué</h3>
                <p>Vous n'avez bloqué aucun utilisateur</p>
              </div>
            ) : (
              <div className="blocked-list">
                {blockedUsers.map(userId => (
                  <div key={userId} className="blocked-card">
                    <img
                      src={`https://ui-avatars.com/api/?name=User${userId}&background=random`}
                      alt="User"
                      className="blocked-avatar"
                    />
                    <div className="blocked-info">
                      <div className="blocked-name">Utilisateur {userId}</div>
                      <div className="blocked-note">Utilisateur bloqué</div>
                    </div>
                    <button
                      className="btn-unblock"
                      onClick={() => unblockUser(userId)}
                    >
                      Débloquer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="moderation-info">
        <h3>💡 Conseils de modération</h3>
        <ul>
          <li>Signalez tout contenu inapproprié ou spam</li>
          <li>Les signalements sont anonymes et confidentiels</li>
          <li>L'équipe de modération examine chaque signalement</li>
          <li>Vous pouvez bloquer les utilisateurs indésirables</li>
          <li>Les utilisateurs bloqués ne peuvent pas vous contacter</li>
        </ul>
      </div>
    </div>
  );
};

export default Moderation;

