const mysql = require('mysql2');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('../config');

const pool = mysql.createPool({
    host: DB_HOST,  // Aquí
    user: DB_USER,  // Aquí
    password: DB_PASSWORD,  // Aquí
    port: DB_PORT,  // Aquí
    database: DB_NAME  // Y aquí
});

module.exports = pool.promise();


