{
    "auth":{
        "userNameCheck" : "SELECT * FROM akun WHERE username = ?",
        "userInfo" : "SELECT a.nama, a.username, c.role FROM akun as a INNER JOIN akun_has_role as b ON a.id_akun = b.id_akun INNER JOIN role as c ON b.id_role = c.id_role WHERE a.id_akun = ?"
    }
}