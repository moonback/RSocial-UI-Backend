import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import storyService from '../../services/storyService';
import uploadService from '../../services/uploadService';
import './Stories.css';

const CreateStory = ({ onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Veuillez sélectionner une image ou une vidéo');
      return;
    }

    // Stocker le fichier pour l'upload
    setSelectedFile(file);

    // Créer un aperçu
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
        setMediaType('image');
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(URL.createObjectURL(file));
      setMediaType('video');
    }
  };

  const handleUpload = async () => {
    if (!mediaPreview || !mediaType || !selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setUploading(true);
      
      // Upload le fichier
      let mediaUrl;
      if (mediaType === 'image') {
        mediaUrl = await uploadService.uploadImage(selectedFile);
      } else {
        mediaUrl = await uploadService.uploadVideo(selectedFile);
      }

      // Vérifier que l'utilisateur a une localisation
      if (!user.location || !user.location.lat || !user.location.lng) {
        alert('Veuillez définir votre localisation dans votre profil avant de créer une story');
        return;
      }

      // Créer la story
      setLoading(true);
      await storyService.createStory({
        media_url: mediaUrl,
        media_type: mediaType,
        location: user.location
      });

      if (onStoryCreated) {
        onStoryCreated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur création story:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la création de la story';
      alert(`Erreur : ${errorMessage}`);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setMediaPreview(null);
    setMediaType(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content story-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Créer une story</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="story-create-content">
          {!mediaPreview ? (
            <div className="story-upload-options">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="video-upload"
              />
              
              <button
                className="story-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
              >
                📷 Photo
              </button>
              <button
                className="story-upload-btn"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading || loading}
              >
                🎥 Vidéo
              </button>
            </div>
          ) : (
            <div className="story-preview">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="story-preview-media" />
              ) : (
                <video src={mediaPreview} className="story-preview-media" controls />
              )}
              
              <div className="story-preview-actions">
                <button
                  className="btn-secondary"
                  onClick={handleRemove}
                  disabled={uploading || loading}
                >
                  Retirer
                </button>
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={uploading || loading}
                >
                  {uploading || loading ? 'Publication...' : 'Publier la story'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStory;

