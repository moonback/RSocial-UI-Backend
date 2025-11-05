import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Récupérer un utilisateur par ID
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar, bio, location, radius, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur getUser:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Rechercher des utilisateurs
router.get('/', authenticate, async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabaseAdmin
      .from('users')
      .select('id, name, email, avatar, location');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: users, error } = await query.limit(20);

    if (error) throw error;

    res.json({ users });
  } catch (error) {
    console.error('Erreur searchUsers:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Récupérer les voisins proches
router.get('/neighbors', authenticate, async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    const userId = req.user.id;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude et longitude requises' });
    }

    // Calculer la distance pour chaque utilisateur (PostGIS)
    const { data: neighbors, error } = await supabaseAdmin.rpc('get_neighbors_within_radius', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_km: parseFloat(radius),
      exclude_user_id: userId
    });

    if (error) {
      console.error('Erreur get_neighbors:', error);
      // Si la fonction PostGIS n'existe pas, utiliser une requête simple
      const { data: allUsers, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id, name, avatar, bio, location, created_at')
        .neq('id', userId);

      if (fetchError) throw fetchError;

      // Calculer la distance côté serveur
      const neighborsWithDistance = allUsers
        .filter(user => user.location)
        .map(user => {
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            user.location.lat,
            user.location.lng
          );
          return { ...user, distance };
        })
        .filter(user => user.distance <= parseFloat(radius))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50);

      return res.json({ neighbors: neighborsWithDistance });
    }

    // Récupérer les statistiques supplémentaires pour chaque voisin
    const enrichedNeighbors = await Promise.all(
      neighbors.map(async (neighbor) => {
        // Compter les posts
        const { count: postsCount } = await supabaseAdmin
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', neighbor.id);

        // Compter les followers
        const { count: followersCount } = await supabaseAdmin
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', neighbor.id);

        return {
          ...neighbor,
          postsCount: postsCount || 0,
          followersCount: followersCount || 0
        };
      })
    );

    res.json({ neighbors: enrichedNeighbors });
  } catch (error) {
    console.error('Erreur getNeighbors:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des voisins' });
  }
});

// Récupérer les suggestions de voisins à suivre
router.get('/suggested', authenticate, async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    const userId = req.user.id;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude et longitude requises' });
    }

    // Récupérer les voisins que l'utilisateur ne suit pas encore
    const { data: following } = await supabaseAdmin
      .from('user_follows')
      .select('following_id')
      .eq('user_id', userId);

    const followingIds = following ? following.map(f => f.following_id) : [];
    followingIds.push(userId); // Exclure l'utilisateur lui-même

    // Récupérer les voisins proches avec activité récente
    const { data: neighbors, error } = await supabaseAdmin.rpc('get_neighbors_within_radius', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_km: parseFloat(radius),
      exclude_user_id: userId
    });

    if (error) {
      // Fallback si la fonction PostGIS n'existe pas
      const { data: allUsers, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id, name, avatar, bio, location, created_at');

      if (fetchError) throw fetchError;

      // Filtrer les utilisateurs non suivis
      const filteredUsers = followingIds.length > 0
        ? allUsers.filter(user => !followingIds.includes(user.id))
        : allUsers;

      const suggestionsWithDistance = filteredUsers
        .filter(user => user.location)
        .map(user => {
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            user.location.lat,
            user.location.lng
          );
          return { ...user, distance };
        })
        .filter(user => user.distance <= parseFloat(radius))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20);

      return res.json({ suggestions: suggestionsWithDistance });
    }

    // Filtrer ceux que l'utilisateur ne suit pas encore
    const suggested = neighbors.filter(n => !followingIds.includes(n.id));

    // Enrichir avec les statistiques
    const enrichedSuggestions = await Promise.all(
      suggested.slice(0, 20).map(async (neighbor) => {
        const { count: postsCount } = await supabaseAdmin
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', neighbor.id);

        const { count: followersCount } = await supabaseAdmin
          .from('user_follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', neighbor.id);

        return {
          ...neighbor,
          postsCount: postsCount || 0,
          followersCount: followersCount || 0
        };
      })
    );

    res.json({ suggestions: enrichedSuggestions });
  } catch (error) {
    console.error('Erreur getSuggested:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des suggestions' });
  }
});

// Récupérer les statistiques du voisinage
router.get('/neighborhood-stats', authenticate, async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude et longitude requises' });
    }

    // Récupérer les voisins
    const { data: neighbors } = await supabaseAdmin.rpc('get_neighbors_within_radius', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_km: parseFloat(radius),
      exclude_user_id: req.user.id
    }).catch(() => ({ data: [] }));

    const totalNeighbors = neighbors?.length || 0;

    // Compter les voisins actifs (avec posts récents)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const neighborIds = neighbors?.map(n => n.id) || [];
    let activeNeighbors = 0;
    if (neighborIds.length > 0) {
      const { data: activePosts } = await supabaseAdmin
        .from('posts')
        .select('user_id')
        .in('user_id', neighborIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      activeNeighbors = new Set(activePosts?.map(p => p.user_id) || []).size;
    }

    // Nouveaux voisins ce mois
    const newNeighbors = neighbors?.filter(n => {
      const created = new Date(n.created_at);
      return created >= thirtyDaysAgo;
    }).length || 0;

    // Distance moyenne
    const distances = neighbors?.map(n => n.distance || 0).filter(d => d > 0) || [];
    const averageDistance = distances.length > 0
      ? distances.reduce((a, b) => a + b, 0) / distances.length
      : 0;

    // Catégories populaires
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('type')
      .in('user_id', neighborIds.length > 0 ? neighborIds : ['00000000-0000-0000-0000-000000000000'])
      .gte('created_at', thirtyDaysAgo.toISOString());

    const categoryCounts = {};
    posts?.forEach(post => {
      categoryCounts[post.type] = (categoryCounts[post.type] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Heures d'activité (simplifié)
    const activityHours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.floor(Math.random() * 10) // À remplacer par une vraie requête
    }));

    const maxActivity = Math.max(...activityHours.map(h => h.activity));

    res.json({
      stats: {
        totalNeighbors,
        activeNeighbors,
        newNeighbors,
        averageDistance,
        topCategories,
        activityHours,
        maxActivity
      }
    });
  } catch (error) {
    console.error('Erreur getNeighborhoodStats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Suivre un voisin
router.post('/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (userId === followerId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même' });
    }

    const { error } = await supabaseAdmin
      .from('user_follows')
      .insert({
        user_id: followerId,
        following_id: userId
      });

    if (error) {
      if (error.code === '23505') { // Duplicate key
        return res.status(400).json({ error: 'Vous suivez déjà cet utilisateur' });
      }
      throw error;
    }

    res.json({ message: 'Utilisateur suivi avec succès' });
  } catch (error) {
    console.error('Erreur follow:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du suivi' });
  }
});

// Ne plus suivre un voisin
router.delete('/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const { error } = await supabaseAdmin
      .from('user_follows')
      .delete()
      .eq('user_id', followerId)
      .eq('following_id', userId);

    if (error) throw error;

    res.json({ message: 'Suivi supprimé avec succès' });
  } catch (error) {
    console.error('Erreur unfollow:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du suivi' });
  }
});

// Fonction utilitaire pour calculer la distance (si PostGIS n'est pas disponible)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

export default router;

