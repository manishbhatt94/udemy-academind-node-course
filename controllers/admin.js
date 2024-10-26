const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
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
  const { edit: editMode } = req.query;
  if (!editMode) {
    return res.redirect('/');
  }
  const { productId } = req.params;
  Product.findById(productId, (product) => {
    if (!product) {
      return res.redirect('/product-not-found');
    }
    res.render('admin/add-edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: Boolean(editMode),
      product,
    });
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
