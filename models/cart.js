const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

class Cart {
  static filePath = path.join(rootDir, 'data', 'cart.json');

  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(Cart.filePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
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
      fs.writeFile(Cart.filePath, JSON.stringify(cart), (err) => {
        console.error(err);
      });
    });
  }
}

module.exports = Cart;
