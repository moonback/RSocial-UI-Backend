import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  res.json({ events: [] });
});

router.post('/', authenticate, async (req, res) => {
  res.status(201).json({ message: 'Événement créé' });
});

export default router;

