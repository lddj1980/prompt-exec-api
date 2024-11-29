const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '108.181.92.76',
  user: 'promptexecusr',
  password: '@5G5l9c1',
  database: 'promptexec',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
