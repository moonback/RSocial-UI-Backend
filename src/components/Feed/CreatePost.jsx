import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/postService';
import uploadService from '../../services/uploadService';
import './Feed.css';

const CreatePost = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    content: '',
    type: 'Annonce',
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const postTypes = ['Annonce', 'Événement', 'Aide', 'Perdu/Trouvé'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Le contenu ne peut pas être vide');
      return;
    }

    try {
      setLoading(true);
      await postService.createPost({
        content: formData.content,
        type: formData.type,
        images: formData.images,
        location: user.location,
      });

      if (onPostCreated) {
        onPostCreated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur création post:', error);
      alert('Erreur lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    try {
      setUploading(true);
      const urls = await uploadService.uploadImages(files);
      setFormData({
        ...formData,
        images: [...formData.images, ...urls],
      });
    } catch (error) {
      console.error('Erreur upload images:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
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

          <div className="form-group">
            <label htmlFor="image-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
              {uploading ? '⏳ Upload en cours...' : '📷 Ajouter des images'}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading || loading}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || uploading}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading || uploading}>
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

