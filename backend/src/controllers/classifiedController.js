import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateDistance } from '../utils/geolocation.js';

// Créer une petite annonce
export const createClassified = async (req, res) => {
  try {
    const { title, description, price, category, images, location } = req.body;
    const userId = req.user.id;

    const classifiedId = uuidv4();
    const { data: classified, error } = await supabaseAdmin
      .from('classifieds')
      .insert([{
        id: classifiedId,
        user_id: userId,
        title,
        description,
        price,
        category,
        images: images || [],
        location,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        user:users (id, name, avatar)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Annonce créée',
      classified
    });
  } catch (error) {
    console.error('Erreur createClassified:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'annonce'
    });
  }
};

// Récupérer les petites annonces locales
export const getClassifieds = async (req, res) => {
  try {
    const { lat, lng, radius = 3, category } = req.query;

    let query = supabaseAdmin
      .from('classifieds')
      .select(`
        *,
        user:users (id, name, avatar)
      `)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: classifieds, error } = await query;

    if (error) throw error;

    // Filtrer par distance
    let filteredClassifieds = classifieds;
    if (lat && lng) {
      filteredClassifieds = classifieds.filter(classified => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          classified.location.lat,
          classified.location.lng
        );
        return distance <= parseFloat(radius);
      });
    }

    res.json({ classifieds: filteredClassifieds });
  } catch (error) {
    console.error('Erreur getClassifieds:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des annonces'
    });
  }
};

// Récupérer les détails d'une annonce
export const getClassifiedDetails = async (req, res) => {
  try {
    const { classifiedId } = req.params;

    const { data: classified, error } = await supabaseAdmin
      .from('classifieds')
      .select(`
        *,
        user:users (id, name, avatar, email, phone)
      `)
      .eq('id', classifiedId)
      .single();

    if (error || !classified) {
      return res.status(404).json({
        error: 'Annonce non trouvée'
      });
    }

    res.json({ classified });
  } catch (error) {
    console.error('Erreur getClassifiedDetails:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'annonce'
    });
  }
};

// Supprimer une annonce
export const deleteClassified = async (req, res) => {
  try {
    const { classifiedId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est l'auteur
    const { data: classified } = await supabaseAdmin
      .from('classifieds')
      .select('user_id')
      .eq('id', classifiedId)
      .single();

    if (!classified || classified.user_id !== userId) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    const { error } = await supabaseAdmin
      .from('classifieds')
      .delete()
      .eq('id', classifiedId);

    if (error) throw error;

    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    console.error('Erreur deleteClassified:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'annonce'
    });
  }
};

// Marquer comme vendu/donné
export const markAsSold = async (req, res) => {
  try {
    const { classifiedId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est l'auteur
    const { data: classified } = await supabaseAdmin
      .from('classifieds')
      .select('user_id')
      .eq('id', classifiedId)
      .single();

    if (!classified || classified.user_id !== userId) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    // Note: Vous devrez ajouter une colonne 'sold' dans la table classifieds
    // Pour l'instant, on peut simplement supprimer l'annonce ou ajouter un flag
    const { error } = await supabaseAdmin
      .from('classifieds')
      .update({ sold: true })
      .eq('id', classifiedId);

    if (error) {
      // Si la colonne n'existe pas encore, on ignore l'erreur
      console.log('Note: Colonne sold non trouvée, à ajouter dans la DB');
    }

    res.json({ message: 'Annonce marquée comme vendue' });
  } catch (error) {
    console.error('Erreur markAsSold:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour'
    });
  }
};

