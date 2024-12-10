const { ObjectId } = require('mongodb');
const { getDatabase } = require('../util/database');

class User {
  constructor({ _id, name, email, cart }) {
    this.name = name;
    this.email = email;
    this.cart = cart; // { items: [{productId, quantity}] }
    if (_id) {
      this._id = typeof _id === 'string' ? ObjectId.createFromHexString(_id) : _id;
    } else {
      this._id = null;
    }
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
