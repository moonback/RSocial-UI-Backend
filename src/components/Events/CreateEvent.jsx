import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import eventService from '../../services/eventService';
import './Events.css';

const CreateEvent = ({ onClose, onEventCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    maxAttendees: '',
    image: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(formData.date) < new Date()) {
      alert("La date de l'événement doit être dans le futur");
      return;
    }

    try {
      setLoading(true);
      await eventService.createEvent({
        ...formData,
        location: user.location,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
      });

      if (onEventCreated) {
        onEventCreated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur création événement:', error);
      alert('Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Créer un événement</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label>Titre de l'événement *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Marché de quartier"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre événement..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date et heure de début *</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Date et heure de fin</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nombre max de participants (optionnel)</label>
            <input
              type="number"
              min="1"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
              placeholder="Illimité si vide"
            />
          </div>

          <div className="form-group">
            <label>URL de l'image (optionnel)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
            {formData.image && (
              <div className="image-preview-single">
                <img src={formData.image} alt="Aperçu" />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

