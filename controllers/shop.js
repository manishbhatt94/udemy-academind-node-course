const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(next);
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(next);
};

exports.getProductDetails = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: `Shop for ${product.title}`,
        product,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(next);
};

exports.getCart = (req, res, next) => {
  req.session.user
    .getCart()
    .then((cart) => {
      const { items } = cart;
      const totalPrice = items.reduce((sum, curr) => {
        return sum + curr.product.price * curr.quantity;
      }, 0);
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        isCartEmpty: !items?.length,
        items,
        totalPrice,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(next);
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  return Product.findById(productId)
    .then((product) => req.session.user.addToCart(product))
    .then(() => res.redirect('/cart'))
    .catch(next);
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.session.user
    .deleteProductFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(next);
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getOrders = (req, res, next) => {
  req.session.user
    .getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(next);
};

exports.postOrder = (req, res, next) => {
  req.session.user
    .addOrder()
    .then(() => res.redirect('/orders'))
    .catch(next);
};
