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
  const product = new Product({ id: null, title, imageUrl, price: Number(price), description });
  product.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.getEditProduct = (req, res, next) => {
  const { edit: editMode } = req.query;
  if (!editMode) {
    return res.redirect('/');
  }
  const { productId } = req.params;
  Product.findById(productId, (err, product) => {
    if (err) {
      return next(err);
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
  const { id, title, imageUrl, price, description } = req.body;
  const updatedProduct = new Product({ id, title, imageUrl, price: Number(price), description });
  updatedProduct.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(`/products/${id}`);
  });
};

exports.getAdminProducts = (req, res, next) => {
  Product.fetchAll((err, products) => {
    if (err) {
      return next(err);
    }
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};
