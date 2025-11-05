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
    console.log('[authController] ===== DÉBUT LOGIN =====');
    console.log('[authController] Requête reçue:', {
      method: req.method,
      url: req.url,
      body: {
        ...req.body,
        password: req.body.password ? `[${req.body.password.length} caractères]` : '(vide)'
      }
    });

    const { email, phone, password } = req.body;

    console.log('[authController] Données extraites:', {
      email: email || '(vide)',
      phone: phone || '(vide)',
      passwordLength: password?.length || 0,
      hasPassword: !!password
    });

    if (!email && !phone) {
      console.log('[authController] ERREUR: Email et téléphone manquants');
      return res.status(400).json({
        error: 'Email ou téléphone requis'
      });
    }

    // Trouver l'utilisateur
    console.log('[authController] Recherche de l\'utilisateur...');
    let user = null;
    let queryError = null;
    
    if (email) {
      // Normaliser l'email (minuscules, sans espaces)
      const normalizedEmail = email.toLowerCase().trim();
      console.log('[authController] Recherche par email:', email);
      console.log('[authController] Email normalisé:', normalizedEmail);
      
      // Récupérer tous les utilisateurs et chercher avec comparaison insensible à la casse
      // (Plus sûr que de compter sur la casse exacte dans la base de données)
      const { data: allUsers, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*');
      
      if (fetchError) {
        console.log('[authController] Erreur lors de la récupération des utilisateurs:', fetchError);
        queryError = fetchError;
      } else {
        // Chercher l'utilisateur avec email insensible à la casse
        user = allUsers?.find(u => 
          u.email && u.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (user) {
          console.log('[authController] Utilisateur trouvé avec recherche insensible à la casse');
          console.log('[authController] Email trouvé dans la base:', user.email);
        } else {
          console.log('[authController] Aucun utilisateur trouvé avec cet email');
          console.log('[authController] Emails disponibles (premiers 5):', 
            allUsers?.slice(0, 5).map(u => u.email).join(', ') || 'Aucun utilisateur dans la base'
          );
        }
      }
    } else {
      console.log('[authController] Recherche par téléphone:', phone);
      // Normaliser le téléphone (supprimer les espaces)
      const normalizedPhone = phone.replace(/\s+/g, '').trim();
      const { data: foundUser, error: phoneError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .single();
      
      user = foundUser;
      queryError = phoneError;
    }

    console.log('[authController] Résultat de la requête Supabase:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userPhone: user?.phone,
      hasPassword: !!user?.password,
      error: queryError
    });

    if (queryError || !user) {
      console.log('[authController] ERREUR: Utilisateur non trouvé');
      console.log('[authController] Détails de l\'erreur:', queryError);
      console.log('[authController] Suggestion: Vérifiez que l\'utilisateur existe dans la base de données');
      
      // Si c'est une erreur PGRST116 (aucun résultat), suggérer de créer un compte
      if (queryError?.code === 'PGRST116') {
        console.log('[authController] L\'email ou le téléphone n\'existe pas dans la base de données');
        console.log('[authController] Email recherché:', email || '(vide)');
        console.log('[authController] Téléphone recherché:', phone || '(vide)');
      }
      
      return res.status(401).json({
        error: 'Identifiants invalides - Email ou mot de passe incorrect'
      });
    }

    if (!user.password) {
      console.log('[authController] ERREUR: Utilisateur sans mot de passe');
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    console.log('[authController] Vérification du mot de passe...');
    console.log('[authController] Mot de passe reçu:', password ? `[${password.length} caractères]` : '(vide)');
    console.log('[authController] Hash stocké:', user.password ? `[${user.password.substring(0, 20)}...]` : '(vide)');
    
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log('[authController] Résultat de la comparaison:', isValidPassword);

    if (!isValidPassword) {
      console.log('[authController] ERREUR: Mot de passe invalide');
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
    }

    // Générer le token
    console.log('[authController] Génération du token JWT...');
    const token = generateToken(user.id);
    console.log('[authController] Token généré:', token ? `[${token.substring(0, 20)}...]` : '(vide)');

    // Ne pas renvoyer le mot de passe
    delete user.password;

    console.log('[authController] Connexion réussie pour l\'utilisateur:', user.id);
    console.log('[authController] ===== FIN LOGIN (SUCCÈS) =====');

    res.json({
      message: 'Connexion réussie',
      token,
      user
    });
  } catch (error) {
    console.error('[authController] ===== ERREUR LOGIN =====');
    console.error('[authController] Type d\'erreur:', error.constructor.name);
    console.error('[authController] Message:', error.message);
    console.error('[authController] Stack:', error.stack);
    console.error('[authController] ===== FIN ERREUR =====');
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

