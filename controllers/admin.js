const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product({ title, imageUrl, price: Number(price), description });
  product.save(() => {
    res.redirect('/');
  });
};

exports.getEditProduct = (req, res, next) => {
  // TODO: implement this
  res.render('admin/add-edit-product', {
    pageTitle: 'Edit Product',
  });
};

exports.postEditProduct = (req, res, next) => {
  // TODO: implement this
  res.redirect('/');
};

exports.getAdminProducts = (req, res, next) => {
  // TODO: implement this
  Product.fetchAll((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};
