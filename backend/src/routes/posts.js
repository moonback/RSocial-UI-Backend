import express from 'express';
import {
  createPost,
  getPosts,
  likePost,
  addComment,
  deletePost
} from '../controllers/postController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (avec auth optionnelle)
router.get('/', optionalAuth, getPosts);

// Routes protégées
router.post('/', authenticate, createPost);
router.post('/:postId/like', authenticate, likePost);
router.post('/:postId/comments', authenticate, addComment);
router.delete('/:postId', authenticate, deletePost);

export default router;

