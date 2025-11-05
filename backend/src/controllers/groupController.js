import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateDistance } from '../utils/geolocation.js';

// Créer un groupe
export const createGroup = async (req, res) => {
  try {
    const { name, description, type, location } = req.body;
    const userId = req.user.id;

    const groupId = uuidv4();
    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .insert([{
        id: groupId,
        name,
        description,
        type,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        location,
        created_by: userId,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        creator:users!created_by (id, name, avatar)
      `)
      .single();

    if (error) throw error;

    // Ajouter automatiquement le créateur comme membre
    await supabaseAdmin
      .from('group_members')
      .insert([{
        id: uuidv4(),
        group_id: groupId,
        user_id: userId,
        joined_at: new Date().toISOString()
      }]);

    res.status(201).json({
      message: 'Groupe créé',
      group
    });
  } catch (error) {
    console.error('Erreur createGroup:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du groupe'
    });
  }
};

// Récupérer les groupes locaux
export const getGroups = async (req, res) => {
  try {
    const { lat, lng, radius = 3, type } = req.query;

    let query = supabaseAdmin
      .from('groups')
      .select(`
        *,
        creator:users!created_by (id, name, avatar),
        group_members (user_id)
      `)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: groups, error } = await query;

    if (error) throw error;

    // Filtrer par distance et ajouter le nombre de membres
    let filteredGroups = groups.map(group => ({
      ...group,
      members: group.group_members?.length || 0,
      isMember: group.group_members?.some(m => m.user_id === req.user?.id) || false
    }));

    if (lat && lng) {
      filteredGroups = filteredGroups.filter(group => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          group.location.lat,
          group.location.lng
        );
        return distance <= parseFloat(radius);
      });
    }

    res.json({ groups: filteredGroups });
  } catch (error) {
    console.error('Erreur getGroups:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des groupes'
    });
  }
};

// Rejoindre un groupe
export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Vérifier si déjà membre
    const { data: existingMember } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return res.status(400).json({
        error: 'Vous êtes déjà membre de ce groupe'
      });
    }

    // Ajouter comme membre
    const { error } = await supabaseAdmin
      .from('group_members')
      .insert([{
        id: uuidv4(),
        group_id: groupId,
        user_id: userId,
        joined_at: new Date().toISOString()
      }]);

    if (error) throw error;

    res.json({ message: 'Groupe rejoint', joined: true });
  } catch (error) {
    console.error('Erreur joinGroup:', error);
    res.status(500).json({
      error: 'Erreur lors de la tentative de rejoindre le groupe'
    });
  }
};

// Quitter un groupe
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Groupe quitté', joined: false });
  } catch (error) {
    console.error('Erreur leaveGroup:', error);
    res.status(500).json({
      error: 'Erreur lors de la tentative de quitter le groupe'
    });
  }
};

// Supprimer un groupe
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est le créateur
    const { data: group } = await supabaseAdmin
      .from('groups')
      .select('created_by')
      .eq('id', groupId)
      .single();

    if (!group || group.created_by !== userId) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    const { error } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    res.json({ message: 'Groupe supprimé' });
  } catch (error) {
    console.error('Erreur deleteGroup:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du groupe'
    });
  }
};

