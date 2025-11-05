import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import './Classifieds.css';

const CreateClassified = ({ onClose }) => {
  const { user } = useAuth();
  const { addClassified } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Vente',
    images: [],
  });

  const categories = ['Vente', 'Don', 'Service', 'Recherche'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.price === '' || parseFloat(formData.price) < 0) {
      alert('Veuillez entrer un prix valide (0 pour gratuit)');
      return;
    }

    addClassified({
      ...formData,
      price: parseFloat(formData.price),
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
              Publier l'annonce
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassified;

