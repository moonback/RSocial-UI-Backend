import express from 'express';
import {
  createClassified,
  getClassifieds,
  getClassifiedDetails,
  deleteClassified,
  markAsSold
} from '../controllers/classifiedController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (avec auth optionnelle)
router.get('/', optionalAuth, getClassifieds);
router.get('/:classifiedId', optionalAuth, getClassifiedDetails);

// Routes protégées
router.post('/', authenticate, createClassified);
router.delete('/:classifiedId', authenticate, deleteClassified);
router.put('/:classifiedId/sold', authenticate, markAsSold);

export default router;

