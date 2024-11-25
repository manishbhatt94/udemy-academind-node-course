const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(next);
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(next);
};

exports.getProductDetails = (req, res, next) => {
  const { productId } = req.params;
  Product.findByPk(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: `Shop for ${product.title}`,
        product,
        path: '/products',
      });
    })
    .catch(next);
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
    Product.findAll()
      .then((allProducts) => {
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
      })
      .catch(next);
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

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId, (err, product) => {
    if (err) {
      return next(err);
    }
    Cart.deleteProduct(productId, product.price, (err) => {
      if (err) {
        return next(err);
      }
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
