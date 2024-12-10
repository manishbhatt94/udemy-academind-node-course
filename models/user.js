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

  getCart() {
    const db = getDatabase();
    const productIds = this.cart.items.map((item) => item.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        const cartProducts = this.cart.items.map((item, index) => {
          delete products[index]._id;
          delete products[index].userId;
          return { ...item, ...products[index] };
        });
        return { items: cartProducts };
      });
  }

  deleteProductFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    const updatedCart = { items: updatedCartItems };
    const db = getDatabase();
    return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  addOrder() {
    const db = getDatabase();

    return this.getCart()
      .then((cart) => {
        const order = {
          items: cart.items,
          user: {
            _id: this._id,
            name: this.name,
          },
        };
        return db.collection('orders').insertOne(order);
      })
      .then(() => {
        const updatedCart = { items: [] };
        this.cart = updatedCart;
        return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
      });
  }

  getOrders() {
    const db = getDatabase();
    return db.collection('orders').find({ 'user._id': this._id }).toArray();
  }

  static findById(id) {
    const db = getDatabase();
    return db.collection('users').findOne({ _id: ObjectId.createFromHexString(id) });
  }
}

module.exports = User;
