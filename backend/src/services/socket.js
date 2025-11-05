import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
  // Middleware d'authentification pour Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentification requise'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur connecté: ${socket.userId}`);

    // Joindre la room de l'utilisateur pour recevoir les messages
    socket.join(`user_${socket.userId}`);

    // Événement: utilisateur en train d'écrire
    socket.on('typing', ({ receiverId }) => {
      socket.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    // Événement: utilisateur a arrêté d'écrire
    socket.on('stop_typing', ({ receiverId }) => {
      socket.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Événement: utilisateur en ligne
    socket.on('online', () => {
      socket.broadcast.emit('user_online', {
        userId: socket.userId
      });
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur déconnecté: ${socket.userId}`);
      socket.broadcast.emit('user_offline', {
        userId: socket.userId
      });
    });
  });

  return io;
};

