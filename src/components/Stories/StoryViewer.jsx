import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import storyService from '../../services/storyService';
import { formatRelativeTime } from '../../utils/dateUtils';
import './Stories.css';

const StoryViewer = ({ storyGroup, onClose, onNext, onPrevious }) => {
  const { user } = useAuth();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef(null);
  const storyRef = useRef(null);

  const currentStory = storyGroup.stories[currentStoryIndex];
  const isVideo = currentStory.media_type === 'video';

  useEffect(() => {
    // Marquer comme vue
    if (currentStory && !storyGroup.viewed) {
      storyService.viewStory(currentStory.id).catch(console.error);
    }

    // Démarrer la progression automatique (5 secondes pour images, durée vidéo pour vidéos)
    if (!isVideo) {
      setProgress(0);
      progressIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          setProgress(prev => {
            if (prev >= 100) {
              handleNext();
              return 0;
            }
            return prev + 2; // 5 secondes = 100% à 2% par 100ms
          });
        }
      }, 100);
    } else {
      // Pour les vidéos, on attend la fin de la vidéo
      if (storyRef.current) {
        storyRef.current.addEventListener('ended', handleNext);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (storyRef.current && isVideo) {
        storyRef.current.removeEventListener('ended', handleNext);
      }
    };
  }, [currentStoryIndex, isPaused, isVideo]);

  const handleNext = () => {
    if (currentStoryIndex < storyGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (onNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleProgressClick = (index) => {
    setCurrentStoryIndex(index);
    setProgress(0);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (storyRef.current && isVideo) {
      if (isPaused) {
        storyRef.current.play();
      } else {
        storyRef.current.pause();
      }
    }
  };

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer-content" onClick={(e) => e.stopPropagation()}>
        {/* En-tête avec progression */}
        <div className="story-viewer-header">
          <div className="story-progress-bars">
            {storyGroup.stories.map((story, index) => (
              <div
                key={story.id}
                className="story-progress-bar"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressClick(index);
                }}
              >
                <div
                  className={`story-progress-fill ${index === currentStoryIndex ? 'active' : ''}`}
                  style={{
                    width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="story-viewer-info">
            <div className="story-viewer-user">
              <img
                src={storyGroup.user.avatar}
                alt={storyGroup.user.name}
                className="story-viewer-avatar"
              />
              <div>
                <div className="story-viewer-name">{storyGroup.user.name}</div>
                <div className="story-viewer-time">
                  {formatRelativeTime(currentStory.created_at)}
                </div>
              </div>
            </div>
            <button className="story-viewer-close" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Zone de navigation */}
        <div className="story-viewer-nav-left" onClick={handlePrevious} />
        <div className="story-viewer-nav-right" onClick={handleNext} />

        {/* Contenu de la story */}
        <div className="story-viewer-media">
          {isVideo ? (
            <video
              ref={storyRef}
              src={currentStory.media_url}
              className="story-media"
              autoPlay
              playsInline
              onClick={togglePause}
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="story-media"
              onClick={togglePause}
            />
          )}
          
          {isPaused && (
            <div className="story-pause-indicator">⏸️</div>
          )}
        </div>

        {/* Contrôles */}
        <div className="story-viewer-controls">
          <button
            className="story-control-btn"
            onClick={handlePrevious}
            disabled={currentStoryIndex === 0 && !onPrevious}
          >
            ←
          </button>
          <button
            className="story-control-btn"
            onClick={togglePause}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            className="story-control-btn"
            onClick={handleNext}
            disabled={currentStoryIndex === storyGroup.stories.length - 1 && !onNext}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;

