{
    "auth":{
        "searchUsername" : "SELECT * FROM akun WHERE username = ?",
        "userInfo" : "SELECT a.nama, a.username, c.role FROM akun as a INNER JOIN akun_has_role as b ON a.id_akun = b.id_akun INNER JOIN role as c ON b.id_role = c.id_role WHERE a.id_akun = ?",
        "checkSessionToday" : "SELECT * FROM user_sessions WHERE username = ? AND login_time >= CURDATE() AND login_time < CURDATE() + INTERVAL 1 DAY AND is_revoked = 0",
        "revokeUser" : "UPDATE user_sessions SET is_revoked = 1 WHERE id = ?",
        "addSession" : "INSERT INTO user_sessions (username, access_token, refresh_token, ip_address, user_agent, login_time, expires_at, is_revoked) VALUES (?, ?, ?, ?, ?, NOW(), ?, 0)",
        "checkSessionByAccess" : "SELECT * FROM user_sessions WHERE access_token = ? AND login_time >= CURDATE() AND login_time < CURDATE() + INTERVAL 1 DAY AND is_revoked = 0",
        "revokeAccess" : "UPDATE user_sessions SET is_revoked = 1 WHERE access_token = ?"
    },
    "goods":{
        "goodsList" : "SELECT a.id_item, a.item as comodity, b.harga_jual as basic_price, d.berat as weight_Gr, c.harga_per_gram as price_per_Gr FROM item as a LEFT OUTER JOIN harga as b ON a.id_item = b.id_item LEFT OUTER JOIN harga_per_gram as c ON b.id_harga = c.id_harga LEFT OUTER JOIN berat as d ON c.id_berat = d.id_berat WHERE d.berat in ('100','250', '500', '1000') AND c.tanggal = (SELECT MAX(c2.tanggal) FROM harga_per_gram AS c2 JOIN harga AS b2 ON c2.id_harga = b2.id_harga WHERE b2.id_item = a.id_item AND c2.id_berat = d.id_berat) ORDER BY a.item ASC"
    }
}