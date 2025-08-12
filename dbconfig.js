require('dotenv').config();
const mysql = require('mysql2/promise');

// koneksi untuk DB NSS
const dbnss = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.NSSUSER,
    password: process.env.NSSPASS,
    database: process.env.DBNSS,
    port: process.env.DBPORT
});

// koneksi untuk DB 100
const db100 = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.USER100,
    password: process.env.PASS100,
    database: process.env.DB100,
    port: process.env.DBPORT
});

module.exports = { dbnss, db100 };
