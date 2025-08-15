const { dbnss } = require('./dbconfig');
const fs = require('fs');
const path = require('path');
const s = JSON.parse(
  fs.readFileSync(path.join(__dirname, './query/nss.sql'), 'utf8')
);

async function insertSession(username, accessToken, refreshToken, ipAddress, userAgent, expiresAt) {
  try {
    var revoke;
    var revokeIPAddress;
    const [rows] = await dbnss.execute(s.auth.checkSessionToday, [username]);

    if (rows.length > 0) {
      await dbnss.execute(s.auth.revokeUser,[rows[0].id]
      );
      revokeIPAddress = rows[0].ip_address;
      revoke = true;
    } else {
      revoke = false;
    }

    await dbnss.execute(s.auth.addSession, [username, accessToken, refreshToken, ipAddress, userAgent, expiresAt]);

    if (revoke === true) {
      return { revoke, revokeIPAddress };
    } else {
      return revoke;
    }
  } catch (error) {
    console.error('insertSession error:', error);
    throw error;
  }
}

async function checkSession(accessToken) {
  try {
    const [rows] = await dbnss.execute(s.auth.checkSessionByAccess, [accessToken]);

    if (rows.length > 0) {
      return 'valid';
    } else {
      return 'invalid';
    }
  } catch (error) {
    console.error('insertSession error:', error);
    throw error;
  }
}

async function revokeSession(accessToken) {
  try {
    const [rows] = await dbnss.execute(s.auth.revokeAccess, [accessToken]);
    return 'revoke success';
  } catch (error) {
    console.error('revokeSession error:', error);
    throw error;
  }
}

module.exports = { insertSession, checkSession, revokeSession };
