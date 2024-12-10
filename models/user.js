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

  addToCart(product) {
    const { _id: productId } = product;
    const { items: cartItems } = this.cart;
    let updatedCartItems = [...cartItems];
    let newProductQuantity = 1;
    const existingItemIndex = cartItems.findIndex((item) => {
      return productId.toString() === item.productId.toString();
    });
    if (existingItemIndex > -1) {
      // product already exists in cart - need to increment quantity
      newProductQuantity = cartItems[existingItemIndex].quantity + 1;
      updatedCartItems[existingItemIndex].quantity = newProductQuantity;
    } else {
      // product doesn't already exist in cart
      updatedCartItems.push({ productId, quantity: newProductQuantity });
    }
    const updatedCart = { items: updatedCartItems };
    const db = getDatabase();
    return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  static findById(id) {
    const db = getDatabase();
    return db.collection('users').findOne({ _id: ObjectId.createFromHexString(id) });
  }
}

module.exports = User;
