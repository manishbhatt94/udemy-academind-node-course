const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

function getCartFromFile(cb) {
  fs.readFile(Cart.filePath, (err, fileContent) => {
    let cart = { products: [], totalPrice: 0 };
    if (err) {
      return cb(err, cart);
    }
    try {
      cart = fileContent ? JSON.parse(fileContent) : cart;
    } catch (err) {
      return cb(err, cart);
    }
    cb(null, cart);
  });
}

function writeCartToFile(cart, cb) {
  fs.writeFile(Cart.filePath, JSON.stringify(cart), (err) => {
    if (err) {
      return cb(err);
    }
    cb();
  });
}

class Cart {
  static filePath = path.join(rootDir, 'data', 'cart.json');

  static addProduct(id, productPrice, cb) {
    // Fetch the previous cart
    getCartFromFile((err, cart) => {
      if (err) {
        return cb(err);
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex((p) => p.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct, qty: existingProduct.qty + 1 };
        cart.products = [
          ...cart.products.slice(0, existingProductIndex),
          updatedProduct,
          ...cart.products.slice(existingProductIndex + 1),
        ];
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + productPrice;
      writeCartToFile(cart, (err) => {
        cb(err ?? null);
      });
    });
  }

  static deleteProduct(id, productPrice, cb) {
    getCartFromFile((err, cart) => {
      if (err) {
        return cb(err);
      }
      const updatedCart = { ...cart };
      const product = updatedCart.products.find((p) => p.id === id);
      if (!product) {
        return cb();
      }
      updatedCart.totalPrice -= product.qty * productPrice;
      updatedCart.products = updatedCart.products.filter((p) => p.id !== id);
      writeCartToFile(updatedCart, (err) => {
        cb(err ?? null);
      });
    });
  }

  static fetchCart(cb) {
    getCartFromFile((err, cart) => {
      if (err) {
        return cb(err);
      }
      cb(null, cart);
    });
  }
}

module.exports = Cart;
