{
    "auth":{
        "checkSessionToday" : "SELECT * FROM user_sessions WHERE username = ? AND login_time >= CURDATE() AND login_time < CURDATE() + INTERVAL 1 DAY AND is_revoked = 0",
        "revokeUser" : "UPDATE user_sessions SET is_revoked = 1 WHERE id = ?",
        "addSession" : "INSERT INTO user_sessions (username, access_token, refresh_token, ip_address, user_agent, login_time, expires_at, is_revoked) VALUES (?, ?, ?, ?, ?, NOW(), ?, 0)",
        "checkSessionByAccess" : "SELECT * FROM user_sessions WHERE access_token = ? AND login_time >= CURDATE() AND login_time < CURDATE() + INTERVAL 1 DAY AND is_revoked = 0",
        "revokeAccess" : "UPDATE user_sessions SET is_revoked = 1 WHERE access_token = ?"
    }
}