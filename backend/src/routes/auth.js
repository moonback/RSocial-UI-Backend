import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Inscription
router.post('/register',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('phone').isMobilePhone('any').withMessage('Téléphone invalide'),
    body('name').trim().isLength({ min: 2 }).withMessage('Nom requis (min 2 caractères)'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe requis (min 6 caractères)'),
    body('location').isObject().withMessage('Localisation requise')
  ],
  register
);

// Connexion
router.post('/login',
  [
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  login
);

// Profil
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;

