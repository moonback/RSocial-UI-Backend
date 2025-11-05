import express from 'express';
import {
  createGroup,
  getGroups,
  joinGroup,
  leaveGroup,
  deleteGroup
} from '../controllers/groupController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (avec auth optionnelle)
router.get('/', optionalAuth, getGroups);

// Routes protégées
router.post('/', authenticate, createGroup);
router.post('/:groupId/join', authenticate, joinGroup);
router.post('/:groupId/leave', authenticate, leaveGroup);
router.delete('/:groupId', authenticate, deleteGroup);

export default router;

