import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import classifiedService from '../../services/classifiedService';
import uploadService from '../../services/uploadService';
import './Classifieds.css';

const CreateClassified = ({ onClose, onClassifiedCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Vente',
    images: [],
  });

  const categories = ['Vente', 'Don', 'Service', 'Recherche'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.price === '' || parseFloat(formData.price) < 0) {
      alert('Veuillez entrer un prix valide (0 pour gratuit)');
      return;
    }

    try {
      setLoading(true);
      await classifiedService.createClassified({
        ...formData,
        price: parseFloat(formData.price),
        location: user.location,
      });

      if (onClassifiedCreated) {
        onClassifiedCreated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur création annonce:', error);
      alert('Erreur lors de la création de l\'annonce');
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
          <h3>Créer une annonce</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-classified-form">
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Vélo enfant à vendre"
            />
          </div>

          <div className="form-group">
            <label>Catégorie *</label>
            <div className="type-selector">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`type-button ${formData.category === category ? 'type-button-active' : ''}`}
                  onClick={() => setFormData({ ...formData, category })}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Prix (€) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0 pour gratuit"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre annonce en détail..."
              rows="5"
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
            <label htmlFor="classified-images-upload" className="btn-secondary" style={{ cursor: 'pointer' }}>
              {uploading ? '📤 Upload...' : '📷 Ajouter des images'}
            </label>
            <input
              id="classified-images-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || uploading}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading || uploading}>
              {loading ? 'Publication...' : "Publier l'annonce"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassified;

