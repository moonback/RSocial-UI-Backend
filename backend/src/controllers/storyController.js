import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateDistance } from '../utils/geolocation.js';

// Créer une story
export const createStory = async (req, res) => {
  try {
    const { media_url, media_type, location } = req.body;
    const userId = req.user.id;

    if (!media_url || !media_type) {
      return res.status(400).json({
        error: 'URL du média et type requis'
      });
    }

    if (!['image', 'video'].includes(media_type)) {
      return res.status(400).json({
        error: 'Type de média invalide (image ou video)'
      });
    }

    // Calculer la date d'expiration (24h)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const storyId = uuidv4();
    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .insert([{
        id: storyId,
        user_id: userId,
        media_url,
        media_type,
        location: location || null,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Erreur Supabase lors de l\'insertion:', error);
      // Si la table n'existe pas, donner un message plus clair
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        throw new Error('La table stories n\'existe pas. Veuillez exécuter le script d\'initialisation de la base de données.');
      }
      throw error;
    }

    // Récupérer les infos utilisateur
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, avatar')
      .eq('id', userId)
      .single();

    res.status(201).json({
      message: 'Story créée',
      story: {
        ...story,
        users: user
      }
    });
  } catch (error) {
    console.error('Erreur createStory:', error);
    console.error('Détails de l\'erreur:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({
      error: error.message || 'Erreur lors de la création de la story',
      details: error.details || error.hint || null
    });
  }
};

// Récupérer les stories locales
export const getStories = async (req, res) => {
  try {
    const { lat, lng, radius = 3 } = req.query;
    const userId = req.user?.id;

    // Récupérer toutes les stories non expirées
    const now = new Date().toISOString();
    const { data: stories, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Filtrer par distance si coordonnées fournies
    let filteredStories = stories || [];
    if (lat && lng) {
      filteredStories = stories.filter(story => {
        if (!story.location) return false;
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          story.location.lat,
          story.location.lng
        );
        return distance <= parseFloat(radius);
      });
    }

    // Récupérer les informations des utilisateurs
    const userIds = [...new Set(filteredStories.map(s => s.user_id))];
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, avatar')
      .in('id', userIds);

    const usersMap = new Map(users?.map(u => [u.id, u]) || []);

    // Grouper les stories par utilisateur
    const storiesByUser = {};
    filteredStories.forEach(story => {
      const userId = story.user_id;
      if (!storiesByUser[userId]) {
        storiesByUser[userId] = {
          user: usersMap.get(userId) || { id: userId, name: 'Utilisateur', avatar: '' },
          stories: [],
          viewed: false
        };
      }
      storiesByUser[userId].stories.push(story);
    });

    // Vérifier quelles stories ont été vues par l'utilisateur connecté
    if (userId) {
      const storyIds = filteredStories.map(s => s.id);
      if (storyIds.length > 0) {
        const { data: views } = await supabaseAdmin
          .from('story_views')
          .select('story_id')
          .eq('user_id', userId)
          .in('story_id', storyIds);

        const viewedStoryIds = new Set(views?.map(v => v.story_id) || []);
        
        Object.keys(storiesByUser).forEach(userId => {
          const allViewed = storiesByUser[userId].stories.every(
            story => viewedStoryIds.has(story.id)
          );
          storiesByUser[userId].viewed = allViewed;
        });
      }
    }

    // Trier par date (plus récent en premier)
    const storiesList = Object.values(storiesByUser).sort((a, b) => {
      const aDate = new Date(a.stories[0].created_at);
      const bDate = new Date(b.stories[0].created_at);
      return bDate - aDate;
    });

    res.json({ stories: storiesList });
  } catch (error) {
    console.error('Erreur getStories:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des stories'
    });
  }
};

// Marquer une story comme vue
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Vérifier que la story existe et n'est pas expirée
    const { data: story } = await supabaseAdmin
      .from('stories')
      .select('id, expires_at')
      .eq('id', storyId)
      .single();

    if (!story) {
      return res.status(404).json({
        error: 'Story introuvable'
      });
    }

    const now = new Date();
    const expiresAt = new Date(story.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({
        error: 'Story expirée'
      });
    }

    // Ajouter la vue (ou ignorer si déjà vue)
    const { error } = await supabaseAdmin
      .from('story_views')
      .insert([{
        id: uuidv4(),
        story_id: storyId,
        user_id: userId,
        viewed_at: new Date().toISOString()
      }], {
        onConflict: 'story_id,user_id'
      });

    if (error && error.code !== '23505') { // Ignorer l'erreur de duplication
      throw error;
    }

    res.json({ message: 'Story marquée comme vue' });
  } catch (error) {
    console.error('Erreur viewStory:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'enregistrement de la vue'
    });
  }
};

// Supprimer une story
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Vérifier que la story appartient à l'utilisateur
    const { data: story } = await supabaseAdmin
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single();

    if (!story || story.user_id !== userId) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    const { error } = await supabaseAdmin
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Story supprimée' });
  } catch (error) {
    console.error('Erreur deleteStory:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la story'
    });
  }
};

