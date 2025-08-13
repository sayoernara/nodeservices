const { dbnss } = require('./dbconfig');

async function insertSession(username, accessToken, refreshToken, ipAddress, userAgent, expiresAt) {
  try {
    var revoke;
    var revokeIPAddress;
    const [rows] = await dbnss.execute(
      `SELECT * FROM user_sessions 
       WHERE username = ? 
         AND login_time >= CURDATE() 
         AND login_time < CURDATE() + INTERVAL 1 DAY 
         AND is_revoked = 0`,
      [username]
    );

    if (rows.length > 0) {
      await dbnss.execute(
        `UPDATE user_sessions 
         SET is_revoked = 1 
         WHERE id = ?`,
        [rows[0].id]
      );
      revokeIPAddress = rows[0].ip_address;
      revoke = true;
    }else{
        revoke = false;
    }

    await dbnss.execute(
      `INSERT INTO user_sessions 
       (username, access_token, refresh_token, ip_address, user_agent, login_time, expires_at, is_revoked) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, 0)`,
      [username, accessToken, refreshToken, ipAddress, userAgent, expiresAt]
    );

    if(revoke === true){
        return {revoke, revokeIPAddress};
    }else{
        return revoke;
    }
  } catch (error) {
    console.error('insertSession error:', error);
    throw error;
  }
}

async function checkSession(accessToken) {
  try {
    const [rows] = await dbnss.execute(
      `SELECT * FROM user_sessions 
       WHERE access_token = ? 
         AND login_time >= CURDATE() 
         AND login_time < CURDATE() + INTERVAL 1 DAY 
         AND is_revoked = 0`,
      [accessToken]
    );

    if (rows.length > 0) {
      return 'valid';
    }else{
      return 'invalid';
    }
  } catch (error) {
    console.error('insertSession error:', error);
    throw error;
  }
}

module.exports = { insertSession, checkSession };
