import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  res.json({ classifieds: [] });
});

router.post('/', authenticate, async (req, res) => {
  res.status(201).json({ message: 'Annonce créée' });
});

export default router;

