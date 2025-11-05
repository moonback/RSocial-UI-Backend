import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import storyService from '../../services/storyService';
import StoryViewer from './StoryViewer';
import CreateStory from './CreateStory';
import './Stories.css';

const Stories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);

  useEffect(() => {
    loadStories();
  }, [user.location]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const fetchedStories = await storyService.getStories(
        user.location.lat,
        user.location.lng,
        user.radius
      );
      setStories(fetchedStories);
    } catch (error) {
      console.error('Erreur chargement stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (storyGroup) => {
    setSelectedStory(storyGroup);
  };

  const handleStoryClose = () => {
    setSelectedStory(null);
    loadStories(); // Recharger pour mettre à jour les vues
  };

  const handleStoryCreated = () => {
    setShowCreateStory(false);
    loadStories();
  };

  if (loading) {
    return (
      <div className="stories-container">
        <div className="stories-list">
          <div className="story-item-create">
            <div className="story-avatar-placeholder"></div>
            <span>Votre story</span>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="story-item">
              <div className="story-avatar-placeholder"></div>
              <span>Chargement...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="stories-container">
        <div className="stories-list">
          {/* Story "Créer" */}
          <div 
            className="story-item-create"
            onClick={() => setShowCreateStory(true)}
          >
            <div className="story-avatar-wrapper">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="story-avatar"
              />
              <div className="story-add-icon">+</div>
            </div>
            <span className="story-username">Votre story</span>
          </div>

          {/* Stories des autres utilisateurs */}
          {stories.map((storyGroup, index) => (
            <div
              key={storyGroup.user.id || index}
              className={`story-item ${storyGroup.viewed ? 'story-viewed' : ''}`}
              onClick={() => handleStoryClick(storyGroup)}
            >
              <div className="story-avatar-wrapper">
                <img
                  src={storyGroup.user.avatar}
                  alt={storyGroup.user.name}
                  className="story-avatar"
                />
                {storyGroup.stories.length > 1 && (
                  <div className="story-count-badge">{storyGroup.stories.length}</div>
                )}
              </div>
              <span className="story-username">{storyGroup.user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedStory && (
        <StoryViewer
          storyGroup={selectedStory}
          onClose={handleStoryClose}
          onNext={() => {
            const currentIndex = stories.findIndex(
              s => s.user.id === selectedStory.user.id
            );
            if (currentIndex < stories.length - 1) {
              setSelectedStory(stories[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = stories.findIndex(
              s => s.user.id === selectedStory.user.id
            );
            if (currentIndex > 0) {
              setSelectedStory(stories[currentIndex - 1]);
            }
          }}
        />
      )}

      {showCreateStory && (
        <CreateStory
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};

export default Stories;

