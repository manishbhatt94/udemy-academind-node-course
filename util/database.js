const Sequelize = require('sequelize');

const DB_NAME = process.env.NODE_ENV === 'debug' ? 'debug_session_db_01' : 'udemytest_database_1';

const sequelize = new Sequelize(DB_NAME, 'dummyduck', 'dummyduck', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
