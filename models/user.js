const { ObjectId } = require('mongodb');
const { getDatabase } = require('../util/database');

class User {
  constructor({ name, email }) {
    this.name = name;
    this.email = email;
  }

  save() {
    const db = getDatabase();
    return db.collection('users').insertOne(this);
  }

  static findById(id) {
    const db = getDatabase();
    return db.collection('users').findOne({ _id: ObjectId.createFromHexString(id) });
  }
}

module.exports = User;
