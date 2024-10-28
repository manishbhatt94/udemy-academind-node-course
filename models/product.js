const fs = require('fs');
const path = require('path');

const createError = require('http-errors');

const rootDir = require('../util/path');

function getProductsFromFile(cb) {
  fs.readFile(Product.filePath, (err, fileContent) => {
    let products = [];
    if (err) {
      return cb(products);
    }
    products = fileContent ? JSON.parse(fileContent) : [];
    cb(products);
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
    getProductsFromFile((existingProducts) => {
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
      fs.writeFile(Product.filePath, JSON.stringify(updatedProducts), (err) => {
        console.log(err);
        cb(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
}

module.exports = Product;
