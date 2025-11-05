export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log pour les requêtes d'authentification
  if (req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/register')) {
    console.log('[requestLogger] ===== NOUVELLE REQUÊTE AUTH =====');
    console.log('[requestLogger] Méthode:', req.method);
    console.log('[requestLogger] URL:', req.originalUrl);
    console.log('[requestLogger] Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? '[présent]' : '[absent]'
    });
    console.log('[requestLogger] Body:', {
      ...req.body,
      password: req.body.password ? `[${req.body.password.length} caractères]` : undefined,
      email: req.body.email || undefined,
      phone: req.body.phone || undefined
    });
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    const statusEmoji = status < 400 ? '✅' : '❌';
    console.log(`${statusEmoji} ${method} ${url} - ${status} (${duration}ms)`);
    
    // Log supplémentaire pour les erreurs d'authentification
    if ((req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/register')) && status >= 400) {
      console.log('[requestLogger] Erreur dans la réponse:', res.statusMessage);
      if (res.locals.error) {
        console.log('[requestLogger] Détails de l\'erreur:', res.locals.error);
      }
    }
  });
  
  next();
};

