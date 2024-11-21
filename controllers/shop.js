const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll((err, products) => {
    if (err) {
      return next(err);
    }
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((err, products) => {
    if (err) {
      return next(err);
    }
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  });
};

exports.getProductDetails = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId, (err, product) => {
    if (err) {
      return next(err);
    }
    res.render('shop/product-detail', {
      pageTitle: `Shop for ${product.title}`,
      product,
      path: '/products',
    });
  });
};

exports.getCart = (req, res, next) => {
  Cart.fetchCart((err, cart) => {
    if (err) {
      return next(err);
    }
    if (!cart?.products?.length) {
      return res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        isCartEmpty: true,
      });
    }
    Product.fetchAll((err, allProducts) => {
      if (err) {
        return next(err);
      }
      const productCart = { value: cart.totalPrice, items: [] };
      for (const item of cart.products) {
        const info = allProducts.find((p) => p.id === item.id);
        productCart.items.push({ info, qty: item.qty });
      }
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        isCartEmpty: false,
        cart: productCart,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId, (err, product) => {
    if (err) {
      return next(err);
    }
    Cart.addProduct(productId, product.price, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/cart');
    });
  });
};

      res.redirect('/cart');
    });
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
  });
};
