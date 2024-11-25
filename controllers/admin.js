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
  Product.create({ title, imageUrl, price: Number(price), description })
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
  Product.findByPk(productId)
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
  Product.findByPk(id)
    .then((product) => {
      product.set({
        title,
        description,
        price: Number(price),
        imageUrl,
      });
      return product.save();
    })
    .then(() => {
      res.redirect(`/products/${id}`);
    })
    .catch(next);
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;
  Product.destroy({
    where: { id },
  })
    .then(() => {
      res.redirect(`/admin/products`);
    })
    .catch(next);
};

exports.getAdminProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(next);
};
