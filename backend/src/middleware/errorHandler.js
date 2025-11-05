export const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.errors
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Erreur d\'authentification'
    });
  }

  // Erreur Supabase
  if (err.code && err.message) {
    return res.status(400).json({
      error: err.message
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne'
  });
};

