const mongoose = require('mongoose');

const Order = require('./order');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function addToCart(product) {
  const { _id: productId } = product;
  const { items: cartItems } = this.cart;
  let updatedCartItems = [...cartItems];
  let newProductQuantity = 1;
  const existingItemIndex = cartItems.findIndex((item) => {
    return productId.toString() === item.product.toString(); // item.product contains product ID only
  });
  if (existingItemIndex > -1) {
    // product already exists in cart - need to increment quantity
    newProductQuantity = cartItems[existingItemIndex].quantity + 1;
    updatedCartItems[existingItemIndex].quantity = newProductQuantity;
  } else {
    // product doesn't already exist in cart
    updatedCartItems.push({ product: productId, quantity: newProductQuantity });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.getCart = function getCart() {
  return this.populate({
    path: 'cart.items.product',
    select: '-user',
  }).then((user) => user.cart);
};

userSchema.methods.deleteProductFromCart = function deleteProductFromCart(productId) {
  const updatedCartItems = this.cart.items.filter((item) => item.product.toString() !== productId);
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.addOrder = function addOrder() {
  if (!this.cart.items.length) {
    throw new Error('Cannot create order with empty cart');
  }
  return this.populate({
    path: 'cart.items.product',
    select: '-user',
  })
    .then((user) => {
      const items = user.cart.items.map((item) => {
        const { _id, title, price, description, imageUrl } = item.product;
        return {
          product: { _id, title, price, description, imageUrl },
          quantity: item.quantity,
        };
      });
      const order = new Order({ user, items });
      return order.save();
    })
    .then(() => {
      this.cart = { items: [] };
      return this.save();
    });
};

userSchema.methods.getOrders = function getOrders() {
  return Order.find({ user: this });
};

module.exports = mongoose.model('User', userSchema);
