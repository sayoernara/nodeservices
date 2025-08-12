const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      code: "RATE_LIMITED",
      retryAfter: `${Math.ceil(15)} minutes`
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;