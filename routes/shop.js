const express = require('express');

const shopController = require('../controllers/shop');
const errorController = require('../controllers/error');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/products/:productId', shopController.getProductDetails);

router.get('/products', shopController.getProducts);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/product-not-found', errorController.getProductNotFound);

router.get('/', shopController.getIndex);

module.exports = router;
