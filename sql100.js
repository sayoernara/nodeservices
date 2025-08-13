const { db100 } = require('./dbconfig');

async function findUser(username) {
  try {
    const [rows] = await db100.execute(
      `SELECT * FROM akun WHERE username = ?`,
      [username] 
    );

    if (!rows.length) {
      return null;
    }

    const data = rows[0];
    const [infoRows] = await db100.execute(
      `SELECT a.nama, a.username, c.role FROM akun as a INNER JOIN akun_has_role as b ON a.id_akun = b.id_akun INNER JOIN role as c ON b.id_role = c.id_role WHERE a.id_akun = ?`,
      [data.id_akun]
    );

    if (infoRows.length) {
      data.info = infoRows[0];
    } else {
      data.namauser = '';
      data.posisi = '';
    }

    return data;
  } catch (error) {
    console.error('findUser error:', error);
    throw error;
  }
}


module.exports = { findUser };
