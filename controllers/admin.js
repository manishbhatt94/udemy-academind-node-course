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
  const product = new Product({
    title,
    imageUrl,
    price: Number(price),
    description,
    user: req.user,
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
      });
    })
    .catch(next);
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, imageUrl, price, description } = req.body;
  Product.findById(id)
    .then((product) => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = Number(price);
      product.description = description;
      return product.save();
    })
    .then(() => {
      res.redirect(`/products/${id}`);
    })
    .catch(next);
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;
  Product.findByIdAndDelete(id)
    .then(() => {
      res.redirect(`/admin/products`);
    })
    .catch(next);
};

exports.getAdminProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(next);
};
