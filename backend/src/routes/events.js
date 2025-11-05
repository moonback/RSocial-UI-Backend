import express from 'express';
import {
  createEvent,
  getEvents,
  rsvpEvent,
  cancelRsvp,
  deleteEvent
} from '../controllers/eventController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (avec auth optionnelle)
router.get('/', optionalAuth, getEvents);

// Routes protégées
router.post('/', authenticate, createEvent);
router.post('/:eventId/rsvp', authenticate, rsvpEvent);
router.delete('/:eventId/rsvp', authenticate, cancelRsvp);
router.delete('/:eventId', authenticate, deleteEvent);

export default router;

