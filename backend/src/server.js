import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import groupRoutes from './routes/groups.js';
import eventRoutes from './routes/events.js';
import classifiedRoutes from './routes/classifieds.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Services
import { initializeSocket } from './services/socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🏘️ RSocial API',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/classifieds', classifiedRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(errorHandler);

// Initialize WebSocket
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📡 WebSocket prêt pour le chat temps réel`);
  console.log(`🌍 CORS activé pour ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

export { io };

