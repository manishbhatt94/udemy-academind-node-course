const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
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

module.exports = mongoose.model('User', userSchema);
