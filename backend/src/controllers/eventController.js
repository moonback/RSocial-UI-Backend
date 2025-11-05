import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateDistance } from '../utils/geolocation.js';

// Créer un événement
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, maxAttendees, image, location } = req.body;
    const userId = req.user.id;

    const eventId = uuidv4();
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert([{
        id: eventId,
        title,
        description,
        date,
        end_date: endDate,
        max_attendees: maxAttendees,
        image,
        location,
        created_by: userId,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        organizer:users!created_by (id, name, avatar)
      `)
      .single();

    if (error) throw error;

    // Ajouter automatiquement le créateur comme participant
    await supabaseAdmin
      .from('event_attendees')
      .insert([{
        id: uuidv4(),
        event_id: eventId,
        user_id: userId,
        joined_at: new Date().toISOString()
      }]);

    res.status(201).json({
      message: 'Événement créé',
      event
    });
  } catch (error) {
    console.error('Erreur createEvent:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'événement'
    });
  }
};

// Récupérer les événements locaux
export const getEvents = async (req, res) => {
  try {
    const { lat, lng, radius = 3, filter = 'all' } = req.query;

    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        organizer:users!created_by (id, name, avatar),
        event_attendees (user_id)
      `)
      .order('date', { ascending: true });

    // Filtrer par date si nécessaire
    if (filter === 'upcoming') {
      query = query.gte('date', new Date().toISOString());
    }

    const { data: events, error } = await query;

    if (error) throw error;

    // Filtrer par distance et ajouter le nombre de participants
    let filteredEvents = events.map(event => ({
      ...event,
      attendees: event.event_attendees?.length || 0,
      isAttending: event.event_attendees?.some(a => a.user_id === req.user?.id) || false
    }));

    if (lat && lng) {
      filteredEvents = filteredEvents.filter(event => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          event.location.lat,
          event.location.lng
        );
        return distance <= parseFloat(radius);
      });
    }

    // Filtrer "mes événements" si demandé
    if (filter === 'my' && req.user) {
      filteredEvents = filteredEvents.filter(event => 
        event.isAttending || event.created_by === req.user.id
      );
    }

    res.json({ events: filteredEvents });
  } catch (error) {
    console.error('Erreur getEvents:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des événements'
    });
  }
};

// RSVP à un événement
export const rsvpEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Vérifier l'événement et le nombre de participants
    const { data: event } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        event_attendees (user_id)
      `)
      .eq('id', eventId)
      .single();

    if (!event) {
      return res.status(404).json({
        error: 'Événement non trouvé'
      });
    }

    // Vérifier si déjà inscrit
    const isAttending = event.event_attendees?.some(a => a.user_id === userId);
    if (isAttending) {
      return res.status(400).json({
        error: 'Vous participez déjà à cet événement'
      });
    }

    // Vérifier si l'événement est complet
    if (event.max_attendees && event.event_attendees?.length >= event.max_attendees) {
      return res.status(400).json({
        error: 'Événement complet'
      });
    }

    // Ajouter comme participant
    const { error } = await supabaseAdmin
      .from('event_attendees')
      .insert([{
        id: uuidv4(),
        event_id: eventId,
        user_id: userId,
        joined_at: new Date().toISOString()
      }]);

    if (error) throw error;

    res.json({ message: 'RSVP confirmé', attending: true });
  } catch (error) {
    console.error('Erreur rsvpEvent:', error);
    res.status(500).json({
      error: 'Erreur lors du RSVP'
    });
  }
};

// Annuler RSVP
export const cancelRsvp = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'RSVP annulé', attending: false });
  } catch (error) {
    console.error('Erreur cancelRsvp:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'annulation du RSVP'
    });
  }
};

// Supprimer un événement
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est le créateur
    const { data: event } = await supabaseAdmin
      .from('events')
      .select('created_by')
      .eq('id', eventId)
      .single();

    if (!event || event.created_by !== userId) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur deleteEvent:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'événement'
    });
  }
};

