const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: {},
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  console.log('req.file =>', req.file);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).render('admin/add-edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      editing: false,
      product: { title, imageUrl, price, description },
      hasError: true,
      errorMessage: result.array({ onlyFirstError: true })[0].msg,
      validationErrors: result.mapped(),
    });
  }
  const product = new Product({
    title,
    imageUrl,
    price: Number(price),
    description,
    user: req.session.user,
  });
  product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(next);
};

exports.getEditProduct = (req, res, next) => {
  const { edit: editMode } = req.query;
  if (!editMode) {
    return res.redirect('/');
  }
  const { productId } = req.params;
  Product.findById(productId)
    .then((product) => {
      res.render('admin/add-edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: Boolean(editMode),
        product,
        hasError: false,
        errorMessage: null,
        validationErrors: {},
      });
    })
    .catch(next);
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).render('admin/add-edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Edit Product',
      editing: true,
      product: { _id: id, title, imageUrl, price, description },
      hasError: true,
      errorMessage: result.array({ onlyFirstError: true })[0].msg,
      validationErrors: result.mapped(),
    });
  }
  Product.findById(id)
    .then((product) => {
      if (product.user.toString() !== req.user._id.toString()) {
        return res.redirect('/admin/products');
      }
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = Number(price);
      product.description = description;
      return product.save().then(() => {
        res.redirect(`/products/${id}`);
      });
    })
    .catch(next);
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;
  Product.deleteOne({ _id: id, user: req.user._id })
    .then(() => {
      res.redirect(`/admin/products`);
    })
    .catch(next);
};

exports.getAdminProducts = (req, res, next) => {
  Product.find({ user: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(next);
};
