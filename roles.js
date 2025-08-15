const express = require('express')
const app = express();
var jwt = require('jsonwebtoken');
var dn = require('./sqlnss.js');

app.use(express.json())

function clearCookies(res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
}

const sessionCheckMiddleware = async (req, res, next) => {
  let accessToken =
    req.headers["authorization"]?.split(" ")[1] || req.cookies?.accessToken || null;
    
  if (!accessToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  const result = await dn.checkSession(accessToken);
  if (result === "valid") {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.error("Token decode error:", err);
      clearCookies(res);
      return res.status(403).json({ message: "Invalid token signature" });
    }
  } else {
    clearCookies(res);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
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
  sessionCheckMiddleware, generateAccessToken, generateRefreshToken
};