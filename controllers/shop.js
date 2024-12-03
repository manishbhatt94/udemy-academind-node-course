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
  let cart = null;
  req.user
    .getCart()
    .then((cartFromDatabase) => {
      cart = cartFromDatabase;
      return cart.getProducts();
    })
    .then((products) => {
      console.log(JSON.stringify({ products }, null, 2));
      console.log(JSON.stringify({ cart }, null, 2));
      const totalPrice = products.reduce((sum, curr) => {
        return sum + curr.price * curr.cartItem.quantity;
      }, 0);
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        isCartEmpty: !products?.length,
        products,
        totalPrice,
      });
    })
    .catch(next);
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  let cart = null;
  let existingProduct = false;
  req.user
    .getCart()
    .then((fetchedCart) => {
      cart = fetchedCart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      if (products?.length > 0) {
        existingProduct = true;
        return products[0];
      }
      return Product.findByPk(productId);
    })
    .then((product) => {
      if (existingProduct) {
        return product.cartItem.increment('quantity');
      }
      return cart.addProduct(product, {
        through: { quantity: 1 },
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(next);
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
