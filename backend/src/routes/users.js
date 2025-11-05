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

export default router;

