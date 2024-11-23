const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: 'localhost',
  user: 'dummyduck',
  password: 'dummyduck',
  database: 'udemytest_database_1',
  // waitForConnections: true,
  // connectionLimit: 10,
  // maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  // idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  // queueLimit: 0,
  // enableKeepAlive: true,
  // keepAliveInitialDelay: 0,
});
// dummyduck@172.22.114.121:3306

module.exports = pool.promise();
