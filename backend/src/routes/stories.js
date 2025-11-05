import express from 'express';
import {
  createStory,
  getStories,
  viewStory,
  deleteStory
} from '../controllers/storyController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/', optionalAuth, getStories);
router.post('/', authenticate, createStory);
router.post('/:storyId/view', authenticate, viewStory);
router.delete('/:storyId', authenticate, deleteStory);

export default router;

