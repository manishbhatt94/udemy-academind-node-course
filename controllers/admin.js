const path = require('node:path');
const fs = require('node:fs');
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const projectRootPath = require('../util/path');

console.log('projectRootPath:', projectRootPath);

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
  const { title, price, description } = req.body;
  const uploadedImage = req.file;
  if (!uploadedImage) {
    return res.status(422).render('admin/add-edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      editing: false,
      product: { title, price, description },
      hasError: true,
      errorMessage: 'Attached file is not an image.',
      validationErrors: {},
    });
  }

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).render('admin/add-edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      editing: false,
      product: { title, price, description },
      hasError: true,
      errorMessage: result.array({ onlyFirstError: true })[0].msg,
      validationErrors: result.mapped(),
    });
  }
  const product = new Product({
    title,
    imageUrl: '/' + uploadedImage.path,
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
  const { id, title, price, description } = req.body;
  const uploadedImage = req.file;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).render('admin/add-edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Edit Product',
      editing: true,
      product: { _id: id, title, price, description },
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
      if (uploadedImage) {
        deleteProductImageFromFS(product.imageUrl);
        product.imageUrl = '/' + uploadedImage.path;
      }
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
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      deleteProductImageFromFS(product.imageUrl);
      return product.deleteOne();
    })
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

function deleteProductImageFromFS(imageUrl) {
  const imagePath = path.join(projectRootPath, imageUrl.substring(1));
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log('Error deleting image:', err);
    }
  });
}
