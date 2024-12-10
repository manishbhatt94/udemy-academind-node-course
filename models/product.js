const { ObjectId } = require('mongodb');
const { getDatabase } = require('../util/database');

class Product {
  constructor({ title, price, description, imageUrl, _id, userId }) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = _id ? ObjectId.createFromHexString(_id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDatabase();
    if (this._id) {
      return db.collection('products').updateOne(
        { _id: this._id },
        {
          $set: this,
        }
      );
    } else {
      return db.collection('products').insertOne(this);
    }
  }

  static fetchAll() {
    const db = getDatabase();
    return db.collection('products').find({}).toArray();
  }

  static findById(id) {
    const db = getDatabase();
    return db.collection('products').findOne({ _id: ObjectId.createFromHexString(id) });
  }

  static deleteById(id) {
    const db = getDatabase();
    return db.collection('products').deleteOne({ _id: ObjectId.createFromHexString(id) });
  }
}

module.exports = Product;
