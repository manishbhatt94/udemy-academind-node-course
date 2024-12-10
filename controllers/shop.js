const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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
  Product.fetchAll()
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
      const { items: products } = cart;
      const totalPrice = products.reduce((sum, curr) => {
        return sum + curr.price * curr.quantity;
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
    .getOrders({ include: Product })
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
  let cart = null;
  let cartProducts = [];
  req.user
    .getCart()
    .then((fetchedCart) => {
      cart = fetchedCart;
      return cart.getProducts();
    })
    .then((products) => {
      cartProducts = products;
      return req.user.createOrder();
    })
    .then((order) => {
      const orderedProducts = cartProducts.map((product) => ({
        orderId: order.id,
        productId: product.id,
        quantity: product.cartItem.quantity,
      }));
      return OrderItem.bulkCreate(orderedProducts);
    })
    .then(() => cart.setProducts(null))
    .then(() => res.redirect('/orders'))
    .catch(next);
};
