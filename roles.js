const express = require('express')
const app = express()
var jwt = require('jsonwebtoken')

app.use(express.json())

const authToken = (req, res, next) => {
  const authHeader = req.headers['authorization']?.split(' ')[1] || req.cookies.accessToken;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Token Forbidden!');
    return res.sendStatus(401); // Unauthorized
  }

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token Forbidden!');
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, profile) => {
    if (err) {
      console.log(`JWT Error: ${err.name} - ${err.message}`);

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please re-authenticate' });
      }

      return res.status(403).json({ message: 'Invalid token' }); // JsonWebTokenError
    }

    req.user = profile; // Simpan decoded token ke req.user
    next();
  });
};

function generateRefreshToken(refreshToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return reject(err);
      const accessToken = generateAccessToken({ username: decoded.username });
      resolve(accessToken);
    });
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
}

module.exports = {
  authToken, generateAccessToken, generateRefreshToken
};