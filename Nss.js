const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

var dm = require('./sql100.js');
var dn = require('./sqlnss.js');
var roles = require('./roles.js');
var limiter = require('./limiter.js');

const sessionSockets = new Map();
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("registerSession", ({ username, ipAddress }) => {
    const key = `${username}|${ipAddress}`;
    sessionSockets.set(key, socket.id);
    console.log(`Registered session ${key} -> ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (let [key, sockId] of sessionSockets.entries()) {
      if (sockId === socket.id) {
        sessionSockets.delete(key);
        console.log(`Removed session ${key}`);
        break;
      }
    }
  });
});

app.get('/ping', (req, res) => {
  res.status(200).send("pong");
});

app.get('/', (req, res) => {
  res.status(200).json({ message: `Node Single Services` });
});

app.post("/login", limiter, async (req, res) => {
  const { username, password } = req.body;
  const user = await dm.findUser(username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const match = await bcrypt.compare(password, user.hashed_pass);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { password: _pass, id_akun, hashed_pass, ...safeUser } = user;

  let accessToken = roles.generateAccessToken({ username });
  let refreshToken = jwt.sign(
    { userid: username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '24h' }
  );
  const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const newSession = await dn.insertSession(username, accessToken, refreshToken, ipAddress, userAgent, expiresAt);
  if (newSession.revoke === true) {
    const revokeKey = `${username}|${newSession.revokeIPAddress}`;
    const targetSocketId = sessionSockets.get(revokeKey);
    if (targetSocketId) {
      io.to(targetSocketId).emit("forceLogout", {
        message: "Sesi Anda telah berakhir karena login baru."
      });
      console.log(`Force logout sent to ${revokeKey}`);
    }
  }

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 hari
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000 // 15 menit
  });

  return res.status(200).json({
    authData: safeUser,
    message: "Login berhasil"
  });
});

app.get("/sessioncheck", async (req, res) => {
  let accessToken =
    req.headers["authorization"]?.split(" ")[1] || req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  const result = await dn.checkSession(accessToken);
  if (result === "valid") {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      return res.status(200).json({
        message: "Session valid",
        user: decoded
      });
    } catch (err) {
      console.error("Token decode error:", err);
      return res.status(403).json({ message: "Invalid token signature" });
    }
  } else {
    return res
      .status(403)
      .json({ message: "Invalid or expired token" });
  }
});


const HOST = process.env.HOST;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening at http://${HOST}:${PORT}`);
});