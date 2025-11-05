import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Routes à implémenter selon les besoins
router.get('/', authenticate, async (req, res) => {
  res.json({ groups: [] });
});

router.post('/', authenticate, async (req, res) => {
  res.status(201).json({ message: 'Groupe créé' });
});

export default router;

