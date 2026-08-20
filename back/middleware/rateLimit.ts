import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

const skipEnTest = () => process.env.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { ok: false, error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipEnTest,
});

export const loginLimiter = rateLimit({
  windowMs,
  max: maxAttempts,
  message: { ok: false, error: 'Demasiados intentos de login, intenta en 15 minutos', code: 'LOGIN_LOCKOUT' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipEnTest,
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      error: 'Demasiados intentos de login. Intenta en 15 minutos.',
      code: 'LOGIN_LOCKOUT'
    });
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { ok: false, error: 'Demasiados uploads, intenta de nuevo en 1 hora', code: 'RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipEnTest,
});
