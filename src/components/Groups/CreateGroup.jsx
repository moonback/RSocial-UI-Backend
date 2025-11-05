import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import groupService from '../../services/groupService';
import './Groups.css';

const CreateGroup = ({ onClose, onGroupCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Rue',
  });

  const groupTypes = ['Rue', 'Immeuble', 'Hobby', 'Autre'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      await groupService.createGroup({
        ...formData,
        location: user.location,
      });

      if (onGroupCreated) {
        onGroupCreated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur création groupe:', error);
      alert('Erreur lors de la création du groupe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Créer un groupe</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label>Nom du groupe *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Résidence Les Lilas"
            />
          </div>

          <div className="form-group">
            <label>Type de groupe *</label>
            <div className="type-selector">
              {groupTypes.map((type) => (
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
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre groupe..."
              rows="4"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer le groupe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;

