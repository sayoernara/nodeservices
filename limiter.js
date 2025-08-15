const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, 
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.' },
  keyGenerator: (req /*, res*/) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const user = req.body?.username || 'unknown';
    return `${ip}:${user}`;
  },
});

module.exports = { limiter };
