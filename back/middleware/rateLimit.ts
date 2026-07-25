import rateLimit from 'express-rate-limit';

// Rate limit general: 100 requests por 15 minutos por IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit estricto para login: 5 intentos por 15 minutos por IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login, intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limit para uploads: 20 uploads por hora por IP
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados uploads, intenta de nuevo en 1 hora' },
  standardHeaders: true,
  legacyHeaders: false,
});
