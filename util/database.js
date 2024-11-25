const Sequelize = require('sequelize');

const sequelize = new Sequelize('udemytest_database_1', 'dummyduck', 'dummyduck', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
