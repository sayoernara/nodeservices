const { dbnss } = require('./dbconfig');

async function insertSession(username) {
  try {
    const [rows] = await db100.execute(
      `SELECT * FROM akun WHERE username = ?`,
      [username] 
    );

    return 'success';
  } catch (error) {
    console.error('insertSession error:', error);
    throw error;
  }
}


module.exports = { insertSession };
