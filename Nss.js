const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');


var dm = require('./sql100.js');
var roles  = require('./roles.js');
var limiter = require('./limiter.js');


app.get('/ping', (req, res) => {
  res.status(200).send("pong");
});

app.get('/', (req, res) => {
  res.sendStatus(204);
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

  return res.status(201).json({
    authData: safeUser,
    accessToken,
    refreshToken
  });
});

const HOST = process.env.HOST;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://${HOST}:${PORT}`);
});