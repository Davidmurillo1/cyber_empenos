const mysql = require('mysql2');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('../config');

const pool = mysql.createPool({
    host: 'DB_HOST',
    user: 'DB_USER',
    password: 'DB_PASSWORD',
    port: 'DB_PORT',
    database: 'DB_NAME'
});

module.exports = pool.promise();

