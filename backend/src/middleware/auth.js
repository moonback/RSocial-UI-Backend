import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur depuis Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré'
      });
    }
    return res.status(500).json({
      error: 'Erreur d\'authentification'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();
      
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

