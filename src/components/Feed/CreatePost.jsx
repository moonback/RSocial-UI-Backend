import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import './Feed.css';

const CreatePost = ({ onClose }) => {
  const { user } = useAuth();
  const { addPost } = useApp();
  const [formData, setFormData] = useState({
    content: '',
    type: 'Annonce',
    images: [],
  });

  const postTypes = ['Annonce', 'Événement', 'Aide', 'Perdu/Trouvé'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Le contenu ne peut pas être vide');
      return;
    }

    addPost({
      ...formData,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      location: user.location,
    });

    onClose();
  };

  const handleImageAdd = () => {
    const url = prompt('URL de l\'image :');
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Créer une publication</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Type de publication</label>
            <div className="type-selector">
              {postTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`type-button ${formData.type === type ? 'type-button-active' : ''}`}
                  onClick={() => setFormData({ ...formData, type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Contenu *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Que voulez-vous partager avec votre quartier ?"
              rows="6"
              className="post-textarea"
            />
          </div>

          {formData.images.length > 0 && (
            <div className="form-group">
              <label>Images</label>
              <div className="image-preview-list">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img} alt="" />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          images: formData.images.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={handleImageAdd}
          >
            📷 Ajouter une image
          </button>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Publier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

