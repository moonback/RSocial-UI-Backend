import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Génération du token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Inscription
export const register = async (req, res) => {
  try {
    const { email, phone, name, password, location } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: 'Un utilisateur avec cet email ou téléphone existe déjà'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = uuidv4();
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        id: userId,
        email,
        phone,
        name,
        password: hashedPassword,
        location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        radius: 3,
        bio: '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Générer le token
    const token = generateToken(newUser.id);

    // Ne pas renvoyer le mot de passe
    delete newUser.password;

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'inscription'
    });
  }
};

// Connexion
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        error: 'Email ou téléphone requis'
      });
    }

    // Trouver l'utilisateur
    let query = supabaseAdmin.from('users').select('*');
    
    if (email) {
      query = query.eq('email', email);
    } else {
      query = query.eq('phone', phone);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    // Ne pas renvoyer le mot de passe
    delete user.password;

    res.json({
      message: 'Connexion réussie',
      token,
      user
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion'
    });
  }
};

// Récupérer l'utilisateur connecté
export const getMe = async (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

// Mettre à jour le profil
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, radius, location } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (radius !== undefined) updates.radius = radius;
    if (location !== undefined) updates.location = location;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    delete data.password;

    res.json({
      message: 'Profil mis à jour',
      user: data
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil'
    });
  }
};

