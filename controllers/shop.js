const path = require('node:path');

const Order = require('../models/order');
const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.find()
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
  Product.find()
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
  Product.findById(productId)
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
  req.user
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
      });
    })
    .catch(next);
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  return Product.findById(productId)
    .then((product) => req.user.addToCart(product))
    .then(() => res.redirect('/cart'))
    .catch(next);
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .deleteProductFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(next);
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
      });
    })
    .catch(next);
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => res.redirect('/orders'))
    .catch(next);
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceFileName = `invoice-${orderId}.pdf`;
      const invoiceFilePath = path.join('data', 'invoices', invoiceFileName);
      res.download(invoiceFilePath, invoiceFileName);
    })
    .catch(next);
  /**
   * Or res.send() the file as a response
   * and set the appropriate headers
   * res.setHeader('Content-Type', 'application/pdf');
   * res.setHeader('Content-Disposition', `inline; filename="${invoiceFileName}"`);
   * or
   * res.setHeader('Content-Disposition', `attachment; filename="${invoiceFileName}"`);
   */
};
