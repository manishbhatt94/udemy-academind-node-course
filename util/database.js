const { MongoClient } = require('mongodb');

const URL = 'mongodb://localhost:27017';
const DB_NAME = 'test_database_01';

const client = new MongoClient(URL);

let _db = null;

function mongoConnect() {
  return client.connect().then(() => {
    console.log('Connected to Mongo database');
    _db = client.db(DB_NAME);
  });
}

function getDatabase() {
  if (_db) {
    return _db;
  }
  throw new Error('Database reference not available before connecting');
}

module.exports = {
  mongoConnect,
  getDatabase,
};
