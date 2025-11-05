export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    const statusEmoji = status < 400 ? '✅' : '❌';
    console.log(`${statusEmoji} ${method} ${url} - ${status} (${duration}ms)`);
  });
  
  next();
};

