const fs = require('fs');
const path = require('path');

const createError = require('http-errors');

const rootDir = require('../util/path');
const Cart = require('./cart');

function getProductsFromFile(cb) {
  fs.readFile(Product.filePath, (err, fileContent) => {
    let products = [];
    if (err) {
      return cb(err, products);
    }
    try {
      products = fileContent ? JSON.parse(fileContent) : products;
    } catch (err) {
      return cb(err, products);
    }
    cb(null, products);
  });
}

function writeProductsToFile(products, cb) {
  fs.writeFile(Product.filePath, JSON.stringify(products), (err) => {
    if (err) {
      return cb(err);
    }
    cb();
  });
}

class Product {
  static filePath = path.join(rootDir, 'data', 'products.json');

  constructor({ id, title, imageUrl, price, description }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save(cb) {
    getProductsFromFile((err, existingProducts) => {
      if (err) {
        return cb(err);
      }
      let updatedProducts = [...existingProducts];
      if (this.id) {
        const index = updatedProducts.findIndex((p) => p.id === this.id);
        if (index === -1) {
          const err = createError(400, 'Cannot edit product with invalid productId', {
            expose: true,
          });
          return cb(err);
        }
        updatedProducts[index] = this;
      } else {
        this.id = Math.trunc(Math.random() * 1e8).toString();
        updatedProducts.push(this);
      }
      writeProductsToFile(updatedProducts, (err) => {
        cb(err ?? null);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile((err, products) => {
      if (err) {
        return cb(err);
      }
      cb(null, products);
    });
  }

  static findById(id, cb) {
    getProductsFromFile((err, products) => {
      if (err) {
        return cb(err);
      }
      const product = products.find((p) => p.id === id);
      if (!product) {
        const err = createError(400, 'Cannot find product with invalid productId', {
          expose: true,
          view: 'product-not-found',
        });
        return cb(err);
      }
      cb(null, product);
    });
  }

  static deleteById(id, cb) {
    getProductsFromFile((err, existingProducts) => {
      if (err) {
        return cb(err);
      }
      let product = null;
      const updatedProducts = existingProducts.filter((p) => {
        if (p.id === id) {
          product = p;
          return false;
        }
        return true;
      });
      if (!product) {
        // product not found case
        const err = createError(400, 'Cannot delete product with invalid productId', {
          expose: true,
          view: 'product-not-found',
        });
        return cb(err);
      }
      writeProductsToFile(updatedProducts, (err) => {
        if (err) {
          return cb(err);
        }
        // Now also delete the product from cart
        Cart.deleteProduct(id, product.price, (err) => {
          if (err) {
            console.error(
              'Could not delete product entry from cart after successful product deletion. Error =>',
              err
            );
          }
          cb();
        });
      });
    });
  }
}

module.exports = Product;
