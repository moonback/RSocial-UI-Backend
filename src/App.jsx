import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Feed from './components/Feed/Feed';
import Neighbors from './components/Neighbors/Neighbors';
import MapView from './components/Map/MapView';
import Groups from './components/Groups/Groups';
import Events from './components/Events/Events';
import Classifieds from './components/Classifieds/Classifieds';
import Messages from './components/Messages/Messages';
import Notifications from './components/Notifications/Notifications';
import Profile from './components/Profile/Profile';
import Moderation from './components/Moderation/Moderation';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentView, setCurrentView] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('register')} />
    ) : (
      <Register onToggleMode={() => setAuthMode('login')} />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'feed':
        return <Feed />;
      case 'neighbors':
        return <Neighbors />;
      case 'map':
        return <MapView />;
      case 'groups':
        return <Groups />;
      case 'events':
        return <Events />;
      case 'classifieds':
        return <Classifieds />;
      case 'messages':
        return <Messages />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      case 'moderation':
        return <Moderation />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="app">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-body">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

