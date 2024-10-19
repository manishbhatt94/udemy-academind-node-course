const fs = require('fs');
const path = require('path');

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

  constructor({ title, imageUrl, price, description }) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save(cb) {
    getProductsFromFile((existingProducts) => {
      existingProducts.push(this);
      fs.writeFile(Product.filePath, JSON.stringify(existingProducts), (err) => {
        console.log(err);
        cb(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
}

module.exports = Product;
